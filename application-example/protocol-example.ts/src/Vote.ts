import gql from "graphql-tag";
import { Observable } from "rxjs";
import { 
  Entity,
  ProtocolContext
} from "@web3bindings/typescript-runtime";

export interface VoteData {
  createdAt: number;
  voter: string;
  proposal: string;
  dao: string;
  reputation: number;
}

export class Vote implements Entity<VoteData> {

  constructor(public id: string, public context: ProtocolContext) {
    this.id = id;
    this.context = context;
  }

  public state(): Observable<VoteData> {
    const query = gql`{
      createdAt,
      voter,
      proposal {
        id
      },
      dao {
        id
      },
      reputation
    }`;

    const itemMap = (item: any): VoteData => {
      if (item === null) {
        throw Error(`Could not find a Vote with id ${this.id}`);
      }
      return {
        createdAt: item.createdAt,
        voter: item.voter,
        proposal: item.proposal.id,
        dao: item.dao.id,
        reputation: item.reputation
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }
}
