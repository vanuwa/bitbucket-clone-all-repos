const Promise = require('bluebird');
const logger = require('../lib/logger')(module);

class Service {
  static run (custom_options = {}) {
    const start_time = process.hrtime();

    return Promise.resolve(custom_options)
      .then(Service.processData)
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

  static processData (custom_options = {}) {
    // TODO: put you processing logic here
    return Promise.resolve(custom_options);
  }
}

module.exports = Service;
