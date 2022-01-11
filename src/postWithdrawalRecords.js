const axios = require('axios');
const logger = require('./logger');

const withdrawalPostOptions = {
    headers: {
        'Authority': 'trodl.com',
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'servicetoken': 'cmfservicetoken',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
        'Content-Type': 'text/plain',
        'Sec-GPC': '1',
        'Origin': 'https://admin.trodl.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://admin.trodl.com/',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
    }
}

const handleAxiosError = (error) => {
    logger.error(`Post Error from library:`);
    console.log(error);
    throw error;
}

const handleUnexpectedError = (error) => {
    logger.error(`Unexpected POST Error:`);
    console.log(error);
    throw error;
}

const postUsingApi = async(processedCSV) => {

    // sudeep
    // processedCSV = "uuid,total_amount,amount_withdraw,fees,currency,status,address,createdAt,reason,transactionHash,external_trxn_hash\n3270,63100,63000,100,tro,released,0xBF8dE791ADB7A55391fb3efB540Ce6515a8961af,Tue Dec 21 2021 16:28:40 GMT+0000 (Coordinated Universal Time),'',947eee0b80e1274c3f61bcc4c1877ac7f8dad3f0f2f48e0d3152a63ed0edba02,'0x1cd6667b4d610d94ca039e8b5c61b5c7f0bad0e1896202cd7df3bb44b3125732'\n1925290,133000,132900,100,tro,released,0xC3dBe2E5BdDFA8819821e7A83C8C0e760AC22E5d,Wed Dec 22 2021 13:08:16 GMT+0000 (Coordinated Universal Time),'',fd3fd342f14efe421bd4ffb629abcb589a5a606912873528369c924e5dc64a2d,'0x1cd6667b4d610d94ca039e8b5c61b5c7f0bad0e1896202cd7df3bb44b3125732'\n";

    let url;
    if(process.env.NODE_ENV !== 'production') {
        url = `https://stage.trodl.com/backend/finance/withdrawal/update-withdrawals-status`;
    } else {
        url = `https://trodl.com/backend/finance/withdrawal/update-withdrawals-status`;
    }
    
    try {
        let response = await axios.post( url, processedCSV, withdrawalPostOptions);
        if(response && response.status === 200) {
            logger.info('Withdrwal Update request processed successfully');
            logger.info(JSON.stringify(response.data));
        } else {
            throw new Error(`Withdrawal Post req failed with status ${response.status}`);
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            handleAxiosError(error);
        } else {
            handleUnexpectedError(error);
        }
    }
}

const postProcessedWithdrwalRecords = async(processedCSV) => {
    let data = await postUsingApi(processedCSV);
    return data;
}


module.exports = postProcessedWithdrwalRecords;