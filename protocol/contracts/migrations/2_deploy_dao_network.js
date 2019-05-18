const DAONetwork = artifacts.require("./DAONetwork.sol");
const fs = require("fs");

module.exports = async function(deployer) {
  await deployer.deploy(DAONetwork)
  const daoNetwork = await DAONetwork.deployed();

  // save the address in migration.json
  fs.writeFileSync(`${__dirname}/../migration.json`, JSON.stringify({
    "private": {
      "DAONetwork": daoNetwork.address
    }
  }, undefined, 2), "utf-8");
}
