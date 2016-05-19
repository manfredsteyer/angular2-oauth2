System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "none",
  paths: {},

  packages: {
    "oauth2": {
      "format": "register",
      "defaultExtension": "js"
    }
  },

  map: {
    "base64-js": "node_modules/base64-js/lib/b64.js",
    "buffer": "node_modules/buffer/index.js",
    "convert-hex": "node_modules/convert-hex/convert-hex.js",
    "convert-string": "node_modules/convert-string/convert-string.js",
    "ieee754": "node_modules/ieee754/index.js",
    "isarray": "node_modules/isarray/index.js",
    "js-base64": "node_modules/js-base64/base64.js",
    "sha256": "node_modules/sha256/lib/sha256.js"
  }
});
