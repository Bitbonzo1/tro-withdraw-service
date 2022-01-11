const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const logger = require('./logger');

const withdrawlReq = {
    baseURL: '',
    headers: {
        'authority': 'trodl.com',
        'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
        'accept': 'text/csv',
        'content-type': 'text/csv; charset=utf-8',
        'servicetoken': 'cmfservicetoken',
        'sec-ch-ua-mobile': '?0',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54 Safari/537.36',
        'sec-ch-ua-platform': '"Linux"',
        'origin': 'https://admin.trodl.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://admin.trodl.com/',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'cookie': '__auc=1cc0014f17a42568cdccb5e9877; G_ENABLED_IDPS=google; G_AUTHUSER_H=1; theme=darkTheme; _ga=GA1.2.1820973703.1633418354; _ga_EBG0Z4ZX0S=GS1.1.1638385672.120.0.1638385672.0'
    }
}

const handleAxiosError = (error) => {
    logger.error(`Query Error from library:`);
    Console.log(error);
    throw error;
}

const handleUnexpectedError = (error) => {
    logger.error(`Unexpected Query Error:`);
    console.log(error);
    throw error;
}

const fetchFromApi = async(startDate, endDate) => {

    let url;
    if(process.env.NODE_ENV !== 'production') {
        url = `https://stage.trodl.com/backend/finance/withdrawal/get-withdrawals?startDate=${startDate}&endDate=${endDate}%27`;
    } else {
        url = `https://trodl.com/backend/finance/withdrawal/get-withdrawals?startDate=${startDate}&endDate=${endDate}%27`;
    }

    withdrawlReq.baseURL = url;
    try {
        let response = await axios.get( null, withdrawlReq);
        if(response && response.status === 200) {
            logger.info('Withdrwal query request processed successfully');
            logger.info(response.data);
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

const queryWithdrawalReqs = async(startDate, endDate) => {
    let data = await fetchFromApi(startDate, endDate);
    return data;
} 

module.exports = queryWithdrawalReqs;

// let endDate = 1641799857000;
// let startDate = 1639506600000;
// queryWithdrawalReqs(startDate, endDate);