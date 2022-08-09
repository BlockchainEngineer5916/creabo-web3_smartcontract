// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library IDGenerator {
	uint256 private constant ID_CAP = 10000000000000000;

	/**
	 * @dev generate tokenId randomly
	 */
	function generateId(
		bytes32 metadataDigest
	) public pure returns (uint256) {
		return
			uint256(
				keccak256(abi.encodePacked(metadataDigest))
			) % ID_CAP;
	}
}
