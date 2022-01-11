const tokenContractABI =  require('./abi/AnyswapV5ERC20.json');
// const tokenContractABI =  require('./abi/PaymentToken.json');
const disperseContractABI =  require('./abi/Disperse.json');
const resolveWeb3 =  require('./getWeb3');
const logger = require('../logger');

const getTokenContract = async (web3) => {
    try {
        // const web3 = await resolveWeb3();
        const networkId = await web3.eth.net.getId();
        // console.log(`Network ID: ${networkId}`);
        const deployedNetwork = tokenContractABI.networks[networkId];
        const tokenContract = new web3.eth.Contract(
            tokenContractABI.abi,
            deployedNetwork && deployedNetwork.address,
        );
        logger.debug(tokenContract);
        return tokenContract;
    } catch (error) {
        // console.log(error);
        throw error;
    }
}

const getDisperseContract = async (web3) => {
    try {
        // const web3 = await resolveWeb3();
        const networkId = await web3.eth.net.getId();
        // console.log(`Network ID: ${networkId}`);
        const deployedNetwork = disperseContractABI.networks[networkId];
        const disperseContract = new web3.eth.Contract(
            disperseContractABI.abi,
            deployedNetwork && deployedNetwork.address,
        );
        logger.debug(disperseContract);
        return disperseContract;
    } catch (error) {
        // console.log(error);
        throw error;
    }
}

module.exports =  {getTokenContract , getDisperseContract};



// var myArgs = process.argv.slice(2);

// if (myArgs.length !== 1) {
//     console.log('Please input value to be split based on');
//     process.exit(1);
// }

// console.log(`Splitting data based on value ${myArgs[0]}`);

// getData(parseInt(myArgs[0]));