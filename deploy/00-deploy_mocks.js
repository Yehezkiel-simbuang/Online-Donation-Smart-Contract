const {network} = require("hardhat");

const DECIMALS = "8";
const INITIAL_ANSWER = "100000000000";
module.exports = async({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainID = network.config.chainId;

    if (chainID == 31337) {
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log : true,
        });

        console.log("Mock deployed");
        console.log("------------------------------------------")
    }
}

module.exports.tags = ["all", "Mocks"];