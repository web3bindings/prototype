![logo](https://github.com/web3bindings/branding/blob/master/logo/logo.png)
# Web3Bindings  
*A developer toolchain that auto generates application layer interfaces for smart contract protocols.*

## Problem
Smart contracts are not optimized for application development.

Currently, protocols build their own language-specific wrappers to make their smart contracts accessible to dApp developers. Developers usually utilize web3.js to write a wrapper for their smart contract protocols. These wrappers aim to define common read and write patterns for application developers to use. As a result, dApp developers are dependent on protocol developers to maintain these wrappers.

So the question becomes, **how can smart contract developers easily maintain highly-usable and language-independent APIs for their protocols?**

## Solution
We created the **Protocol Object Model (POM)** - a standard for publishing smart contract metadata which describes semantics for reading and writing to/from a contract protocol. This standard defines the logical structure of a protocol, and the way data is accessed and manipulated through queries & actions.

The **Web3Bindings Generator (API Generator)** takes in the smart contract ABIs and associated metadata (POM), then outputs a complete API for application to use in their language of choice.

Together, the Web3Bindings POM and API Generator makes contract protocols accessible across any language & framework via API generation. Generators can be made for any language or framework. This makes the Web3 development pipeline more efficient while making it more accessible for application developers across domains.  

## Design Goals
1. *Separation of Concerns*: Seperate protocol development from application development.
2. *Abstraction*: Complex queries and actions at the protocol layer are abstracted into simple methods at the application layer.
3. *Extendable*: Through developing an open-standard, it leaves it open for community extensibility.  
4. *Interoperable*: Application layer run-times provide outside service connections (IPFS, Swarm, etc).  

## Architecture Specification  
![logo](https://github.com/web3bindings/branding/blob/master/architecture.png)
### Contract Metadata: Protocol Object Model (POM)
The POM represents a protocol with a logical graph. The contract metadata has two parts: 'read' (i.e.  ) and 'write' (i.e. ). Both parts refer to a shared ontology defined by the protocol. The POM pulls from the root contract ABIs.

#### Read Semantics  
The goal of the 'read' semantics is to define structured *queries* over your contract data.

The semantic creates a Subgraph module with an GraphQL Schema and Mapping File.

#### Write Semantics  
The goal of the 'write' semantics is to bundle complex contract transactions (and external service interactions) into simple *actions* for the application developer to use.

The semantic ([`Proposal.create("infomation", imageByteCode, 5ETH)`]) sits in a runtime environment (WASM module) that provides methods (ABI.json), contract code comments (RADSPEC), and service connection (IPFS, Web3, etc).

This can be used as a standard for the creation of a Web3 + Typescript + WASM + Browser application interface for dApp developers.

#### Publishing  
Anyone can publsh the POM metadata for a protocol, which acts as the source of truth for the **Web3Bindings Generator**.
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

### Web3 API Bindings Generator
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
