import gql from "graphql-tag";
import { Observable } from "rxjs";
import {
  Entity,
  WriteMethods,
  ProtocolContext
} from "@web3bindings/typescript-runtime";
import {
  Vote
} from "./Vote";

export interface ReputationProposalData {
  dao: string;
  active: boolean;
  proposer: string;
  beneficiary: string;
  reputationChange: number;
  createdAt: number;
  executedAt?: number;
  descriptionHash: string;
  title?: string;
  description?: string;
  votesFor: number;
}

export class ReputationProposal implements Entity<ReputationProposalData> {

  constructor(public id: string, public context: ProtocolContext) {
    this.id = id;
    this.context = context;
  }

  public state(): Observable<ReputationProposalData> {
    const query = gql`{
      reputationProposal(id: "${this.id}") {
        dao {
          id
        },
        active,
        proposer,
        beneficiary,
        reputationChange,
        createdAt,
        executedAt,
        descriptionHash,
        title,
        description,
        votesFor
      }
    }`;

    const itemMap = (item: any): ReputationProposalData => {
      if (item === null) {
        throw Error(`Could not find a ReputationProposal with id ${this.id}`);
      }
      return {
        dao: item.dao.id,
        active: item.active,
        proposer: item.proposer,
        beneficiary: item.beneficiary,
        reputationChange: item.reputationChange,
        createdAt: item.createdAt,
        executedAt: item.executedAt,
        descriptionHash: item.descriptionHash,
        title: item.title,
        description: item.description,
        votesFor: item.votesFor
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }

  public votes(): Observable<Vote[]> {
    const query = gql`{
      votes (where: {
        proposal: "${this.id}"
      }) {
        id
      }
    }`;
    const itemMap = (item: any): Vote => new Vote(item.id, this.context);
    return this.context.getObservableObject(query, itemMap);
  }

  public voteOnProposal(): void {
    WriteMethods.voteOnProposal(this);
  }
}
