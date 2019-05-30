import { getOptions, getWeb3, sendQuery } from "./util";

const Reputation = require("@web3bindings/protocol-example-contracts/build/contracts/Reputation.json");
const Avatar = require("@web3bindings/protocol-example-contracts/build/contracts/Avatar.json");
const DAONetwork = require("@web3bindings/protocol-example-contracts/build/contracts/DAONetwork.json");
const DAONetworkAddress = require("@web3bindings/protocol-example-contracts/migration.json")["private"]["DAONetwork"].toLowerCase();

describe("DAONetwork", () => {
  let web3;
  let opts;
  let daoNetwork;
  let reputation;
  let reputationAddress;
  let avatar;
  let avatarAddress;
  let accounts;
  const orgName = "foo";

  const deployContract = (abi: any, args: any[]) => {
    return new web3.eth.Contract(abi.abi, undefined, opts)
      .deploy({
        data: abi.bytecode,
        arguments: args
      }).send();
  };

  beforeAll(async () => {
    web3 = await getWeb3();
    opts = await getOptions(web3);
    accounts = web3.eth.accounts.wallet;

    daoNetwork = new web3.eth.Contract(DAONetwork.abi, DAONetworkAddress, opts);

    // Deploy & Mint Reputation
    reputation = await deployContract(Reputation, []);
    reputationAddress = reputation.options.address.toLowerCase();
    await reputation.methods.mint(accounts[0].address, 500).send();
    await reputation.methods.mint(accounts[1].address, 500).send();
    await reputation.methods.mint(accounts[2].address, 500).send();

    // Deploy Avatar
    avatar = await deployContract(Avatar, [orgName, reputation.options.address]);
    avatarAddress = avatar.options.address.toLowerCase();

    // Transfer ownership to DAONetwork
    await reputation.methods.transferOwnership(DAONetworkAddress).send();
    await avatar.methods.transferOwnership(DAONetworkAddress).send();

    // Register the new DAO
    await daoNetwork.methods.newDAO(avatarAddress).send();

    // Register the founders
    await daoNetwork.methods.registerFounders(avatarAddress, [
      accounts[0].address, accounts[1].address, accounts[2].address
    ]).send();
  });

  it("DAONetwork Entity Verification", async () => {
    const { daoNetwork } = await sendQuery(`{
      daoNetwork(id: "${DAONetworkAddress}") {
        id
        address
        daos {
          id
        }
      }
    }`, 3000);

    expect(daoNetwork.id).toEqual(DAONetworkAddress);
    expect(daoNetwork.address).toEqual(DAONetworkAddress);
  });

  it("DAO Entity Verification", async () => {

  });

  it("Member Entity Verification", async () => {

  });

  it("Reputation Entity Verification", async () => {

  });

  // TODO: Proposals & voting
});
