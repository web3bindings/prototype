# Protocol - Write Semantics
## Description
typescript write semantics that compile to a wasm module

## Build

### prerequisite

```
npm install --save-dev AssemblyScript/assemblyscript
```

Ensure that you have `asc` in your `$PATH`, eg.

```
PATH="~/node_modules/assemblyscript/bin/:${PATH}"
```

### build wasm module

```
npm run asbuild
```

to generate `build/protocol.wasm`

TODO: document the runtime interface the write semantic standard will support
TODO: document the POM (Protocol Object Model) that gets exported by this module
