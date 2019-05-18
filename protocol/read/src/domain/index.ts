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
  // createProposal
}

export function handleReputationProposalExecuted(event: ReputationProposalExecuted): void {
  // executeProposal
}

export function handleVoteCast(event: VoteCast): void {
  // createVote
  // updateProposal
}
