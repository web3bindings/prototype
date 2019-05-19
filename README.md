![logo](https://github.com/web3bindings/branding/blob/master/logo/logo.png)
# Web3Bindings  
*A developer toolchain that auto generates application layer interfaces for smart contract protocols.*

## Problem
Smart contracts are not optimized for application development.

Currently, protocols build their own language-specific wrappers to make their smart contracts accessible to dApp developers. They wrap their smart contract application binary interfaces (ABIs) with web3.js, define common read and write patterns, and expose them in an API. As a result, dApp developers are dependent on protocol developers to maintain these wrappers for their applications to use.

So the question becomes, **how can smart contract developers easily maintain highly-usable and language-independent APIs for their protocols?**

## Solution
We created the **Protocol Object Model (POM)** - a metadata standard for publishing smart contract metadata which describes semantics for reading and writing to/from a contract protocol. This standard defines the logical structure of a protocol and the way data is accessed and manipulated through queries & actions.

The **Web3Bindings Generator (API Generator)** takes in the smart contract ABIs and associated metadata (POM) and outputs a complete API for application layer interfaces in the supported language of choice.

Together, the Web3Bindings POM and API Generator makes contract protocols accessible across any language & framework via API generation. Generators can be made for any Web2 UI library (i.e. Vue, React) which gives protocol developers the ability to support multiple languages & frameworks instead of one. This expands the capacity of Web3 development while making it more accessible for application developers across disciplines.

## Design Goals

1. *Cross-Platform*: Object model definition is separated from the framework/language.
2. *Abstraction*: Complex queries and actions at the protocol layer are abstracted into simple methods at the application layer.
3. *Extensibility*: Application layer methods can utilize outside services (IPFS, Swarm, etc).

## Architecture Specification  
![logo](https://github.com/web3bindings/branding/blob/master/architecture.png)
### Contract Metadata: Protocol Object Model (POM)
The POM represents a protocol with a logical tree. The contract metadata has two parts: 'read' (i.e.  ) and 'write' (i.e. ). Both parts refer to a shared ontology defined by the protocol. The POM pulls from the root contract ABIs.

#### Read Semantics  
The goal of the 'read' semantics is to ???

The semantic creates a Subgraph module with an GraphQL Schema and Mapping File.

#### Write Semantics  
The goal of the 'write' semantics is to ???

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
