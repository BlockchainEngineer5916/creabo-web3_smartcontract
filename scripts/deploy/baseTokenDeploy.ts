import { ethers, upgrades } from "hardhat";
import fs from 'fs';
import { getDeployedPath, writeJsonToFile } from '../common/file';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());

  const name = 'BENZ';
  const symbol = 'BENZToken';

  const URI_PREFIX = 'https://myodisnftstorage.blob.core.windows.net/'+symbol+'/';
  const SCHEME_DIGEST = '0x6c89bb8a0668559be3b6d0acddc774db35815b8a2abee0cdf4daf742ca125f4b';

  const BaseToken = await ethers.getContractFactory('BaseToken', {
    libraries: {
      IDGenerator: content.IDGenerator,
    },
  })

  const baseToken = await upgrades.deployProxy(BaseToken, [
      name,
      symbol,
      URI_PREFIX,
      SCHEME_DIGEST,
      symbol,
    ], { unsafeAllowLinkedLibraries: true });

  await baseToken.deployed();

  console.log(symbol+" deployed to:", baseToken.address);

  if (!content) content = {};

  const implHex = await ethers.provider.getStorageAt(
    baseToken.address,
    "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  );
  const implAddress = ethers.utils.hexStripZeros(implHex);

  console.log(symbol+' Impl Address: ', implAddress);
  
  content[symbol+'ImplAddress'] = implAddress;
  content[symbol+'ProxyAddress'] = baseToken.address;

  writeJsonToFile(jsonPath, content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
