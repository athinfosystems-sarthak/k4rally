// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, ERC20Capped, ERC20Burnable, Ownable {
    address public vestingContractAddress;

    error minterMustBeVestingContract();

    modifier onlyVestingContract() {
        if (msg.sender != vestingContractAddress) {
            revert minterMustBeVestingContract();
        }
        _;
    }

    constructor(address _owner, address receiver, uint256 maxSupply, string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Capped(maxSupply)
        Ownable(_owner)
    {
        _mint(receiver, 75000000 * 10 ** decimals());
    }

    function setVestingContractAddress(address _vestingContractAddress) external onlyOwner {
        vestingContractAddress = _vestingContractAddress;
    }

    function mint(address to, uint256 amount) external onlyVestingContract {
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value) internal override(ERC20Capped, ERC20) {
        super._update(from, to, value);
    }
}
