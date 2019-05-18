import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { Member, DAO } from "../types/schema";
import { Avatar } from "../types/Avatar";
import { Reputation } from "../types/Reputation";

function getMember(id: string): Member {
  let member = store.get("Member", id) as Member;
  if (member == null) {
    member = new Member(id);
    member.address = id;
  }
  return member;
}

function saveMember(member: Member): void {
  store.set("Member", member.id, member);
}

export function insertNewMember(
  avatarAddress: Address,
  memberAddress: Address
): Member {
  let avatar = Avatar.bind(avatarAddress);
  let reputationAddress = avatar.nativeReputation();
  let reputation = Reputation.bind(reputationAddress);
  let member = getMember(memberAddress.toHex());
  member.dao = store.get("DAO", avatarAddress.toHex()) as DAO;
  member.reputation = reputation.balanceOf(memberAddress);
  saveMember(member);
}

export function addReputation(
  memberAddress: Address,
  amount: BigInt
): void {
  let member = getMember(memberAddress.toHex());
  member.reputation.plus(amount);
  saveMember(member);
}

export function subReputation(
  memberAddress: Address,
  amount: BigInt
): void {
  let member = getMember(memberAddress.toHex());
  member.reputation.minus(amount);
  saveMember(member);
}
