import { ethers } from 'ethers'
import {
  getCompABI, getTokenABI
} from './file'

export const geCompInstance = (
    address: string,
    wallet: ethers.Wallet
  ): ethers.Contract => {
    const abi = getCompABI()
    const contract = new ethers.Contract(address, abi, wallet)
    return contract
}

export const getTokenInstance = (
  address: string,
  wallet: ethers.Wallet
): ethers.Contract => {
  const abi = getTokenABI()
  const contract = new ethers.Contract(address, abi, wallet)
  return contract
}