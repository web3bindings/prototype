import gql from "graphql-tag";
import { Observable } from "rxjs";
import {
  Entity,
  WriteMethods,
  ConnectionContext
} from "@web3bindings/typescript-runtime";
import { Member } from "./Member";
import { ReputationProposal } from "./ReputationProposal";

export interface DAOData {
  address: string;
  network: string;
  name: string;
  reputation: string;
}

export class DAO implements Entity<DAOData> {

  constructor(public id: string, public context: ConnectionContext) {
    this.id = id;
    this.context = context;
  }

  public state(): Observable<DAO> {
    const query = gql`{
      dao(id: "${this.id}") {
        address,
        network {
          id
        },
        name,
        reputation {
          id
        }
      }
    }`

    const itemMap = (item: any): DAOData => {
      if (item === null) {
        throw Error(`Could not find a DAO with id ${this.id}`);
      }
      return {
        address: item.address,
        network: item.network.id,
        name: item.name,
        reputation: item.reputation.id
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }

  public members(): Observable<Member[]> {
    const query = gql`{
      members (where: {
        dao: "${this.id}"
      }) {
        id
      }
    }`;
    const itemMap = (item: any): Member => new Member(item.id, this.context);
    return this.context.getObservableObject(query, itemMap);
  }

  public proposals(): Observable<ReputationProposal[]> {
    const query = gql`{
      proposals (where: {
        dao: "${this.id}"
      }) {
        id
      }
    }`;
    const itemMap = (item: any): ReputationProposal => new ReputationProposal(item.id, this.context);
    return this.context.getObservableObject(query, itemMap);
  }

  public createProposal(
    title: string,
    description: string,
    reputationChange: number,
    beneficiary: string
  ): void {
    WriteMethods.createProposal(
      title,
      description,
      reputationChange,
      beneficiary,
      this
    );
  }
}
