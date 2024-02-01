// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XP is ERC20 {
    constructor(uint256 initialSupply) ERC20("XP", "XP") {
        _mint(msg.sender, initialSupply);
    }
}
