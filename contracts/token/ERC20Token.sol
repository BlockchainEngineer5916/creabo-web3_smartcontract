// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ----------------------------------------------------------------------------
// Contract function to receive approval and execute function in one call
//
// Borrowed from MiniMeToken
// ----------------------------------------------------------------------------
abstract contract ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes memory data) virtual public;
}


// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;

    event OwnershipTransferred(address indexed _from, address indexed _to);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
}


// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals and assisted
// token transfers
// ----------------------------------------------------------------------------
contract ERC20Token is ERC20, Owned {

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor(string memory name_, string memory symbol_, uint256 totalSupply_) ERC20(name_, symbol_) {
        _mint(owner, totalSupply_ * 10 ** 18);
    }

    function mint(address to, uint256 amount) public {
        
        // check if the contract has overflow amount of tokens for the transaction
        uint256 balanceNext = balanceOf(to) + amount;
        require(balanceNext >= amount, "overflow balance");

        //mint token
        _mint(to, amount);
    }

    function upgrade(uint256 amount) public {
        // check if the requester has enough amount of tokens for the transaction
        uint256 balanceBefore = balanceOf(msg.sender);
        require(balanceBefore >= amount, "insufficient balance");

        // check if the contract has overflow amount of tokens for the transaction
        uint256 balanceRecipient = balanceOf(address(this));
        require(
            balanceRecipient + amount >= balanceRecipient,
            "recipient balance overflow"
        );

        // Transfer token to the contract
        transferFrom(msg.sender, address(this), amount);
    }
}