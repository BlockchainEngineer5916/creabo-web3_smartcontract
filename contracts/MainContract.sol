// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./utils/MainContractStorage.sol";
import "./token/ERC20Token.sol";
import "./utils/Helper.sol";

contract MainContract is Helper, Initializable, MainContractStorage {

    address public _owner;
    address public withdrawWallet;
    ERC20Token token;

    event Transfer(uint amount, uint projectId);

    function initialize() external initializer {
        _owner = _msgSender();
        withdrawWallet = _msgSender();
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Caller not owner");
        _;
    }
    
    uint256 public projectCount;

    event TokenAllocationSetted(uint256 _projectId, string[] _category, uint256[] _amount, string _calculateby);
    event TokenDistributionSetted(uint256 _projectId, string _category, address[] _eoa, uint256[] _percentage);

    event ProjectCreated(uint256 _projectId, string _name, string _tokenName, string _tokenSymbol, uint256 _totalToken, string _votingPower, string _whoCanVote );

    function createProject(string memory _name, string memory _tokenName, string memory _tokenSymbol, uint256 _totalToken, string memory _votingPower, string memory _whoCanVote) public onlyOwner
    {
        projectCount ++;
        
        _stringStringBasedStorage[projectCount]["Project"]["name"] = _name;
        _stringStringBasedStorage[projectCount]["Project"]["tokenName"] = _tokenName;
        _stringStringBasedStorage[projectCount]["Project"]["tokenSymbol"] = _tokenSymbol;
        _stringStringBasedStorage[projectCount]["Project"]["whoCanVote"] = _whoCanVote;
        _stringStringBasedStorage[projectCount]["Project"]["votingPower"] = _votingPower;

        _uintStringBasedStorage[projectCount]["Project"]["totalToken"] = _totalToken;

        token = new ERC20Token(_tokenName, _tokenSymbol, _totalToken);

        emit ProjectCreated(projectCount, _name, _tokenName, _tokenSymbol, _totalToken, _votingPower, _whoCanVote);
    }

    function getProjectTokenAmount(uint256 _projectId) public view returns(uint256) {
        return _uintStringBasedStorage[_projectId]["Project"]["totalToken"];
    }

    function setTokenAllocation (uint256 _projectId, string[] memory _category, uint256[] memory _amount, string memory _calculateby) public onlyOwner {
        require(_category.length == _amount.length, "category and amount array length not match");

        delete _stringArrayStorage[_projectId];

        for(uint256 i = 0; i < _category.length; ++ i) {
            _stringArrayStorage[_projectId].push(_category[i]);
            _uintStringBasedStorage[_projectId][_category[i]]["amount"] = _amount[i];
            _stringStringBasedStorage[_projectId][_category[i]]["calculatedby"] = _calculateby;
        }

        emit TokenAllocationSetted(_projectId, _category, _amount, _calculateby);
    }

    function setTokenDistribution (uint256 _projectId, string memory _category, address[] memory _eoa, uint256[] memory _percentage) public onlyOwner{
        require(_eoa.length == _percentage.length, "eoa and percentage array length not match");
        
        _uintStringStorage[_projectId][_category] = 0;

        addTokenDistribution(_projectId, _category, _eoa, _percentage);

        emit TokenDistributionSetted(_projectId, _category, _eoa, _percentage);
    }

    function addTokenDistribution (uint256 _projectId, string memory _category, address[] memory _eoa, uint256[] memory _percentage) public onlyOwner{
        require(_eoa.length == _percentage.length, "eoa and percentage array length not match");

        uint256 projectCategoryTokenAmount = getProjectTokenAmount(_projectId) * _uintStringBasedStorage[_projectId][_category]["amount"] / 100;
        uint256 distributionCount = _uintStringStorage[_projectId][_category];

        for(uint256 i = 0; i < _eoa.length; ++ i) {
            _addressStorageArray[_projectId][_category]["eoa"][distributionCount + i] = _eoa[i];
            _uintStorageArray[_projectId][_category]["percentage"][distributionCount + i] = _percentage[i];
            _uintStorageArray[_projectId][_category]["amount"][distributionCount + i] = projectCategoryTokenAmount * _percentage[i] / 100;
            _tokenDistributionInfo[_projectId][_category][_eoa[i]] = _percentage[i];
        }

        _uintStringStorage[_projectId][_category] += _eoa.length;
    }

    function getTokenAllocation (uint256 _projectId, string memory _category) public view returns(uint256, string memory) {
        return (
            _uintStringBasedStorage[_projectId][_category]["amount"],
            _stringStringBasedStorage[_projectId][_category]["calculatedby"]
        );
    }

    function getTokenDistribution (uint256 _projectId, string memory _category, uint256 _id) public view returns(address, uint256, uint256) {
        return (
            _addressStorageArray[_projectId][_category]["eoa"][_id],
            _uintStorageArray[_projectId][_category]["percentage"][_id],
            _uintStorageArray[_projectId][_category]["amount"][_id]
        );
    }

    function getTokenDistributionCount (uint256 _projectId, string memory _category) public view returns(uint256) {
        return _uintStringStorage[_projectId][_category];
    }

    function getProjectUserTokenAmount (uint256 _projectId, address _eoa) public view returns(uint256) {
        uint256 userAmount = 0;

        uint256 totalAmount = getProjectTokenAmount(_projectId);
        string[] memory category = getProjectTokenCategory(_projectId);

        for(uint256 i = 0; i < category.length ; ++ i) {
            userAmount += totalAmount * _uintStringBasedStorage[_projectId][category[i]]["amount"] * getTokenDistributionInfo(_projectId, _stringArrayStorage[_projectId][i], _eoa) / 10000;
        }

        return userAmount;
    }

    function getProjectTokenCategory (uint256 _projectId) public view returns(string[] memory) {
        return _stringArrayStorage[_projectId];
    }

    function getVotingPower (uint256 _projectId, address _eoa) public view returns(uint256) {
        uint256 weight = getProjectUserTokenAmount(_projectId, _eoa);
        if(weight > 0 && compareStrings(_stringStringBasedStorage[projectCount]["Project"]["votingPower"], "1VPM")) {
            return 1;
        }
        return weight;
    }

    function getTokenDistributionInfo (uint256 _projectId, string memory _category, address _eoa) public view returns(uint256) {
        return _tokenDistributionInfo[_projectId][_category][_eoa];
    }

    function transferFund(uint projectId, uint amount) public payable {
        emit Transfer(amount, projectId);
    }
    function withdraw() public {
        (bool success, ) = payable(withdrawWallet).call{
        value: address(this).balance
        }("");
        require(success);
    }

    function checkVoterCanVote(uint256 _projectId, address voter) public {
        if(compareStrings(_stringStringBasedStorage[projectCount]["Project"]["whoCanVote"], "OnlyOwner")) {
            require(voter == _owner, "you are not owner");
        }
    }

    function getTokenAddress() public view returns(address) {
        return address(token);
    }

    function getTokenTotalSupply() public view returns(uint256) {
        return token.totalSupply();
    }
}