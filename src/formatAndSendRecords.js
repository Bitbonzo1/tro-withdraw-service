const { parse } = require('csv-parse/sync');
const { Parser } = require('json2csv');
const queryWithdrawalReqs = require('./queryWithdrawalReqs');
const postProcessedWithdrwalRecords = require('./postWithdrawalRecords');
const logger = require('./logger');


async function getFormatedWithdrawalRecords(startDate, endDate){
    
    try {
        let result = await queryWithdrawalReqs(startDate, endDate);
        if(!result || result.status === 'error') {
            if(result.message === 'No records found') {
                return [];
            } else {
                throw new Error(result.message);
            }
        }
        // logger.info(result);
        const records = parse(result, {
            columns: true,
            skip_empty_lines: true
        });
        logger.info(`Found ${records.length} withdrwal records for processing period: ${startDate} - ${endDate}.`);
        return records;
    } catch (error) {
        // console.log(error);
        throw error
    } 
}

const convertToCSV = (processedRecords) => {
    
    const json2csvParser = new Parser();
    const processedCSV = json2csvParser.parse(processedRecords);
    return processedCSV;
}

async function sendProcessedRecords(processedRecords){

    try{
        if(!(processedRecords && processedRecords.length !== 0)){
            throw new Error('No Processed Records');
        }
        let processedCSV = convertToCSV(processedRecords);
        let result = await postProcessedWithdrwalRecords(processedCSV);
        return result;
    } catch (error) {
        // console.log(error);
        throw error
    } 
}

module.exports = { getFormatedWithdrawalRecords, sendProcessedRecords};

// sendProcessedRecords(processedRecords);