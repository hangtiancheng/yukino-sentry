import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { test } from "node:test";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);

function run(code, args = []) {
  return new Promise((done) => {
    execFile(
      process.execPath,
      [...args, "--input-type=module", "-e", code],
      {
        cwd: packageRoot,
        timeout: 8000,
      },
      (error, stdout, stderr) =>
        done({
          code: error ? (error.code ?? error.signal ?? 1) : 0,
          stdout,
          stderr,
        }),
    );
  });
}

const transport = `
  globalThis.fetch = async (_url, options) => {
    console.log(options.body);
    return new Response(null, { status: 204 });
  };
  const sdk = await import("@yukino.js/sentry/node");
`;

function messages(stdout) {
  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => JSON.parse(line))
    .map((event) => event.message);
}

test("ESM and CJS exports deliver reports and clean up on Node 18 APIs", async () => {
  for (const load of [
    'await import("@yukino.js/sentry/node")',
    'createRequire(import.meta.url)("@yukino.js/sentry/node")',
  ]) {
    const result = await run(`
      import { createRequire } from "node:module";
      Array.prototype.toReversed = undefined;
      delete globalThis.navigator;
      delete globalThis.crypto;
      globalThis.fetch = async (_url, options) => {
        console.log(options.body);
        return new Response(null, { status: 204 });
      };
      const sdk = ${load};
      sdk.init({ dsn: "https://example.test/log" });
      sdk.traceError(new Error("package-smoke"));
      await sdk.flush();
      sdk.destroy();
    `);
    assert.equal(result.code, 0, result.stderr);
    assert.deepEqual(messages(result.stdout), ["package-smoke"]);
  }
});

test("built entry delivers JSON through native fetch to a real HTTP endpoint", async () => {
  const received = [];
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    received.push({
      method: request.method,
      type: request.headers["content-type"],
      events: JSON.parse(body),
    });
    response.writeHead(204).end();
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  try {
    const dsn = `http://127.0.0.1:${server.address().port}/api/log`;
    const result = await run(`
      const sdk = await import("@yukino.js/sentry/node");
      sdk.init({ dsn: ${JSON.stringify(dsn)}, projectId: "node-integration" });
      sdk.traceError(new Error("native-fetch"));
      await sdk.flush();
      sdk.destroy();
    `);
    assert.equal(result.code, 0, result.stderr);
    assert.equal(received.length, 1);
    assert.equal(received[0].method, "POST");
    assert.equal(received[0].type, "application/json");
    assert.equal(received[0].events[0].message, "native-fetch");
    assert.equal(received[0].events[0].projectId, "node-integration");
  } finally {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
});

test("fatal errors await async hooks and all queued batches before exiting", async () => {
  const result = await run(`${transport}
    sdk.init({
      dsn: "https://example.test/log",
      cacheMaxLength: 1,
      beforeSend: async (event) => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return event;
      },
    });
    sdk.traceCustomEvent({ name: "queued", message: "before-crash" });
    setTimeout(() => { throw new Error("fatal-crash"); }, 0);
  `);
  assert.equal(result.code, 1, result.stderr);
  assert.deepEqual(messages(result.stdout), ["before-crash", "fatal-crash"]);
});

test("strict rejections exit once, independent of uncaught exception options", async () => {
  const result = await run(`${transport}
    sdk.init({
      dsn: "https://example.test/log",
      enableError: false,
      exitOnUncaughtException: false,
      repeatCodeError: true,
    });
    Promise.reject("fatal-rejection");
  `);
  assert.equal(result.code, 1, result.stderr);
  assert.deepEqual(messages(result.stdout), ["fatal-rejection"]);
});

test("fatal timeout works without any other event-loop handles", async () => {
  const result = await run(`${transport}
    sdk.init({
      dsn: "https://example.test/log",
      beforeSend: () => new Promise(() => {}),
    });
    setTimeout(() => { throw new Error("blocked-hook"); }, 0);
  `);
  assert.equal(result.code, 1, result.stderr);
  assert.match(result.stderr, /blocked-hook/);
});

test("Node entry does not import browser setup, fingerprinting, or plugins", async () => {
  const visited = new Set();
  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = await readFile(file, "utf8");
    for (const [, dependency] of source.matchAll(
      /\b(?:from|import)\s*["']([^"']+)["']/g,
    )) {
      assert.doesNotMatch(dependency, /fingerprint|rrweb|web-vitals/);
      if (dependency.startsWith("."))
        await visit(resolve(dirname(file), dependency));
    }
  }
  await visit(join(packageRoot, "dist/node/index.js"));
  assert.ok(visited.size > 10);
  assert.ok(!visited.has(join(packageRoot, "dist/core/setup.js")));
  assert.ok(!visited.has(join(packageRoot, "dist/core/browser-identity.js")));
});

test("published Node declarations typecheck without lib.dom or skipLibCheck", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sentry-node-types-"));
  try {
    await writeFile(
      join(directory, "index.mts"),
      `
      import { init, traceError, flush } from ${JSON.stringify(join(packageRoot, "dist/node/index.js"))};
      init({ dsn: "https://example.test/log" });
      traceError(new Error("typecheck"));
      await flush();
    `,
    );
    await writeFile(
      join(directory, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          lib: ["ES2022"],
          types: ["node"],
          typeRoots: [join(packageRoot, "node_modules/@types")],
          strict: true,
          noEmit: true,
          skipLibCheck: false,
        },
        include: ["index.mts"],
      }),
    );
    await new Promise((done, fail) => {
      execFile(
        process.execPath,
        [require.resolve("typescript/bin/tsc"), "-p", directory],
        { timeout: 15000 },
        (error, stdout, stderr) => {
          if (error) fail(new Error(stdout + stderr));
          else done();
        },
      );
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
