// !NOTE: This is an original contract.
// Heavily inspired by: https://github.com/daostack/arc/blob/master/contracts/controller/UController.sol

pragma solidity ^0.5.4;

import "./Reputation.sol";
import "./Avatar.sol";

/**
 * @title Global DAO Network
 * @dev A "Contract as a Service" which hold DAOs and controls their reputation & avatar.
 */
contract DAONetwork {

  struct ReputationProposal {
    bool open;
    int256 reputationChange;
    address payable beneficiary;
    uint256 votesFor;
    // Registry letting us know who's voted already
    mapping(address=>bool) voters;
  }

  struct DAO {
    // the DAO's reputation token
    Reputation reputation;
    // mapping from proposal ID to proposal data
    mapping(bytes32=>ReputationProposal) proposals;
  }

  // mapping between the DAO's avatar address to the DAO data
  mapping(address=>DAO) public daos;
  // mapping letting us know if an avatar has already been used
  mapping(address=>bool) public avatars;
  // mapping letting us know if a reputation token has already been used
  mapping(address=>bool) public reputations;

  // Total amount of proposals
  uint256 public proposalCnt;

  event NewDAO(
    address indexed _sender,
    address indexed _avatar
  );

  event MintReputation(
    address indexed _sender,
    address indexed _to,
    uint256 _amount,
    address indexed _avatar
  );

  event BurnReputation(
    address indexed _sender,
    address indexed _from,
    uint256 _amount,
    address indexed _avatar
  );

  event ReputationProposalCreated(
    address indexed _avatar,
    bytes32 indexed _proposalId,
    address _proposer,
    string _descriptionHash,
    int256 _reputationChange,
    address _beneficiary
  );

  event ReputationProposalExecuted(
    address indexed _avatar,
    bytes32 indexed _proposalId
  );

  event VoteCast(
    address indexed _avatar,
    bytes32 indexed _proposalId,
    address indexed _voter,
    uint256 _amount,
    uint256 _votesFor
  );

  modifier votable(Avatar _avatar, bytes32 _proposalId) {
    require(daos[address(_avatar)].proposals[_proposalId].open);
    _;
  }

  modifier onlyMember(Avatar _avatar, address _member) {
    require(daos[address(_avatar)].reputation.balanceOf(_member) > 0);
    _;
  }

  modifier hasntVoted(Avatar _avatar, bytes32 _proposalId, address _member) {
    require(!daos[address(_avatar)].proposals[_proposalId].voters[_member]);
    _;
  }

  /**
   * @dev Create a new DAO
   * @param _avatar the address of the organization's avatar
   */
  function newDAO(Avatar _avatar) external
  {
    // Avatar must not be in use
    require(!avatars[address(_avatar)]);
    avatars[address(_avatar)] = true;

    require(_avatar.owner() == address(this));

    Reputation reputation = _avatar.nativeReputation();
    require(reputation.owner() == address(this));

    // Reputation must not be in use
    require(!reputations[address(reputation)]);
    reputations[address(reputation)] = true;

    daos[address(_avatar)].reputation = reputation;

    emit NewDAO(msg.sender, address(_avatar));
  }

  /**
   * @dev Submit a proposal for a reputation reward
   * @param _avatar Avatar of the DAO
   * @param _descriptionHash A hash of the proposal's description
   * @param _reputationChange Amount of reputation change
   * @param _beneficiary Who will receive the reputation
   * @return The ID of the newly created proposal
   */
  function createProposal(
    Avatar _avatar,
    string calldata _descriptionHash,
    int256 _reputationChange,
    address payable _beneficiary
  )
  external
  returns(bytes32)
  {
    // Generate a unique ID:
    bytes32 proposalId = keccak256(abi.encodePacked(this, proposalCnt));
    proposalCnt = proposalCnt + 1;

    ReputationProposal memory proposal;
    proposal.reputationChange = _reputationChange;
    proposal.beneficiary = _beneficiary;
    proposal.votesFor = 0;
    proposal.open = true;
    daos[address(_avatar)].proposals[proposalId] = proposal;

    emit ReputationProposalCreated(
      address(_avatar),
      proposalId,
      msg.sender,
      _descriptionHash,
      _reputationChange,
      _beneficiary
    );

    return proposalId;
  }

  /**
   * @dev Vote for a proposal
   * @param _avatar Avatar of the DAO
   * @param _proposalId ID of the proposal to vote for
   */
  function vote(
    Avatar _avatar,
    bytes32 _proposalId
  )
  external
  votable(_avatar, _proposalId)
  onlyMember(_avatar, msg.sender)
  hasntVoted(_avatar, _proposalId, msg.sender)
  {
    ReputationProposal storage proposal = daos[address(_avatar)].proposals[_proposalId];
    uint256 reputation = daos[address(_avatar)].reputation.balanceOf(msg.sender);
    proposal.votesFor = proposal.votesFor + reputation;
    proposal.voters[msg.sender] = true;

    emit VoteCast(
      address(_avatar),
      _proposalId,
      msg.sender,
      reputation,
      proposal.votesFor
    );
  }

  /**
   * @dev Execute the specified proposal
   * @param _avatar Avatar of the DAO
   * @param _proposalId ID of the proposal to execute
   * @return If the desired side effect has taken place
   */
  function executeProposal(
    Avatar _avatar,
    bytes32 _proposalId
  )
  external
  returns(bool)
  {
    ReputationProposal storage proposal = daos[address(_avatar)].proposals[_proposalId];
    uint256 totalReputation = daos[address(_avatar)].reputation.totalSupply();

    // If more than 50% of total reputation holders have voted for a proposal
    if (proposal.votesFor > (totalReputation/2)) {
      emit ReputationProposalExecuted(
        address(_avatar),
        _proposalId
      );

      // execute it
      proposal.open = false;
      if (proposal.reputationChange > 0) {
        uint256 mintAmount = uint256(proposal.reputationChange);
        return _mintReputation(mintAmount, proposal.beneficiary, _avatar);
      } else {
        uint256 burnAmount = uint256(-proposal.reputationChange);
        return _burnReputation(burnAmount, proposal.beneficiary, _avatar);
      }
    }
    return false;
  }

  /**
   * @dev Mint `_amount` of reputation that are assigned to `_to` .
   * @param  _amount amount of reputation to mint
   * @param _to beneficiary address
   * @param _avatar the address of the organization's avatar
   * @return bool which represents a success
   */
  function _mintReputation(
    uint256 _amount,
    address _to,
    Avatar _avatar
  )
  private
  returns(bool)
  {
    emit MintReputation(msg.sender, _to, _amount, address(_avatar));
    return daos[address(_avatar)].reputation.mint(_to, _amount);
  }

  /**
   * @dev Burns `_amount` of reputation from `_from`
   * @param _amount amount of reputation to burn
   * @param _from The address that will lose the reputation
   * @param _avatar the address of the organization's avatar
   * @return bool which represents a success
   */
  function _burnReputation(
    uint256 _amount,
    address _from,
    Avatar _avatar
  )
  private
  returns(bool)
  {
    emit BurnReputation(msg.sender, _from, _amount, address(_avatar));
    return daos[address(_avatar)].reputation.burn(_from, _amount);
  }
}
