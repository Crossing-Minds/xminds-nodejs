const path = require("path")

module.exports = {
    entry: "./lib/index.js",
    output: {
        filename: "xminds-sdk-nodejs",
        path: path.resolve(__dirname, "dist"),
        library: "XmindsClient"
    }
}
