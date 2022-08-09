// import fs from 'fs';
// import { getDeployedPath } from '../common/file';
// import { getTokenInstance } from '../common/contract';
// import { gasLimit, getWallet } from '../common/wallet';

// const network = process.env.NETWORK || 'ganache'
// const branch = process.env.BRANCH || 'develop'

// async function main() {

//   // let toAddress = '0xEB7e365762Db24035A7Fd191180461830Da31037';
//   let toAddress = '0x219c0c9997953D7C3a9Dee08bD29f3c3e20f55D0';
//   let amount = 1;

//   const jsonPath = getDeployedPath(network, branch);
//   let content = JSON.parse(fs.readFileSync(jsonPath).toString());

//   const adminWallet = getWallet();
//   const token = getTokenInstance(content.TokenContractAddress, adminWallet);

//   const txReceipt = await token.mint(toAddress, amount, {
//       gasLimit : gasLimit()
//   });
//   console.log('txReceipt: ', txReceipt);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });