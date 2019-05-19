import gql from "graphql-tag";
import {
  Entity,
  WriteMethods,
  ConnectionContext
} from "@web3bindings/typescript-runtime";

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
        network: item.network,
        name: item.name,
        reputation: item.reputation
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }

  public members(): Observable<Member[]> {

  }

  public proposals(): Observable<Proposal[]> {
    
  }
}
