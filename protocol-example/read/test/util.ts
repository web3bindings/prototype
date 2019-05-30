import {
  subgraphName,
  ethereumNode
} from "../ops/settings";

process.env = {
  ethereum: ethereumNode,
  node_http: `http://127.0.0.1:8000/subgraphs/name/${subgraphName}`,
  node_ws: `http://127.0.0.1:8001/subgraphs/name/${subgraphName}`,
  test_mnemonic:
    "myth like bonus scare over problem client lizard pioneer submit female collect",
  ...process.env,
};

import axios from "axios";
import * as HDWallet from "hdwallet-accounts";
const Web3 = require("web3");

const { node_ws, node_http, ethereum, test_mnemonic } = process.env;

export async function getWeb3() {
  const web3 = new Web3(ethereum);
  const hdwallet = HDWallet(10, test_mnemonic);
  Array(10)
    .fill(10)
    .map((_, i) => i)
    .forEach((i) => {
      const pk = hdwallet.accounts[i].privateKey;
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      web3.eth.accounts.wallet.add(account);
    });
  web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
  return web3;
}

export async function getOptions(web3) {
  return {
    from: web3.eth.defaultAccount,
    gas: 2000000,
  };
}

export async function sendQuery(q: string, maxDelay = 1000, url = node_http) {
  await new Promise((res, rej) => setTimeout(res, maxDelay));
  const {
    data: { data },
  } = await axios.post(url, {
    query: q,
  });

  return data;
}
