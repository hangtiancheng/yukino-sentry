// webpack.config.mjs
import { sentryPlugin } from "@yukino.js/sentry/webpack";

export default {
  plugins: [sentryPlugin({ dsn: "/api/log" })],
  devServer: {/* your config */},
};
