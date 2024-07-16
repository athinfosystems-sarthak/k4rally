// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Token} from "./Erc20.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract VestingContract is Initializable, UUPSUpgradeable, AccessControlUpgradeable {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        uint256 id;
        address beneficiary;
        uint256 withdrawTime;
        uint256 amountTotal;
        bool claim;
    }

    mapping(address => VestingSchedule[]) public vestingSchedules;

    address public token;
    uint256 public maxLimit;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_BASIS_POINTS = 10000;
    uint256 public timeLock;

    event TokenReleased(address indexed beneficiary, uint256 amount,uint256 scheduleId);
    event TokensMintedAndVested(uint256 scheduleId, address indexed beneficiary, uint256 withdrawTime, uint256 amount);
    event EmergencyWithdraw(address indexed admin, uint256 amount, address indexed receiver);

    error AddressZeroNotAllowed();
    error AmountMustBeLessMaxLimit();
    error NotEnoughTokenAvailable();
    error NoTokensAvailableForRelease();
    error BeneficiaryNotFound();
    error TokenAlreadyClaimed();
    error InvalidScheduleId();
    error UserNotFound();
    error AmountMustBeGreaterThanZero();
    /// @custom:oz-upgrades-unsafe-allow constructor

    constructor() {
        _disableInitializers();
    }

    function initialize(address adminAddress, address _token, uint256 _maxLimit, uint256 _duration)
        public
        initializer
    {
        token = _token;
        maxLimit = _maxLimit;
        __UUPSUpgradeable_init();
        __AccessControl_init();
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        timeLock = _duration;
    }

    function mintAndVest(address _beneficiary, uint256 _amount) public onlyRole(MINTER_ROLE) {
        if (_beneficiary == address(0)) {
            revert AddressZeroNotAllowed();
        }

        if (_amount > maxLimit) {
            revert AmountMustBeLessMaxLimit();
        }

        Token(token).mint(address(this), _amount);

        uint256 _withdrawTime = block.timestamp + timeLock;

        uint256 scheduleId = vestingSchedules[_beneficiary].length + 1;
        vestingSchedules[_beneficiary].push(
            VestingSchedule({
                id: scheduleId,
                beneficiary: _beneficiary,
                withdrawTime: _withdrawTime,
                amountTotal: _amount,
                claim: false
            })
        );

        emit TokensMintedAndVested(scheduleId, _beneficiary, _withdrawTime, _amount);
    }

    function withdraw( uint256 scheduleId) public {
        address _beneficiary = msg.sender;
        if (scheduleId == 0) {
            revert InvalidScheduleId();
        }
        if (vestingSchedules[_beneficiary].length == 0) {
            revert UserNotFound();
        }
        VestingSchedule storage schedule = vestingSchedules[_beneficiary][scheduleId - 1];

        if (schedule.claim == true) {
            revert TokenAlreadyClaimed();
        }

        uint256 totalAmount = 0;
        if (block.timestamp >= schedule.withdrawTime) {
            totalAmount = schedule.amountTotal;
            schedule.claim = true;
        }
        //camel casing
        if (schedule.amountTotal == 0 || totalAmount == 0) {
            revert NoTokensAvailableForRelease();
        }
        IERC20(token).safeTransfer(_beneficiary, totalAmount);
        emit TokenReleased(_beneficiary, totalAmount,scheduleId);
    }

    function getAllVestingSchedule(address _beneficiary)
        public
        view
        returns (VestingSchedule[] memory vestingSchedule)
    {
        uint256 numSchedules = vestingSchedules[_beneficiary].length;
        VestingSchedule[] memory _vestingSchedule = new VestingSchedule[](numSchedules);

        for (uint256 i = 0; i < numSchedules; i++) {
            _vestingSchedule[i] = vestingSchedules[_beneficiary][i];
        }

        return (_vestingSchedule);
    }

    function emergencyWithdraw(uint256 amount, address receiver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 transferAmount = amount == 0 ? IERC20(token).balanceOf(address(this)) : amount;

        IERC20(token).safeTransfer(receiver, transferAmount);
        emit EmergencyWithdraw(msg.sender, transferAmount, receiver);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
