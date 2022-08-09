# creabo-web3_smartcontract

## Environment Requirements
- Node v14.15.4
- Yarn
- Ganache

## Steps to run
1. Clone the code
2. run 
    ```
    yarn install
    ```
3. Set environment variables in .env file follwing the .env.example file
    ```
    NETWORK=ganache
    PRIVATE_KEY=
    PRIVATE_KEY_GANACHE=
    ```
4. The project comes with a contract, test cases for that contract, scripts that deploys and uses that contract.
    ```
    yarn clean 
    yarn node
    yarn compile
    yarn deploy:hardhat
    yarn deploy:ganache
    yarn exec:get:pricing:ganache
    yarn exec:set:pricing:ganache
    yarn test
    ```
5. Add .npmrc with respective values and run script to publish into github npm registry with a new version in the package.json
    ```
    yarn npm-publish
    ```