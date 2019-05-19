import { Address, store } from "@graphprotocol/graph-ts";
import { DAONetwork } from "../types/schema";

export function getDAONetwork(id: string): DAONetwork {
  let daoNetwork = store.get("DAONetwork", id) as DAONetwork;
  if (daoNetwork == null) {
    daoNetwork = new DAONetwork(id);
    daoNetwork.address = Address.fromHexString(id);
    store.set("DAONetwork", id, daoNetwork);
  }
  return daoNetwork;
}
