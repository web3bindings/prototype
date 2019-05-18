const helpers = require("./helpers");
const Avatar = artifacts.require("./Avatar.sol");
const Reputation = artifacts.require("./Reputation.sol");
const DAONetwork = artifacts.require("./DAONetwork.sol");

let daoNetwork;
let reputation;
let avatar;

const setup = async function(accounts) {
  daoNetwork = await DAONetwork.new();
  reputation = await Reputation.new();
  await reputation.mint(accounts[0], 500);
  await reputation.mint(accounts[1], 500);
  await reputation.mint(accounts[3], 500);
  await reputation.transferOwnership(daoNetwork.address);
  avatar = await Avatar.new("Test DAO", reputation.address);
  await avatar.transferOwnership(daoNetwork.address);
}

const deployDAO = async function() {
  return await daoNetwork.newDAO(avatar.address);
}

const createProposal = async function(accounts) {
  return await daoNetwork.createProposal(
    avatar.address,
    "0x12345",
    -500,
    accounts[2]
  );
}

const vote = async function(proposalId) {
  return await daoNetwork.vote(avatar.address, proposalId);
}

contract("DAONetwork", accounts => {

  it("newDAO", async function() {
    await setup(accounts);

    const tx = await deployDAO();

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewDAO");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar"),
      avatar.address
    );
  });

  it("createProposal", async function() {
    await setup(accounts);
    await deployDAO();

    const tx = await createProposal(accounts);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "ReputationProposalCreated");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar"),
      avatar.address
    );
    assert.notEqual(
      helpers.getValueFromLogs(tx, "_proposalId"),
      undefined
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_proposer"),
      accounts[0]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_descriptionHash"),
      "0x12345"
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_reputationChange"),
      -500
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_beneficiary"),
      accounts[2]
    );
  });

  it("vote", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts),
      "_proposalId",
      undefined
    );

    const tx = await vote(proposalId);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "VoteCast");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar"),
      avatar.address
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_proposalId"),
      proposalId
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_voter"),
      accounts[0]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_amount"),
      500
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_votesFor"),
      500
    );
  });
});
