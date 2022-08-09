import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import 'hardhat-abi-exporter';
import '@openzeppelin/hardhat-upgrades';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const infura_url = process.env.INFURA_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || '';
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// const gasPrice = 500000000000; // 500 gwei
const gasPrice = 5000000000; // 5 gwei

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  paths: {
    sources: 'contracts',
  },
  abiExporter: {
    path: './abi',
    clear: true, // delete old files before export
    flat: true, // all abi json files directly under path
    only: [
      'Comp',
      'GovernorAlpha',
      'Timelock',
      'MainContract',
      'BaseToken'
    ],
    runOnCompile: true,
  },
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
    },
    ganache: {
      url: 'http://localhost:7545',
      gasPrice
    },
    rinkeby: {
      url: infura_url,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      chainId: 80001,
      url: `${MUMBAI_RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice,
    },
    polygon: {
      chainId: 137,
      url: `${POLYGON_RPC_URL}`,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice,
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;