typescript write semantics that compile to a wasm module  

```typescript
import {

} from "web3bindings";

function createDAO() {
  // 1. deploy reputation
  // 2. mint to founders
  // 3. transfer ownership to DAONetwork
  // 4. deploy avatar
  // 5. transfer ownership to DAONetwork
  // 6. call daoNetwork.newDAO(avatar.address)
}

function createProposal() {
  // 1. validate data
  // 2. upload data to IPFS
  // 3. call daoNetwork.createProposal(...)
}

function voteOnProposal() {
  // 1. ensure user has rep in DAO
  // 2. call daoNetwork.vote(...)
}

function rewardReputation() {
  // 1. createProposal for entity (member) for + amount
}

function slashReputation() {
  // 1. createProposal for entity (member) for - amount
}

export DAONetwork = {
  createDAO
};

export DAO = {
  createProposal
};

export Proposal = {
  voteOnProposal
};

export Member = {
  rewardReputation,
  slashReputation
}
```
