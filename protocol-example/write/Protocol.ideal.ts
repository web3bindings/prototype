// !NOTE: This code assumes the presence of a write-semantics/runtime library.
//        Given the time constraints of this hackathon, implementing this runtime is out of scope.
//        Please view this file as an ideal development environment that will be functional
//        in the future.
import {
  IPFS,
  Contracts,
  Logger,
  TxParser,
  Network,
  Entity,
  Address,
  Output,
  Account
} from "@web3bindings/write-semantics/runtime";

export interface Founder {
  address: string;
  reputation: number;
}

async function createDAO(
  name: string,
  founders: Founder[],
  entity: Entity
) {
  entity.typeCheck("DAONetwork");

  // 1.
  Logger.info("Deploying a new Reputation contract...");
  const reputation = await Contracts.Reputation.new();
  Logger.info(`Reputation deployed to ${reputation.address}`);

  // 2.
  Logger.info("Minting reputation to the founders...");
  for (const founder of founders) {
    Logger.info(`Minting ${founder.reputation} to ${founder.address}...`);

    const tx = await reputation.mint(founder.address, founder.reputation);
    const to = TxParser.getEventValue(tx, "Mint", "_to");
    const amount = TxParser.getEventValue(tx, "Mint", "_amount");
    Logger.info(`Minted ${amount} to ${to}`);
  }

  // 3.
  Logger.info("Transfer the Reputation's ownership to the DAONetwork...");
  const daoNetworkAddress = await entity.getData("address");
  const daoNetwork = Contracts.DAONetwork.at(daoNetworkAddress);
  await reputation.transferOwnership(daoNetwork.address);

  // 4.
  Logger.info("Deploying a new Avatar contract...");
  const avatar = await Contracts.Avatar.new(name, reputation.address);
  Logger.info(`Avatar deployed to ${avatar.address}`);

  // 5.
  Logger.info("Transfer the Avatar's ownership to the DAONetwork...");
  await avatar.transferOwnership(daoNetwork.address);

  // 6.
  Logger.info("Create a new DAO in the network...");
  await daoNetwork.newDAO(avatar.address);

  // 7.
  Logger.info("Register our founders...");
  for (const founder of founders) {
    await daoNetwork.registerFounder(avatar.address, founder.address);
    Logger.info(`Registered ${founder.address} within the DAO at ${avatar.address}`);
  }

  Output.add({
    reputation: reputation.address,
    daoAddress: avatar.address
  });
}

async function createProposal(
  title: string,
  description: string,
  reputationChange: number,
  beneficiary: Address,
  entity: Entity
) {
  entity.typeCheck("DAO");

  // 1.
  Logger.info("Validating data...");
  // Simple: Check length
  if (title.length > 256) {
    Logger.error("Title is too long");
    return;
  }

  // Complex: Pass this by a sanitization service
  const resp = await Network.GET(`https://sanitize.net?text={${title}}`);
  if (!resp.body.valid) {
    Logger.error(`Title is invalid: ${resp.body.error}`);
    return;
  }

  // 2.
  Logger.info("Uploading data to IPFS...");
  const hash = await IPFS.upload({
    title,
    description
  });
  Logger.info(`Uploaded data to ${hash}`);

  // 3.
  Logger.info("Create the proposal...");
  const daoAddress = await entity.getData("address");
  const daoNetworkEntity = await entity.getConnection("network");
  const daoNetworkAddress = await daoNetworkEntity.getData("address");
  const daoNetwork = Contracts.DAONetwork.at(daoNetworkAddress);
  const tx = await daoNetwork.createProposal(
    daoAddress,
    hash,
    reputationChange,
    beneficiary
  );
  const proposalId = TxParser.getEventValue(
    tx, "ReputationProposalCreated", "_proposalId"
  );
  Logger.info(`Proposal ID: ${proposalId}`);
  Output.add({ proposalId });
}

async function voteOnProposal(
  entity: Entity
) {
  entity.typeCheck("Proposal");

  // 1.
  Logger.info("Ensure the account has REP in the DAO...");
  const daoEntity = await entity.getConnection("dao");
  const daoAddress = await daoEntity.getData("address");
  const repAddress = await daoEntity.getData("reputation");
  const reputation = Contracts.Reputation.at(repAddress);
  const balance = await reputation.balanceOf(Account.address);
  if (balance <= 0) {
    Logger.error(`The address ${Account.address} does not hold any rep in this dao.`);
    return;
  }

  // 2.
  Logger.info(`Casting a vote on behalf of ${Account.address} for the amount of ${balance} REP...`);
  const daoNetworkEntity = await daoEntity.getConnection("network");
  const daoNetworkAddress = await daoNetworkEntity.getData("address");
  const daoNetwork = Contracts.DAONetwork.at(daoNetworkAddress);
  const proposalId = await entity.getData("id");
  const tx = await daoNetwork.vote(
    daoAddress,
    proposalId
  );

  const votesFor = TxParser.getEventValue(
    tx, "VoteCast", "_votesFor"
  );

  Output.add({
    votesFor,
    totalRep: await reputation.totalSupply()
  });
}

async function rewardReputation(
  amount: number,
  entity: Entity
) {
  entity.typeCheck("Member");

  // 1.
  Logger.log("Validate amount...");
  if (amount <= 0) {
    Logger.error("Invalid reward amount. Must be greater than zero.");
    return;
  }

  const memberAddress = await entity.getData("address");
  const daoEntity = await entity.getConnection("dao");

  // 2.
  await createProposal(
    `${amount} REP -> ${memberAddress}`,
    `${Account.address} wants to reward ${memberAddress} with ${amount} reputation.`,
    amount,
    memberAddress,
    daoEntity
  );
}

async function slashReputation(
  amount: number,
  entity: Entity
) {
  entity.typeCheck("Member");

  // 1.
  Logger.log("Validate amount...");
  if (amount >= 0) {
    Logger.error("Invalid slash amount. Must be less than zero.");
    return;
  }

  const memberAddress = await entity.getData("address");
  const daoEntity = await entity.getConnection("dao");

  // 2.
  await createProposal(
    `${amount} REP -> ${memberAddress}`,
    `${Account.address} wants to slash ${memberAddress} by ${amount} reputation.`,
    amount,
    memberAddress,
    daoEntity
  );
}

const DAONetwork = {
  createDAO
};

const DAO = {
  createProposal
};

const ReputationProposal = {
  voteOnProposal
};

const Member = {
  rewardReputation,
  slashReputation
};

export {
  DAONetwork,
  DAO,
  ReputationProposal,
  Member
};
