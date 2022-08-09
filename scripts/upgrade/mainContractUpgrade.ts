import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import { getDeployedPath, writeJsonToFile } from '../common/file';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());

  const MainContract = await ethers.getContractFactory('MainContract');
  const upgraded = await upgrades.upgradeProxy(content.MainContractProxyAddress, MainContract);

  console.log("MainContract is upgraded.");

  const implHex = await ethers.provider.getStorageAt(
    content.MainContractProxyAddress,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const implAddress = ethers.utils.hexStripZeros(implHex);

  console.log('MainContract New Impl Address: ', implAddress);
  
  content.MainContractImplAddress = implAddress;

  writeJsonToFile(jsonPath, content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
