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

export function handleNewDAO(event: NewDAO): void {
  insertNewDAO(event.address, event.params._avatar);
}

export function handleRegisterFounder(event: RegisterFounder): void {
  
}

export function handleMintReputation(event: MintReputation): void {
  
}

export function handleBurnReputation(event: BurnReputation): void {
  
}

export function handleReputationProposalCreated(event: ReputationProposalCreated): void {
  
}

export function handleReputationProposalExecuted(event: ReputationProposalExecuted): void {
  
}

export function handleVoteCast(event: VoteCast): void {
  
}
