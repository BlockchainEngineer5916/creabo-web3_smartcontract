// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/// @title NameRegistry - saves a set of addresses.
contract NameRegistry is Ownable {
	using Address for address;

	mapping(address => bool) public allowedContracts;
	mapping(uint256 => mapping(string => address)) private _addressStorage;
    // multiple address project wise for governance/ERC20 
    // mapping(uint256 => string => address)

	constructor() Ownable() {}

	/// @dev Sets the address associated with the key name.
	///      If the address is the contract, not an EOA, it is
	///      saved as the allowed contract list.
	/// @param key uint256 of the key
	/// @param tokenType string of the tokenType
	/// @param value address of the value
	function set(uint256 key, string memory tokenType, address value) public onlyOwner {
		_addressStorage[key][tokenType] = value;
		if (value.isContract()) {
			allowedContracts[value] = true;
		}
	}

	/// @dev Gets the address associated with the key name.
	/// @param key uint256 of the key
	function get(uint256 key, string memory tokenType) public view returns (address) {
		return _addressStorage[key][tokenType];
	}
}
