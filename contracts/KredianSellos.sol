// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KredianSellos {
    mapping(bytes32 => uint256) public selladoEn;
    event Sellado(bytes32 indexed hash, uint256 fecha);

    function sellar(bytes32 hash) external {
        require(selladoEn[hash] == 0, "Ya sellado");
        selladoEn[hash] = block.timestamp;
        emit Sellado(hash, block.timestamp);
    }
}
