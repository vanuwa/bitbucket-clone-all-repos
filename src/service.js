// main service file
const Promise = require('bluebird');
const logger = require('../lib/logger')(module);

class Service {
  static importRawData () {
    const start_time = process.hrtime();
    const custom_options = {};

    return Promise.resolve(custom_options)
    // .then() <--- Put your custom processing into then()
      .then(() => logger.info('[ SUCCESS ] Importing DONE.'))
      .catch((exception) => {
        logger.error(exception);
        logger.error('[ FAIL ] Importing FAILED.');
      })
      .finally(() => {
        const end_time = process.hrtime(start_time);
        const seconds = end_time[0];
        const milliseconds = end_time[1] / 1000000;

        logger.info('Execution time: %ds %dms', seconds, milliseconds);

        return end_time;
      });
  }

  static cleanData () {
    const start_time = process.hrtime();
    const custom_options = {};

    return Promise.resolve(custom_options)
    // .then() <--- Put your custom processing into then()
      .then(() => logger.info('[ SUCCESS ] Cleaning DONE.'))
      .catch((exception) => {
        logger.error(exception);
        logger.error('[ FAIL ] Cleaning FAILED.');
      })
      .finally(() => {
        const end_time = process.hrtime(start_time);
        const seconds = end_time[0];
        const milliseconds = end_time[1] / 1000000;

        logger.info('Execution time: %ds %dms', seconds, milliseconds);

        return end_time;
      });
  }

  static run () {
    const start_time = process.hrtime();
    const custom_options = {};

    return Promise.resolve(custom_options)
      .then(Service.importRawData)
      .then(Service.cleanData)
      .then(() => logger.info('[ SUCCESS ] Processing DONE.'))
      .catch((exception) => {
        logger.error(exception);
        logger.error('[ FAIL ] Processing FAILED.');
      })
      .finally(() => {
        const end_time = process.hrtime(start_time);
        const seconds = end_time[0];
        const milliseconds = end_time[1] / 1000000;

        logger.info('Execution time: %ds %dms', seconds, milliseconds);

        return end_time;
      });
  }
}

module.exports = Service;
