// import fs from 'fs';
// import { getDeployedPath } from '../common/file';
// import { getPricingInstance } from '../common/contract';
// import { getWallet } from '../common/wallet';

// const network = process.env.NETWORK || 'ganache'
// const branch = process.env.BRANCH || 'develop'

// async function main() {

//   let newPrice = 50;

//   const jsonPath = getDeployedPath(network, branch);
//   let content = JSON.parse(fs.readFileSync(jsonPath).toString());

//   const adminWallet = getWallet();
//   const pricing = getPricingInstance(content.ContractAddress, adminWallet);

//   const txReceipt = await pricing.setPricing(newPrice);
//   console.log('txReceipt: ', txReceipt);
//   console.log("New Price is set");
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
