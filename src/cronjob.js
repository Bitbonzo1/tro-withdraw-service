
const cron = require('node-cron');
const sendMail = require('./sendMail');
const { processWithdrawals, prepareBalanceReport } = require('./processReports');
const logger = require('./logger');
// const dotenv = require('dotenv');

// dotenv.config();

const startJob = async() => {
    let response;
    try{
        let currentDate = Date.now();
        let endDate = currentDate - 3600000;
        let startDate = endDate - 86400000;
        logger.info(`Started to process withdrwals between period: ${startDate} - ${endDate} at ${currentDate}`);
        response = await processWithdrawals(startDate, endDate);
    } catch (err) {
        logger.error(err.message, err);
        response = {status: 'failed', message: err.toString()}
    } finally {
        try{
            await sendMail('TRO Withdrwal Report',response);
            logger.info('TRO Withdrwal Report sent');
        } catch (error) {
            logger.error('Failed sending TRO Withdrwal Report');
            logger.error(error.message, error);
        }
    }
}

const sendBalanceReport = async() => {
    let response;
    try{
        logger.info(`Started to prepare Balance Report`);
        response = await prepareBalanceReport();
    } catch (err) {
        logger.error(err.message, err);
        response = {status: 'failed', message: err.toString()};
    } finally {
        try{
            if( response && response.status !== 'success' ){
                await sendMail('User Balance Report',response);
                logger.info('User Balance Report sent');
            } else {
                logger.info('Not required to send User Balance Report');
            }
        } catch (error) {
            logger.error('Failed sending User Balance Report');
            logger.error(error.message, error);
        }
    }
}

cron.schedule('30 5 * * *', async() => {
    await startJob();
    await sendBalanceReport();
    },{
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // to stay commented in production
