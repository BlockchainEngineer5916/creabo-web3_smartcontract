// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./ERC721Upgradeable.sol";
import "../lib/IDGenerator.sol";
import "../utils/BaseTokenStorage.sol";
import "./IBaseToken.sol";
import "./ERC2477.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BaseToken is
	Initializable,
	IBaseToken,
	ERC2477,
	ERC721Upgradeable,
	OwnableUpgradeable,
	BaseTokenStorage
{
	uint256 internal constant _GLOBAL_SLOT = 0;
	bytes32 internal constant _ID_NONCE = keccak256("idNonce");

	bytes32 internal constant _REGISTERER = keccak256("registerer");
	bytes32 internal constant _OWNER = keccak256("owner");
	bytes32 internal constant _METADATA_DIGEST = keccak256("metadataDigest");

	// metadata
	bytes32 internal constant _URI_PREFIX = keccak256("URIPrefix");
	bytes32 internal constant _URI_POSTFIX = keccak256("URIPostfix");
	bytes32 internal constant _SCHEMA_URI_DIGEST = keccak256("schemaURIDigest");

	/*
	 * Hashing function.
	 */
	string public constant HASH_ALGORITHM = "sha256";

	string private _partnerName;

	function initialize(
		string memory _name,
		string memory _symbol,
		string memory uriPrefix,
		bytes32 schemeDigest,
		string memory partnerName
	) external initializer {
		ERC721Upgradeable.__ERC721_init(_name, _symbol);
		OwnableUpgradeable.__Ownable_init();
		_uintStorage[_GLOBAL_SLOT][0][_ID_NONCE] = 1;
		_setBaseURI(uriPrefix, ".json", schemeDigest);
		_partnerName = partnerName;
	}

	modifier tokenExists(uint256 tokenId) {
		require(_exists(tokenId), "The tokenId does not exist");
		_;
	}

	function createNFTBatch(
		address owner,
		bytes32[] memory metadataDigests
	) public {
		require( metadataDigests.length > 0,"parameters length mismatch");
		for (uint256 i = 0; i < metadataDigests.length; i++) {
			_createNFT(
				owner,
				metadataDigests[i],
				_partnerName
			);
		}
	}

	function airdropNFT(AirdropObj[] memory _airdropArr) public {
		require(_airdropArr.length > 0, "Input parameter array is empty");
		for (uint256 i = 0; i < _airdropArr.length; i++) {
			_createNFT(
				_airdropArr[i].owner,
				_airdropArr[i].metadataDigest,
				_partnerName
			);
		}
	}

	function transferNFTBatch(
		address from,
		address to,
		uint256[] memory tokenIds
	) public {
		for (uint256 i = 0; i < tokenIds.length; i++) {
			_transfer(from, to, tokenIds[i]);
		}
		emit NFTTransferBatch(from, to, tokenIds, _partnerName);
	}

	function setPartnerName(string memory name) public {
		_partnerName = name;
	}

	function setBaseURI(
		string memory uriPrefix,
		string memory uriPostfix,
		bytes32 schemaURIIntegrityDigest
	) public onlyOwner {
		_setBaseURI(uriPrefix, uriPostfix, schemaURIIntegrityDigest);
	}

	function nonce() public view returns (uint256) {
		return _uintStorage[_GLOBAL_SLOT][0][_ID_NONCE];
	}

	function checkProxy() public view returns (uint256) {
		uint256 ret = _uintStorage[_GLOBAL_SLOT][0][_ID_NONCE];
		ret = ret + 25;
		return ret;
	}

	function computeId(
		bytes32 metadataDigest
	) public pure returns (uint256) {
		return IDGenerator.generateId(metadataDigest);
	}

	/**
	 * @dev Gets the scheme digests and hash
	 * @param tokenId uint256 ID of StartrailRegistry
	 */
	function tokenURISchemaIntegrity(uint256 tokenId)
		external
		view
		override(ERC2477)
		tokenExists(tokenId)
		returns (bytes memory digest, string memory hashAlgorithm)
	{
		require(
			_addressStorage[tokenId][0][_OWNER] != address(0),
			"the tokenId does not exist"
		);
		digest = abi.encodePacked(
			_bytes32Storage[_GLOBAL_SLOT][0][_SCHEMA_URI_DIGEST]
		);
		hashAlgorithm = HASH_ALGORITHM;
	}

	/**
	 * @dev Gets the metadata digests of SRR and hash
	 * @param tokenId uint256 ID of StartrailRegistry
	 */
	function tokenURIIntegrity(uint256 tokenId)
		external
		view
		override(ERC2477)
		tokenExists(tokenId)
		returns (bytes memory digest, string memory hashAlgorithm)
	{
		digest = abi.encodePacked(_bytesStorage[tokenId][0][_METADATA_DIGEST]);
		hashAlgorithm = HASH_ALGORITHM;
	}

	/**
	 * @dev Gets URI where the matadata is saved
	 * @param tokenId uint256 of token ID
	 * @return URI
	 */
	function tokenURI(uint256 tokenId)
		public
		view
		override
		returns (string memory)
	{
		return
			string(
				abi.encodePacked(
					_stringStorage[_GLOBAL_SLOT][0][_URI_PREFIX],
					uint2str(tokenId),
					_stringStorage[_GLOBAL_SLOT][0][_URI_POSTFIX]
				)
			);
	}

	function _createNFT(
		address owner,
		bytes32 metadataDigest,
		string memory partnerName
	) internal {
		uint256 tokenId =
			IDGenerator.generateId(metadataDigest);
		_safeMint(owner, tokenId);
		_saveNFT(tokenId, owner, metadataDigest);
		emit NFTCreated(
			tokenId,
			_msgSender(),
			owner,
			metadataDigest,
			partnerName
		);
	}

	function _saveNFT(
		uint256 tokenId,
		address owner,
		bytes32 metadataDigest
	) private {
		_addressStorage[tokenId][0][_REGISTERER] = _msgSender();
		_addressStorage[tokenId][0][_OWNER] = owner;
		_bytes32Storage[tokenId][0][_METADATA_DIGEST] = metadataDigest;
	}

	function _setBaseURI(
		string memory uriPrefix,
		string memory uriPostfix,
		bytes32 schemaURIIntegrityDigest
	) internal {
		_stringStorage[_GLOBAL_SLOT][0][_URI_PREFIX] = uriPrefix;
		_stringStorage[_GLOBAL_SLOT][0][_URI_POSTFIX] = uriPostfix;
		_bytes32Storage[_GLOBAL_SLOT][0][
			_SCHEMA_URI_DIGEST
		] = schemaURIIntegrityDigest;
	}

	function isContract(address account) internal view returns (bool) {
		// This method relies on extcodesize, which returns 0 for contracts in
		// construction, since the code is only stored at the end of the
		// constructor execution.
		uint256 size;
		assembly {
			size := extcodesize(account)
		}
		return size > 0;
	}

	function uint2str(uint256 _i)
		public
		pure
		returns (string memory _uintAsString)
	{
		if (_i == 0) {
			return "0";
		}
		uint256 j = _i;
		uint256 len;
		while (j != 0) {
			len++;
			j /= 10;
		}
		bytes memory bstr = new bytes(len);
		uint256 k = len;
		while (_i != 0) {
			k = k - 1;
			uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
			bytes1 b1 = bytes1(temp);
			bstr[k] = b1;
			_i /= 10;
		}
		return string(bstr);
	}
}
