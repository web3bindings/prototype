import { Address, BigInt, Bytes, store, ipfs, json, JSONValueKind } from "@graphprotocol/graph-ts";
import { DAO, ReputationProposal as Proposal } from "../types/schema";
import { equalStrings } from "../utils";

function getProposal(id: string): Proposal {
  let proposal = store.get("ReputationProposal", id) as Proposal;
  if (proposal == null) {
    proposal = new Proposal(id);
  }
  return proposal;
}

function saveProposal(proposal: Proposal): void {
  store.set("ReputationProposal", proposal.id, proposal);
}

function fetchIPFSData(proposal: Proposal): void {
  // IPFS reading
  if (!equalStrings(proposal.descriptionHash, '') && equalStrings(proposal.title, '')) {
    let ipfsData = ipfs.cat('/ipfs/' + proposal.descriptionHash);
    if (ipfsData != null && ipfsData.toString() !== '{}') {
      let descJson = json.fromBytes(ipfsData as Bytes);
      if (descJson.kind !== JSONValueKind.OBJECT) {
        return;
      }
      if (descJson.toObject().get('title') != null) {
        proposal.title = descJson.toObject().get('title').toString();
      }
      if (descJson.toObject().get('description') != null) {
        proposal.description = descJson.toObject().get('description').toString();
      }
    }
  }
}

export function insertNewProposal(
  createdAt: BigInt,
  avatarAddress: Address,
  proposalId: Bytes,
  proposer: Address,
  descriptionHash: string,
  reputationChange: BigInt,
  beneficiary: Address
): Proposal {
  let proposal = getProposal(proposalId.toHex());
  let dao = store.get("DAO", avatarAddress.toHex()) as DAO;
  proposal.dao = dao.id;
  proposal.active = true;
  proposal.proposer = proposer;
  proposal.createdAt = createdAt;
  proposal.descriptionHash = descriptionHash;
  proposal.beneficiary = beneficiary;
  proposal.reputationChange = reputationChange;
  fetchIPFSData(proposal);
  saveProposal(proposal);
  return proposal;
}

export function executeProposal(
  executedAt: BigInt,
  proposalId: Bytes
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.active = false;
  proposal.executedAt = executedAt;
  saveProposal(proposal);
}

export function updateProposal(
  proposalId: Bytes,
  votesFor: BigInt
): void {
  let proposal = getProposal(proposalId.toHex());
  proposal.votesFor = votesFor;
}
