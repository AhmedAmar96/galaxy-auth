import * as winston from 'winston';
import { config } from 'dotenv';
config();
const myFormat = winston.format.printf(
  ({ level, message, label, timestamp, info }) => {
    return `Level: ${level}: Happen At: [${label}]- Date: ${timestamp}  Message: ${message}: ${info}`;
  },
);
export const logger = winston.createLogger({
  level: `${process.env.CONSOLE_LOG_LEVEL}`,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.label({ label: `${process.env.APP_NAME}` }),
    winston.format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    myFormat,
  ),

  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/Combined-' + new Date(Date.now()).toDateString() + '.log',
      level: `${process.env.FILE_LOG_LEVEL_1}`,
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: 'logs/Errors-' + new Date(Date.now()).toDateString() + '.log',
      level: `${process.env.FILE_LOG_LEVEL_2}`,
    }),
  ],
});
