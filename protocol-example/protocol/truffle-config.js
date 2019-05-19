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
      version: "0.5.4",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
