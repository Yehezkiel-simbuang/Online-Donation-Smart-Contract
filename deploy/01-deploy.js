require("dotenv").config();
const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, get } = deployments;
    const chainID = network.config.chainId;

    let priceFeedadd;
    if (chainID == 31337) {
        const MockAggregator = await get("MockV3Aggregator");
        priceFeedadd = MockAggregator.address;
    } else {
        priceFeedadd = networkConfig[chainID]["ethTousdpricefeed"];
    }

    const donate_contract = await deploy("Donate", {
        from: deployer,
        args: [priceFeedadd],
        log: true,
    });

    console.log(`Address : ${donate_contract.address}`);

    console.log(`Deployer : ${deployer}`);

    console.log("Contract deployed");

    if (chainID != 31337 && process.env.ETHERSCAN_API) {
        await verify(donate_contract.address, [priceFeedadd]);
        console.log("Contract verified");
    }
};
module.exports.tags = ["all", "Contract"];
