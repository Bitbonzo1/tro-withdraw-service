const winston = require('winston');
require('winston-daily-rotate-file');

var fs = require( 'fs' );
var path = require('path');

var logDir = 'log'; // directory path you want to set
if ( !fs.existsSync( logDir ) ) {
    // Create the directory if it does not exist
    fs.mkdirSync( logDir );
}

const fileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir,'tro-withdrwal-cronjob-%DATE%.log'),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.json()
    ),
});

const consoleTransport = new winston.transports.Console({

    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.simple()
        ),
    });

var logger = winston.createLogger({
    transports: [
        fileTransport,
        consoleTransport
    ],
});

module.exports = logger;