import fs from 'fs';
import { getDeployedPath } from '../common/file';
import { geCompInstance } from '../common/contract';
import { getWallet } from '../common/wallet';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());

  const adminWallet = getWallet();

  const comp = geCompInstance(content.CompProxyAddress, adminWallet);

  let balance = await comp.balanceOf('0x839AD2679141a3288D51D2166453A813E7e3A926');

  console.log("balance : ", balance.toString());

  let balanceOfTest = await comp.balanceOfTest('0x839AD2679141a3288D51D2166453A813E7e3A926');

  console.log("balanceOfTest : ", balanceOfTest.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
