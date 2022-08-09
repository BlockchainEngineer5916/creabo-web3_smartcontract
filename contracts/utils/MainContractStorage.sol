// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Interface.sol";

abstract contract MainContractStorage is Interface {
  
  //Main contract storage
	
  mapping(uint256 => mapping(string => mapping(string => uint256)))
		internal _uintStringBasedStorage;
	mapping(uint256 => mapping(string => mapping(string => string)))
		internal _stringStringBasedStorage;

  mapping(uint256 => mapping(string => mapping(string => mapping(uint256 => uint256))))
		internal _uintStorageArray;
	mapping(uint256 => mapping(string => mapping(string => mapping(uint256 => address))))
		internal _addressStorageArray;

  mapping(uint256 => string[]) internal _stringArrayStorage;
  mapping(uint256 => mapping(string => mapping(address => uint256))) public _tokenDistributionInfo;
  mapping(uint256 => mapping(string => uint256)) internal _uintStringStorage;
}