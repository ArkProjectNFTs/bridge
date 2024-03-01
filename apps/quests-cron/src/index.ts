import cron from 'node-cron';
import pino from 'pino';

const logger = pino();

cron.schedule('*/10 * * * * *', () => {    
  logger.trace('Checking bridge requests...');
});