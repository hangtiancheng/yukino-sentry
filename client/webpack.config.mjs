import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import PageRoutesPlugin from "./plugins/webpack-plugin-page-routes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const displayNameLoader = resolve(
  __dirname,
  "plugins/webpack-loader-react-display-name.js",
);

const htmlTemplate = readFileSync(
  resolve(__dirname, "index.html"),
  "utf8",
).replace(/\s*<script type="module" src="\/src\/main\.tsx"><\/script>/, "");

export default (env, argv) => {
  const isDev = argv.mode !== "production";

  const config = {
    mode: isDev ? "development" : "production",
    entry: "./src/main.tsx",
    devtool: isDev ? "source-map" : "hidden-source-map",
    output: {
      path: resolve(__dirname, "dist-webpack"),
      filename: isDev ? "[name].js" : "[name].[contenthash:8].js",
      sourceMapFilename: ".sourcemaps/[file].map",
      publicPath: "/",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@": resolve(__dirname, "src"),
      },
      extensionAlias: {
        ".js": [".ts", ".tsx", ".js"],
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx$/,
          use: [
            {
              loader: "esbuild-loader",
              options: { loader: "tsx", jsx: "automatic", target: "es2020" },
            },
            ...(isDev ? [] : [displayNameLoader]),
          ],
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: "esbuild-loader",
              options: { loader: "ts", target: "es2020" },
            },
            ...(isDev ? [] : [displayNameLoader]),
          ],
        },
        {
          test: /\.css$/,
          use: [
            isDev ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: { plugins: ["@tailwindcss/postcss"] },
              },
            },
          ],
        },
        {
          test: /\.(svg|png|jpe?g|gif|webp|woff2?)$/,
          type: "asset",
        },
      ],
    },
    plugins: [
      new PageRoutesPlugin(),
      new HtmlWebpackPlugin({ templateContent: htmlTemplate }),
      new CopyWebpackPlugin({
        patterns: [{ from: "public", to: ".", noErrorOnMissing: true }],
      }),
      ...(isDev
        ? []
        : [
            new MiniCssExtractPlugin({
              filename: "[name].[contenthash:8].css",
            }),
          ]),
    ],
  };

  if (env?.WEBPACK_SERVE) {
    config.devServer = {
      port: 5174,
      historyApiFallback: true,
      client: { overlay: false },
      proxy: [
        {
          context: ["/api", "/static"],
          target: "http://localhost:8088",
          changeOrigin: true,
        },
      ],
    };
  }

  return config;
};
