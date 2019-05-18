module.exports = {
  networks: {
    development: {
      network_id: "*",
      host: "localhost",
      port: 8545
    }
  },
  compilers: {
    solc: {
      version: "0.5.4",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
