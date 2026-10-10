// @ts-check

import { transformSync, types as t } from "@babel/core";

const WRAPPER_CALLEES = new Set(["memo", "forwardRef", "createContext"]);

const METADATA_KEY = "reactDisplayNamesInjected";

function isComponentName(name) {
  return /^[A-Z]/.test(name);
}

function isWrapperCall(node) {
  if (!t.isCallExpression(node)) return false;
  const { callee } = node;
  if (t.isIdentifier(callee)) return WRAPPER_CALLEES.has(callee.name);
  return (
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.object, { name: "React" }) &&
    t.isIdentifier(callee.property) &&
    WRAPPER_CALLEES.has(callee.property.name)
  );
}

function containsJsx(path) {
  let found = false;
  path.traverse({
    JSXElement(p) {
      found = true;
      p.stop();
    },
    JSXFragment(p) {
      found = true;
      p.stop();
    },
  });
  return found;
}

function displayNameStatement(name) {
  return t.expressionStatement(
    t.assignmentExpression(
      "=",
      t.memberExpression(t.identifier(name), t.identifier("displayName")),
      t.stringLiteral(name),
    ),
  );
}

function collectManualDisplayNames(program) {
  const manual = new Set();
  for (const stmt of program.body) {
    if (
      t.isExpressionStatement(stmt) &&
      t.isAssignmentExpression(stmt.expression, { operator: "=" }) &&
      t.isMemberExpression(stmt.expression.left) &&
      t.isIdentifier(stmt.expression.left.object) &&
      t.isIdentifier(stmt.expression.left.property, { name: "displayName" })
    ) {
      manual.add(stmt.expression.left.object.name);
    }
  }
  return manual;
}

const displayNameBabelPlugin = {
  name: "add-react-display-name",
  visitor: {
    Program(programPath, state) {
      let injected = 0;

      const manual = collectManualDisplayNames(programPath.node);

      for (const stmtPath of programPath.get("body")) {
        let declPath = stmtPath;
        if (
          stmtPath.isExportNamedDeclaration() ||
          stmtPath.isExportDefaultDeclaration()
        ) {
          const inner = stmtPath.get("declaration");
          if (!inner.node) continue;
          declPath = inner;
        }

        const names = [];
        if (declPath.isFunctionDeclaration()) {
          const name = declPath.node.id?.name;
          if (
            name &&
            isComponentName(name) &&
            !manual.has(name) &&
            containsJsx(declPath)
          ) {
            names.push(name);
          }
        } else if (declPath.isVariableDeclaration()) {
          for (const declarator of declPath.get("declarations")) {
            const { id } = declarator.node;
            if (
              !t.isIdentifier(id) ||
              !isComponentName(id.name) ||
              manual.has(id.name)
            ) {
              continue;
            }
            const init = declarator.get("init");
            if (!init.node) continue;
            const isPlainComponent =
              (t.isArrowFunctionExpression(init.node) ||
                t.isFunctionExpression(init.node)) &&
              containsJsx(init);
            if (isWrapperCall(init.node) || isPlainComponent) {
              names.push(id.name);
            }
          }
        }

        for (const name of names) {
          stmtPath.insertAfter(displayNameStatement(name));
          injected += 1;
        }
      }

      state.file.metadata[METADATA_KEY] = injected;
    },
  },
};

export function transformDisplayName(code, file) {
  if (file.includes("/node_modules/") || file.endsWith(".d.ts")) return null;
  const isJsxFile = /\.[jt]sx$/.test(file);
  if (!isJsxFile && !file.endsWith(".ts")) return null;
  if (!isJsxFile && !/\b(?:memo|forwardRef|createContext)\b/.test(code)) {
    return null;
  }

  const result = transformSync(code, {
    filename: file,
    babelrc: false,
    configFile: false,
    browserslistConfigFile: false,
    parserOpts: {
      sourceType: "module",
      plugins: isJsxFile ? ["typescript", "jsx"] : ["typescript"],
    },
    generatorOpts: { retainLines: true },
    plugins: [displayNameBabelPlugin],
    sourceMaps: true,
  });
  if (!result?.code) return null;
  const metadata = result.metadata ?? {};
  if (!metadata[METADATA_KEY]) return null;
  return { code: result.code, map: result.map };
}
