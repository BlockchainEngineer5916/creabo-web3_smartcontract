// import fs from 'fs';
// import { getDeployedPath } from '../common/file';
// import { getTokenInstance } from '../common/contract';
// import { getWallet } from '../common/wallet';

// const network = process.env.NETWORK || 'ganache'
// const branch = process.env.BRANCH || 'develop'

// async function main() {

//   const jsonPath = getDeployedPath(network, branch);
//   let content = JSON.parse(fs.readFileSync(jsonPath).toString());

//   const adminWallet = getWallet()

//   const token = getTokenInstance(content.TokenContractAddress, adminWallet);

//   let totalSupply = await token.totalSupply();

//   console.log("totalSupply : ", totalSupply.toString());
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
