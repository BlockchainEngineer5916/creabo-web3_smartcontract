import fs from 'fs';
import { getDeployedPath } from '../common/file';
import { getTokenInstance } from '../common/contract';
import { getWallet } from '../common/wallet';

const network = process.env.NETWORK || 'ganache'
const branch = process.env.BRANCH || 'develop'

async function main() {

  const jsonPath = getDeployedPath(network, branch);
  let content = JSON.parse(fs.readFileSync(jsonPath).toString());

  const tokenName = 'BENZToken';

  const adminWallet = getWallet();

  const token = getTokenInstance(content[tokenName+'ProxyAddress'], adminWallet);

  let nonce = await token.nonce();

  console.log("nonce : ", nonce.toString());

  let checkProxy = await token.checkProxy();

  console.log("checkProxy : ", checkProxy.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});