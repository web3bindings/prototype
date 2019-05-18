import {
  NewDAO,
  RegisterFounder,
  MintReputation,
  BurnReputation,
  ReputationProposalCreated,
  ReputationProposalExecuted,
  VoteCast
} from "../../types/DAONetwork/DAONetwork";

import * as domain from "../../domain";

export function handleNewDAO(event: NewDAO): void {
  domain.handleNewDAO(event);
}

export function handleRegisterFounder(event: RegisterFounder): void {
  domain.handleRegisterFounder(event);
}

export function handleMintReputation(event: MintReputation): void {
  domain.handleMintReputation(event)
}

export function handleBurnReputation(event: BurnReputation): void {
  domain.handleBurnReputation(event);
}

export function handleReputationProposalCreated(event: ReputationProposalCreated): void {
  domain.handleReputationProposalCreated(event);
}

export function handleReputationProposalExecuted(event: ReputationProposalExecuted): void {
  domain.handleReputationProposalExecuted(event);
}

export function handleVoteCast(event: VoteCast): void {
  domain.handleVoteCast(event);
}
