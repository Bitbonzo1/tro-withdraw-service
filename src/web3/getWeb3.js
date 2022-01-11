const Web3 = require('web3');
const HDWalletProvider =  require('@truffle/hdwallet-provider');
const logger = require('../logger');

// mainnet 
const mainnet = 'https://bsc-dataseed1.binance.org:443';

// testnet
const testnet =  'https://data-seed-prebsc-1-s1.binance.org:8545';

const resolveWeb3 = async () => {
    try {
        let provider;
        const privateKey = process.env.PRIVATE_KEY.toString().trim();
        if(process.env.NODE_ENV.toString().trim() !== 'production') {
            provider =  new HDWalletProvider( privateKey, testnet);
        } else {
            provider =  new HDWalletProvider( privateKey, mainnet);
        }
        const web3 = new Web3(provider);
        const networkId = await web3.eth.net.getId();
        logger.info(`Network ID: ${networkId}`);
        return web3;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

module.exports = resolveWeb3;
