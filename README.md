# Web3Bindings  
A developer toolchain that auto generates application layer interfaces for smart contract protocols.  

## Problem To Solve  
TODO: refine this...  
- Everyone writing their own JS wrappers around their contracts  
- Web3.js's "Contract" class doesn't cut it, too low level  

**"Contract Protocols aren't fit for applications"**  
1. Complex and not simple to interact with
2. not written for applicaton developers
3. Different set of contratins than application developers
   1. Code Bloat
   2. Minimize State Changes
   3. Minimize Storage
4. Make use of outside service identifiers (IPFS, SWARM, etc)
   1. Leaves it up to the user of the protocol to know how to properly add these idenfiers

- We don't want to be constricted to JS (the browser) because a smart contract protocol should be accessible in any type of application.

## Solution  
Create a standard for publishing smart contract metadata which describes how to semantically read & write to & from your protocol. This metadata is then used by generators to automatically create application layer interface for your protocol.  

## Architecture Specification  
### Contract Metadata  
TODO: describe that the metadata should have two parts (read & write). They should refer to a shared entity hiearchy / ontology. Also don't forget about the root data (contract ABIs).  

#### Read Semantics  
TODO: describe the goal of this  

#### Write Semantics  
TODO: describe the goal of this  
TODO: describe that it'll be sitting in a runtime environment
      that provides everything it needs (defined by standard)
TODO: describe a standard for Web3 + Typescript + WASM + Browser app

### Publishing  
TODO: describe the purpose of this (source of truth for the generator)  
```json
{
  "name": "MyProtocol",
  "version": "1.0",
  "read": {
    "standard": "subgraph@latest",
    "files": [ "datasource.yml", "mappings.WASM", "schema.graphql" ]
  },
  "write": {
    "standard": "writesemantics@0.1-alpha",
    "files": [ "MyProtocol.WASM" ]
  },
  "contracts": [
    {
      "source": "MyDAO.sol",
      "abi": "MyDAO.abi.json"
    },
    {
      "source": "MyProposal.sol",
      "abi": "MyProposal.abi.json"
    },
    {
      "source": "SomethingElse.sol",
      "abi": "SomethingElse.abi.json"
    }
  ],
  "contractAddresses": "migration.json"
}
```

### API Generators  
TODO: describe the different parts of the generator...  
- How it will be invoked (standard CLI)  
- Where it will output the files  
- How upgrades should be handled (web3bindings-lock.json)  
- Best practices  
  - don't version your generated files  
  - provide easy build pipeline integration [C#? .csproj build target. Rust? Cargo package, etc]  

### Example  
#### Contracts  
TODO: example contracts  

#### Read Semantics  
TODO: subgraph example  
+ Subgraph  
  - GraphQL Schema  
  - Mapping File  

#### Write Semantics  
TODO: typescript -> WASM module example  
- Write Semantics [`Proposal.create("infomation", imageByteCode, 5ETH)`]  
  + *WASM Module (Mapping File)  
    -> ABI.json (get methods)  
    -> Contract Code Comments (RADSPEC) (validate input & provide more info)  
    -> Service Connection (IPFS, Web3, etc)  

```typescript
// MyProtocol.WASM
import {
  ipfs,
  contracts,
  UserContext
} from "web3bindings";

function createProposal(
  title: string,
  description: string,
  image: bytes,
  context: UserContext
): Results[] {
  let results = [];

  // 1. upload data to ipfs
  const hash = ipfs.upload({
    title,
    description
  });

  results.push(new IPFSUpload(hash));

  // 2. form transaction
  const tx = {
    from: context.accountAddress,
    to: contracts.MyDAO.methods.createProposal,
    data: Web3.EncodeParams(title, hash)
  };

  // 3. post proposal
  const pendingTransaction = context.sendTransaction(tx);

  results.push(new Transaction(pendingTransaction));

  return results;
}

export DAO = {
  createProposal
}
```

#### Application Integration  
TODO: node.js project example  

#### Generated API  
TODO: example user usage example + behind the scenes what's happening  
```typescript
// app dev (daostack/client library equivalent)
const dao = new DAO()
dao.createProposal("info", "etc") -> write semantic
dao.getMembers() -> read semantic (subgraph)
```
