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
The POM represents a protocol with a logical graph. The contract metadata has two parts: 'read' and 'write'. Both parts refer to a shared ontology defined by the protocol.  

#### Read Semantics  
The goal of the 'read' semantics is to define structured *queries* over your contract data.  

The read semantic standard this exmaple project uses is a Subgraph (The Graph), which defines a GraphQL Schema and Mapping File.  

#### Write Semantics  
The goal of the 'write' semantics is to bundle complex contract transactions (and external service interactions) into simple *actions* for the application developer to use.

The write semantic standard is not currently developed, but this project aims to articulate an ideal development environment which can be seen here: `protocol-example/write/Protocol.ts`.  

The semantic ([`Proposal.create("infomation", imageByteCode, 5ETH)`]) sits in a runtime environment (WASM module) and has access to contracts and service connection (IPFS, Web3, etc).  

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

### Web3Bindings Generator
The Web3Bindings Generator takes as input the published package described above, and outputs a language & framework specific API. An example of this can be seen here: `protocol-example.ts`  

### Example  
For this project, we took HEAVY inspiration from The Graph & DAOstack projects. In our boiled example, we created a simple, but complex, set of smart contracts that implements a very primitive DAO.  

#### Contracts  
Read more [here](./protocol-example/protocol/README.md).  

#### Read Semantics  
Read more [here](./protocol-example/read/README.md).  

#### Write Semantics  
Read more [here](./protocol-example/write/README.md).  

#### Generated API  
An example API that can be generated is shown here: `./protocol-example.ts/`. Here's what using this library might look like:  
```typescript
const dao = new DAO()
dao.createProposal("info", "etc") // write semantic
await dao.getMembers() // read semantic (subgraph)
```
