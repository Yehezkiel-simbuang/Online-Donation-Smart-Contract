require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers");
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: process.env.ALCHEMY_URL,
            accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_2],
            chainId: 11155111,
        },
        hardhat: {
            chainId: 31337,
        },
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_API,
    },

    solidity: {
        compilers: [{ version: "0.8.18" }, { version: "0.6.6" }],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    mocha: {
        timeout: 4000000,
    },
};
