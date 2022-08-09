import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import { getDeployedPath, writeJsonToFile } from '../common/file';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());
  
  const Comp = await ethers.getContractFactory('Comp');
  const comp = await upgrades.deployProxy(Comp, ['0x839AD2679141a3288D51D2166453A813E7e3A926']);

  await comp.deployed();

  console.log("Comp deployed to:", comp.address);

  if (!content) content = {};

  const implHex = await ethers.provider.getStorageAt(
    comp.address,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const implAddress = ethers.utils.hexStripZeros(implHex);

  console.log('Comp Impl Address: ', implAddress);
  
  content.CompImplAddress = implAddress;
  content.CompProxyAddress = comp.address;

  writeJsonToFile(jsonPath, content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
