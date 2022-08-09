import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import { getDeployedPath, writeJsonToFile } from '../common/file';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());
  
  const NameRegistry = await ethers.getContractFactory('NameRegistry');
  const nameRegistry = await NameRegistry.deploy();
  await nameRegistry.deployed();

  console.log("NameRegistry Contract deployed to:", nameRegistry.address);

  if (!content) content = {};

  const implHex = await ethers.provider.getStorageAt(
    nameRegistry.address,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const implAddress = ethers.utils.hexStripZeros(implHex);

  console.log('NameRegistry Contract Impl Address: ', implAddress);
  
  content.NameRegistryContractImplAddress = implAddress;
  content.NameRegistryContractAddress = nameRegistry.address;

  writeJsonToFile(jsonPath, content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
