import gql from "graphql-tag";
import { Observable } from "rxjs";
import {
  Entity,
  WriteMethods,
  ProtocolContext
} from "@web3bindings/typescript-runtime";

export interface MemberData {
  address: string;
  dao: string;
  reputation: number;
}

export class Member implements Entity<MemberData> {

  constructor(public id: string, public context: ProtocolContext) {
    this.id = id;
    this.context = context;
  }

  public state(): Observable<MemberData> {
    const query = gql`{
      member(id: "${this.id}") {
        address,
        dao {
          id
        },
        reputation
      }
    }`;

    const itemMap = (item: any): MemberData => {
      if (item === null) {
        throw Error(`Could not find a Member with id ${this.id}`);
      }
      return {
        address: item.address,
        dao: item.dao.id,
        reputation: item.reputation
      };
    };

    return this.context.getObservableObject(query, itemMap);
  }

  public rewardReputation(
    amount: number
  ): void {
    WriteMethods.rewardReputation(
      amount,
      this
    );
  }

  public slashReputation(
    amount: number
  ): void { 
    WriteMethods.slashReputation(
      amount,
      this
    );
  }
}
