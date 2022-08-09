// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IBaseToken {

	event NFTCreated(
		uint256 indexed tokenId,
		address registerer,
		address owner,
		bytes32 metadataDigest,
		string partnerName
	);

	event NFTTransferBatch(
		address from,
		address to,
		uint256[] tokenIds,
		string partnerName
	);

	struct AirdropObj {
    uint256 cardContentId;
		uint256 serialNumber;
		address owner;
		bytes32 metadataDigest;
	}
}
