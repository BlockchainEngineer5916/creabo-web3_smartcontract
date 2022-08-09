import fs from 'fs'
import path from 'path'

const compAbi = require('../../abi/Comp.json');
const tokenAbi = require('../../abi/BaseToken.json');

export const writeJsonToFile = (_path: string, json: any): void => {
  fs.writeFileSync(_path, JSON.stringify(json, null, '    '))
}

export const getDeployedPath = (_network: string, _branch: string): string =>
  path.join(
    __dirname,
    '..',
    '..',
    'deployments',
    _network,
    _branch,
    'deploy.json'
  )

export const getCompABI = () => {
  return compAbi;
};

export const getTokenABI = () => {
  return tokenAbi;
};