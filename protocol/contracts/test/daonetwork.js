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

const registerFounder = async function(founder) {
  return await daoNetwork.registerFounder(avatar.address, founder);
}

const createProposal = async function(accounts, repChange=-500) {
  return await daoNetwork.createProposal(
    avatar.address,
    "0x12345",
    repChange,
    accounts[2]
  );
}

const vote = async function(proposalId, from) {
  return await daoNetwork.vote(avatar.address, proposalId, { from });
}

const executeProposal = async function(proposalId) {
  return await daoNetwork.executeProposal(avatar.address, proposalId);
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

  it("registerFounder", async function() {
    await setup(accounts);
    await deployDAO();

    const tx = await registerFounder(accounts[0]);

    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "RegisterFounder");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar"),
      avatar.address
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_founder"),
      accounts[0]
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

    const tx = await vote(proposalId, accounts[0]);

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

  it("vote twice, same user, failure", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts),
      "_proposalId",
      undefined
    );
    await vote(proposalId, accounts[0]);

    try {
      await vote(proposalId, accounts[0]);
      assert.fail("Voting twice should fail");
    } catch (e) { }
  });

  it("vote twice, different users", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts),
      "_proposalId",
      undefined
    );
    await vote(proposalId, accounts[0]);

    const tx = await vote(proposalId, accounts[1]);

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
      accounts[1]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_amount"),
      500
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_votesFor"),
      1000
    );
  });

  it("executeProposal", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts),
      "_proposalId",
      undefined
    );
    await vote(proposalId, accounts[0]);
    await vote(proposalId, accounts[1]);

    const tx = await executeProposal(proposalId);

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "ReputationProposalExecuted");
    assert.equal(tx.logs[1].event, "BurnReputation");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar", "ReputationProposalExecuted"),
      avatar.address
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_proposalId", "ReputationProposalExecuted"),
      proposalId
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_sender", "BurnReputation"),
      accounts[0]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_from", "BurnReputation"),
      accounts[2]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_amount", "BurnReputation"),
      500
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar", "BurnReputation"),
      avatar.address
    );
  });

  it("executeProposal, not passable, failure", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts),
      "_proposalId",
      undefined
    );
    await vote(proposalId, accounts[0]);

    try {
      await executeProposal(proposalId);
      assert.fail("Executing without quorum should fail");
    } catch(e) { }
  });

  it("executeProposal, mint works as well", async function() {
    await setup(accounts);
    await deployDAO();
    const proposalId = helpers.getValueFromLogs(
      await createProposal(accounts, 500),
      "_proposalId",
      undefined
    );
    await vote(proposalId, accounts[0]);
    await vote(proposalId, accounts[1]);

    const tx = await executeProposal(proposalId);

    assert.equal(tx.logs.length, 2);
    assert.equal(tx.logs[0].event, "ReputationProposalExecuted");
    assert.equal(tx.logs[1].event, "MintReputation");
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar", "ReputationProposalExecuted"),
      avatar.address
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_proposalId", "ReputationProposalExecuted"),
      proposalId
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_sender", "MintReputation"),
      accounts[0]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_to", "MintReputation"),
      accounts[2]
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_amount", "MintReputation"),
      500
    );
    assert.equal(
      helpers.getValueFromLogs(tx, "_avatar", "MintReputation"),
      avatar.address
    );
  });
});
