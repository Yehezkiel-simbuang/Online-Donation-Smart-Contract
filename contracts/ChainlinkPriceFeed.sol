//SPDX-License-Identifier:MIT

pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceFeed {
    function EthToUSD(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256((price / 1e8) * 1e18);
    }

    function PriceConverter(
        uint256 amount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 priceNow = EthToUSD(priceFeed);
        return uint256((priceNow * amount) / 1e18);
    }
}
