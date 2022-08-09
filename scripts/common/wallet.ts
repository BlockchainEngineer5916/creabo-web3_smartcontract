import { ethers, providers } from 'ethers'


const NETWORK = process.env.NETWORK || 'ganache'
const INFURA_URL = process.env.INFURA_URL || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || ''
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || ''

const URL = () => {
    if (NETWORK === 'rinkeby') return `${INFURA_URL}`
    if (NETWORK === 'mumbai') return `${MUMBAI_RPC_URL}`
    if (NETWORK === 'polygon') return `${POLYGON_RPC_URL}`
    return 'http://localhost:7545'
}

export const provider = new providers.JsonRpcProvider(URL())
  
export const createWalletFromPK = () => {
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    return wallet
}
  
export const getWallet = () => {
    return createWalletFromPK()
}

export const gasLimit = () => {
    if (NETWORK === 'rinkeby') return 20000000;
    if (NETWORK === 'mumbai') return 20000000;
    if (NETWORK === 'polygon') return 30000000;
    return 4500000;
}