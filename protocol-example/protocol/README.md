# Protocol - Smart Contracts  
A simple DAO protocol which consists of:
- DAOs
  - Members
  - ReputationProposals

The entity graph above is a semantic representation of the contract protocol which consists of:  

**`Avatar`** - The public facing "head" address of your DAO. This address will be stored in the `DAO.address` entity property.  
**`DAONetwork`** - A "Contract as a Service" which manages our network of DAOs. This will be the root datasource of our subgraph. Getting a list of all DAOs is possible via the `DAOs` entity list, which queries the subgraph like so `{ daos { address } }`. Additionally this contract is where proposals are created.  
**`Reputation`** - A non-fungible reputation token. Each DAO will have an instance of this token. Reputation can only be minted and burned via proposals. Any address that holds these tokens is considered a `Member` of the corresponding DAO. These members will be accessible via the `DAO.members` entity property.  
