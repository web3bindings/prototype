import gql from "graphql-tag";
import { Entity, WriteMethods } from "@web3bindings/typescript-runtime";

export interface DAONetworkData {
  address: string;
}

export interface Founder {
  address: string;
  reputation: number;
}

export class DAONetwork implements Entity<DAONetworkData> {

  constructor(public id: string, public context: ProtocolContext) {
    this.id = id;
    this.context = context;
  }

  public state(): Observable<DAONetworkData> {
    const query = gql`{
      daoNetwork(id: "${this.id}") {
        address
      }
    }`;

    const itemMap = (item: any): DAONetworkData => {
      if (item === null) {
        throw Error(`Could not find a DAONetwork with id ${this.id}`);
      }
      return {
        address: item.address
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }

  public daos(): Observable<DAO[]> {
    const query = gql`{
      daos (where: {
        network: "${this.id}"
      }) {
        id
      }
    }`
    const itemMap = (item: any): DAO => new DAO(item.id);
    return this.context.getObservableObject(query, itemMap);
  }

  public createDAO(
    name: string,
    founders: Founder[]
  ): void {
    WriteMethods.createDAO(name, founders, this);
  }
}
