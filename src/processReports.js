const {getFormatedWithdrawalRecords, sendProcessedRecords} = require('./formatAndSendRecords');
const {getDisperseContract, getTokenContract} = require('./web3/getContractInstance');
const resolveWeb3 = require('./web3/getWeb3');
const BigNumber = require('bignumber.js');
const logger = require('./logger');

const calculateTotalTRO = async(web3, recipients, amounts, account) => {
    const disperseContract = await getDisperseContract(web3);
    const total = await disperseContract.methods.getTotal(recipients, amounts).call({from: account});

    return total;
}

const getTROBalance = async(web3, account) => {
    const tokenContract = await getTokenContract(web3);
    const balance = await tokenContract.methods.balanceOf(account).call({from: account});
    return balance;
}


const getEstimatedGasForTx = async(web3, recipients, amounts, account) => {
    const disperseContract = await getDisperseContract(web3);
    const tokenContract = await getTokenContract(web3);
    const estimatedGas = await disperseContract.methods.disperseToken(tokenContract._address,recipients, amounts).estimateGas({from: account});

    return estimatedGas;
}

const getGasPriceForTx = async(web3) => {

    const gasPrice = await web3.eth.getGasPrice();

    return gasPrice;
}

const getFeeForWithdrawTx = async(web3, recipients, amounts, account) => {
    let estimatedGas = await getEstimatedGasForTx(web3, recipients, amounts, account);
    let gasPrice = await getGasPriceForTx(web3);

    let gasFee = new BigNumber(estimatedGas).multipliedBy(gasPrice);
    return gasFee;
}

const checkForSufficientTRO = async(web3, recipients, amounts, troHolder) => {

    try {

        const total = await calculateTotalTRO(web3, recipients, amounts, troHolder);
        logger.info(`Total TRO required for withdrwal: ${total}`);
        
        logger.debug(troHolder);
        logger.debug(recipients);
        logger.debug(amounts);
        const troHolderBalance = await getTROBalance(web3, troHolder);
        // console.log(troHolderBalance);
        
        requiredTRO = new BigNumber(total);
        balanceTRO = new BigNumber(troHolderBalance);
        
        if(!balanceTRO.isGreaterThanOrEqualTo(requiredTRO)){
            logger.error(`Insufficient Balance, User :${troHolder}, TRO Balance: ${troHolderBalance}`);
            throw new Error('Insufficient TRO balance');
        } else {
            logger.info(`Sufficient Balance, User :${troHolder}, TRO Balance: ${troHolderBalance}`);
        }
        
        return total;
    } catch(error) {
        // console.log(error);
        throw error;
    }
}


const checkForSufficientBNB = async(web3, recipients, amounts, troHolder) => {
    try {
        let availableBNB = await web3.eth.getBalance(troHolder);
        availableBNB = new BigNumber(availableBNB);
        // console.log(availableBNB);
        
        const withdrawGasFee = await getFeeForWithdrawTx(web3, recipients, amounts, troHolder);
        logger.info(`Estimated fee for tx: ${withdrawGasFee}`);

        if(!availableBNB.isGreaterThanOrEqualTo(withdrawGasFee)){
            logger.error(`Insufficient Balance, User :${troHolder}, BNB Balance: ${availableBNB}`);
            throw new Error('Insufficient BNB balance');
        } else {
            logger.info(`Sufficient Balance, User :${troHolder}, BNB Balance: ${availableBNB}`);
        }
    } catch(error) {
        // console.log(error);
        throw error;
    }
}

const approveTRO = async(web3, account, troAmount) => {
    try {
        const tokenContract = await getTokenContract(web3);
        const disperseContract = await getDisperseContract(web3);
        let tx = await tokenContract.methods.approve(disperseContract._address, troAmount).send({from: account})
        .on('transactionHash', function (hash) {
            logger.info(`Approve Tx : ${hash}`);
        });
        let amt = web3.utils.fromWei(tx.events.Approval.returnValues.value, 'ether');
        logger.info(`Approve Tx Successful : ${amt}`);
    } catch (err) {
        // console.log(err.message);
        throw err;
    }
}

const disperseTokens = async(web3, recipients, amounts, account) => {
    try {
        const disperseContract = await getDisperseContract(web3);
        const tokenContract = await getTokenContract(web3);
        let tx = await disperseContract.methods.disperseToken(tokenContract._address,recipients, amounts).send({from: account})
        .on('transactionHash', function (hash) {
            logger.info(`Disperse Tx : ${hash}`);
        });
        let amt = web3.utils.fromWei(tx.events.ALL_TRANSFERRED.returnValues.value, 'ether');
        logger.info(`Disperse Tx Successful for : ${amt} TRO at block: ${tx.events.ALL_TRANSFERRED.returnValues.block} `);
        return tx;
    } catch (err) {
        // console.log(err.message);
        throw err;
    }
}

const buildResponse =  (records, failedRecipients, disperseTx) => {
    let responseRecords = [...records];

    // first mark all as released
    responseRecords.map((record, i) => {
        record.external_trxn_hash = disperseTx.transactionHash;
        record.status = 'released';
    });
    // then mark the failed ones as failure
    responseRecords.map((record, i) => {
        failedRecipients.map((failedOne,i) => {
            if( failedOne.address === record.address){
                record.status = 'failed';
                record.reason = failedOne.reason;
            } 
        })
    });

    return responseRecords;
}

const processWithdrawals = async(startDate, endDate) => {

    let web3 = null;
    let result;
    try{
        let records = await getFormatedWithdrawalRecords(startDate, endDate);
        logger.info(JSON.stringify(records));

        if(records.length === 0) {
            logger.info(`No withdrawals to process in the period ${startDate} - ${endDate}`);
            return {status: 'success', message: 'ZERO_RECORDS_FOUND'};
        }
        
        let recipients = [];
        let amounts = [];
        let failedRecipients = [];
        
        web3 = await resolveWeb3();
        records.map( (record, index)=> {
            try {
                if(web3.utils.checkAddressChecksum(record.address)){
                    if ( record.currency !== 'tro'){
                        failedRecipients.push({address: record.address, reason: 'Currency Not Supported'});
                    } else {
                        recipients.push(record.address);
                        amounts.push(web3.utils.toWei(record.amount_withdraw,'ether'));
                    }
                } 
                else {
                    failedRecipients.push({address: record.address, reason: 'Invalid Address'});
                }
            }catch(error){
                // console.log(error);
                failedRecipients.push({address: record.address, reason: 'Invalid Address'});
            }
        });
        
        const accounts = await web3.eth.getAccounts();
        const troHolder = accounts[0];

        const total = await checkForSufficientTRO(web3, recipients,amounts, troHolder);
        
        await approveTRO(web3, troHolder, total);

        await checkForSufficientBNB(web3, recipients, amounts, troHolder);

        let disperseTx = await disperseTokens(web3, recipients, amounts, troHolder);
        logger.info(JSON.stringify(disperseTx));

        let responseRecords = buildResponse(records, failedRecipients, disperseTx);

        logger.info(JSON.stringify(responseRecords));

        result = await sendProcessedRecords(responseRecords);
        
        if(result.status === 'success'){
            console.log('Withdrwal update was processed successfully');
        } else {
            console.log(result);
            throw new Error('Unexpected Error');
        }
        
    } catch(error) {
        // console.log(error);
        throw error;
    } finally {
        // At termination, `provider.engine.stop()' should be called to finish the process elegantly.
        if (web3){
            web3.currentProvider.engine.stop();
        }
    }
    return { status: result.status, message: JSON.stringify(result.data)};
}

const prepareBalanceReport = async() => {
    let web3 = null;
    let result;
    
    try{
        let msg = '';
        web3 = await resolveWeb3();
        const accounts = await web3.eth.getAccounts();
        const troHolder = accounts[0];

        let troBalance = await getTROBalance( web3, troHolder);
        let troBalanceBig = new BigNumber(troBalance);
        if(!troBalanceBig.isGreaterThanOrEqualTo(await web3.utils.toWei('100000','ether'))){
            logger.info(`Insufficient TRO Balance, User :${troHolder}, TRO Balance: ${troBalance}`);
            msg = `Insufficient TRO Balance, User :${troHolder}, TRO Balance: ${troBalance}`;
        } else {
            logger.info(`Sufficient TRO Balance, User :${troHolder}, TRO Balance: ${troBalance}`);
        }

        if(msg !== '') {
            result = {status: 'warning', message: msg};
            msg = '';
        }
        
        let availableBNB = await web3.eth.getBalance(troHolder);
        let availableBNBBig = new BigNumber(availableBNB);

        if(!availableBNBBig.isGreaterThanOrEqualTo(await web3.utils.toWei('0.1','ether'))){
            logger.info(`Insufficient Balance, User :${troHolder}, BNB Balance: ${availableBNB}`);
            msg = `Insufficient Balance, User :${troHolder}, BNB Balance: ${availableBNB}`;
        } else {
            logger.info(`Sufficient Balance, User :${troHolder}, BNB Balance: ${availableBNB}`);
        }

        if(msg !== '') {
            result.message = result.message.concat(msg);
        }
        
    } catch(error) {
        throw error;
    } finally {
        // At termination, `provider.engine.stop()' should be called to finish the process elegantly.
        if (web3){
            web3.currentProvider.engine.stop();
        }
    }
    return result;

}

module.exports = { processWithdrawals, prepareBalanceReport };