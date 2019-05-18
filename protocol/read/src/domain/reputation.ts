import { Address, store } from "@graphprotocol/graph-ts";
import { hexToAddress } from "../utils";
import { Reputation, DAO } from "../types/schema";
import { Avatar } from "../types/Avatar";
import { Reputation as ReputationContract } from "../types/Reputation";

export function getReputation(id: string): Reputation {
  let reputation = store.get("Reputation", id) as Reputation;
  if (reputation == null) {
    reputation = new Reputation(id);
    reputation.address = id;
    let reputationContract = ReputationContract.bind(hexToAddress(id));
    reputation.totalSupply = reputationContract.totalSupply();
    store.set("Reputation", id, reputation);
  }
  return reputation;
}

function saveReputation(reputation: Reputation): void { 
  store.set("Reputation", reputation.id, reputation);
}

export function setDAO(id: string, dao: DAO): void {
  let reputation = getReputation(id);
  reputation.dao = dao;
  saveReputation(reputation);
}

export function updateTotalSupply(avatarAddress: Address): void {
  let avatar = Avatar.bind(avatarAddress)
  let reputationAddress = avatar.nativeReputation();
  let reputationContract = ReputationContract.bind(reputationAddress);
  let reputation = getReputation(reputationAddress.toHex());
  reputation.totalSupply = reputationContract.totalSupply();
  saveReputation(reputation);
}
