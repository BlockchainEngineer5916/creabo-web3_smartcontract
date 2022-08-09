import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import { getDeployedPath, writeJsonToFile } from '../common/file';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());

  const factory = await ethers.getContractFactory('IDGenerator');
  const idGenerator = await factory.deploy();
  await idGenerator.deployed();

  console.log("IDGenerator deployed to:", idGenerator.address);

  if (!content) content = {};

  content.IDGenerator = idGenerator.address;

  writeJsonToFile(jsonPath, content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
