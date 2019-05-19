const fs = require("fs");
const compiled = new WebAssembly.Module(fs.readFileSync(__dirname + "/build/Protocol.wasm"));
const imports = {};
module.exports.get = () => new WebAssembly.Instance(compiled, imports).exports
