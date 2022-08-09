//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyTokenUpgradeable is Initializable, ERC20Upgradeable, OwnableUpgradeable {

    function initialize() external initializer {
        __ERC20_init("MyToken", "MY");
        __Ownable_init();
    }

    function mint(address to, uint amount) external onlyOwner {
        _mint(to, amount);
    }

    function getSupplySquare() public view returns (uint256) {
        uint256 _supplyNow = totalSupply();
        return _supplyNow*_supplyNow;
    }
}