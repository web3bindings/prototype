import {
  NewDAO,
  RegisterFounder,
  MintReputation,
  BurnReputation,
  ReputationProposalCreated,
  ReputationProposalExecuted,
  VoteCast
} from "../../types/DAONetwork/DAONetwork";
import {
  insertNewDAO
} from "./dao";
import {
  updateTotalSupply
} from "./reputation";
import {
  insertNewMember,
  addReputation,
  subReputation
} from "./member";
import {
  insertNewProposal,
  executeProposal,
  updateProposal
} from "./reputationProposal";
import {
  insertNewVote
} from "./vote";
import {
  eventId
} from "../utils";

export function handleNewDAO(event: NewDAO): void {
  insertNewDAO(event.address, event.params._avatar);
}

export function handleRegisterFounder(event: RegisterFounder): void {
  updateTotalSupply(event.params._avatar);
  insertNewMember(event.params._avatar, event.params._founder);
}

export function handleMintReputation(event: MintReputation): void {
  updateTotalSupply(event.params._avatar);
  addReputation(event.params._to, event.params._amount);
}

export function handleBurnReputation(event: BurnReputation): void {
  updateTotalSupply(event.params._avatar);
  subReputation(event.params._from, event.params._aount);
}

export function handleReputationProposalCreated(event: ReputationProposalCreated): void {
  insertNewProposal(
    event.block.timestamp,
    event.params._avatar,
    event.params._proposalId,
    event.params._proposer,
    event.params._descriptionHash,
    event.params._reputationChange,
    event.params._beneficiary
  );
}

export function handleReputationProposalExecuted(event: ReputationProposalExecuted): void {
  executeProposal(
    event.block.timestamp,
    event.params._proposalId
  );
}

export function handleVoteCast(event: VoteCast): void {
  insertNewVote(
    eventId(event),
    event.block.timestamp,
    event.params._avatar,
    event.params._proposalId,
    event.params._voter,
    event.params._amount
  );
  updateProposal(
    event.params._proposalId,
    event.params._votesFor
  );
}
