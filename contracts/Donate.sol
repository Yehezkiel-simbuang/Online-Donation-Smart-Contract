// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./ChainlinkPriceFeed.sol";

contract Donate {
    using PriceFeed for uint256;

    struct Info {
        address _address;
        string name;
        uint256 LimitInUSD;
        uint256 AmountInWEI;
        uint256 Timestamp;
    }

    AggregatorV3Interface private priceFeed;

    Info[] private Donation;

    event Success(uint256 amount, address sender);

    error NotFunder();

    error AcceptanceRequirements();

    error IDNotFound();

    error CallFail();

    modifier FundRaiser(uint256 _id) {
        //require(Donation[_id]._address == msg.sender, "You are not a fundraiser of this donation.");
        if (Donation[_id]._address != msg.sender) {
            revert NotFunder();
        } //more efficient than using require statement
        _;
    }

    modifier WithdrawalConditions(uint256 _id) {
        /*require(block.timestamp >= (Donation[_id].Timestamp + 1 weeks) ||
        (Donation[_id].AmountInWEI.PriceConverter()) >= (Donation[_id].LimitInUSD * 1e18), "does not meet the acceptance requirements");*/

        if (
            block.timestamp <= (Donation[_id].Timestamp + 1 weeks) &&
            (Donation[_id].AmountInWEI.PriceConverter(priceFeed)) <=
            (Donation[_id].LimitInUSD * 1e18)
        ) {
            revert AcceptanceRequirements();
        }
        _;
    }

    modifier FoundID(uint256 _id) {
        if (Donation[_id]._address == address(0)) {
            revert IDNotFound();
        }
        _;
    }

    constructor(address feed) {
        priceFeed = AggregatorV3Interface(feed);
    }

    receive() external payable {}

    fallback() external payable {}

    function create(string memory _name, uint _LimitInUSD) public {
        Info memory _info;
        _info.name = _name;
        _info.LimitInUSD = _LimitInUSD;
        _info._address = msg.sender;
        _info.Timestamp = block.timestamp;
        Donation.push(_info);
    }

    function participate(uint256 _id) public payable FoundID(_id) {
        Donation[_id].AmountInWEI += msg.value;
    }

    function withdraw(
        uint256 _id
    ) public FoundID(_id) FundRaiser(_id) WithdrawalConditions(_id) {
        uint256 amount = Donation[_id].AmountInWEI;
        delete Donation[_id];
        (bool success, ) = payable(msg.sender).call{value: amount}("");

        if (!success) {
            revert CallFail();
        } else {
            emit Success(amount, msg.sender);
        }
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    function getDonation(uint256 Index) public view returns (Info memory) {
        return Donation[Index];
    }
}
