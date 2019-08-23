const withTM = require("next-transpile-modules");

module.exports = withTM({
  transpileModules: ["@amcharts/amcharts4"],
  webpack(config, options) {
    if (options.dev) {
      config.devtool = "cheap-module-eval-source-map";
    }
    return config;
  },
  exportPathMap: function() {
    return {
      "/": { page: "/" }
    };
  }
});
