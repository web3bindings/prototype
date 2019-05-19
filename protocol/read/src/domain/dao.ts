import { Address, store } from "@graphprotocol/graph-ts";
import { DAO } from "../types/schema";
import { Avatar } from "../types/DAONetwork/Avatar";
import { getDAONetwork } from "./daoNetwork";
import { getReputation, setDAO } from "./reputation";

function getDAO(id: string): DAO {
  let dao = store.get("DAO", id) as DAO;
  if (dao == null) {
    dao = new DAO(id);
  }
  return dao;
}

function saveDAO(dao: DAO): void {
  store.set("DAO", dao.id, dao);
}

export function insertNewDAO(
  daoNetworkAddress: Address,
  avatarAddress: Address
): DAO {
  let avatar = Avatar.bind(avatarAddress);
  let reputationAddress = avatar.nativeReputation();
  let dao = getDAO(avatarAddress.toHex());
  dao.address = avatarAddress;
  dao.network = getDAONetwork(daoNetworkAddress.toHex()).id;
  dao.name = avatar.orgName().toString();
  dao.reputation = getReputation(reputationAddress.toHex()).id;
  saveDAO(dao);
  setDAO(reputationAddress.toHex(), dao);
  return dao;
}
