const Promise = require('bluebird');
// const settings = require('config');
const logger = require('../lib/logger')(module);
const util = require('util');

const gc_big_query = require('@google-cloud/bigquery');

class Aggregator {

  /**
   * Default values for configuration properties
   * @returns {object} default values for corresponding properties
   * @private
   */
  static get _default_configuration () {
    return {

      /* Expected arguments */
      gcp_project_id: null,
      sql_query: null,
      use_sql_query_parameters: null,
      sql_query_parameters: null, // [{ name: <parameter_name>, value: <parameter_value>, type: <parameter_type> }, ...]
      use_legacy_sql: null,
      data_set_name: null,
      data_set_location: null, // 'EU'
      table_name: null,
      table_schema: null,
      table_time_partitioning: null, // 'DAY'
      partition_date: null,
      write_disposition: null, // 'WRITE_APPEND', 'WRITE_TRUNCATE', 'WRITE_EMPTY'

      /* Service variables */
      sql_query_parameters_formatted: null,
      table_partition_decorator: null,
      metadata: null,
      error: null
    };
  }

  /**
   * Extend default setting with configuration received from event message
   * @param {object} custom_configuration Configuration for aggregation job
   * @returns {Promise.<object>} populated configuration for further processing (aggregation)
   */
  static configure (custom_configuration = {}) {
    return Promise.resolve(Object.assign(
      {},
      Aggregator._default_configuration,
      custom_configuration
    ));
  }

  static execute (configuration) {
    return Promise
      .resolve(configuration)
      .then(Aggregator.validateConfiguration)
      .then(Aggregator.ensureDestinationDatasetExist)
      .then(Aggregator.clean);
  }

  // TODO: implement validation for each property
  /**
   * Validate presence of all required data for further processing (aggregating)
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with validated job_data or rejects with corresponding error message
   */
  static validateConfiguration (configuration) {
    return new Promise((resolve, reject) => {
      if (!configuration) {
        const error = new Error(`Job configuration is invalid. Expected 'configuration' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      if (!configuration.gcp_project_id) {
        const error = new Error(`Job configuration is invalid. Expected 'configuration.gcp_project_id' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      if (!configuration.sql_query) {
        const error = new Error(`SQL Query is not present. Expected 'configuration.sql_query' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      return resolve(configuration);
    });
  }

  /**
   * Ensure that destination dataset exist. Auto create dataset according to configuration within job_data
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with job_data or rejects with corresponding error message
   */
  static ensureDestinationDatasetExist (configuration) {
    return new Promise((resolve, reject) => {
      const data_set_instance = gc_big_query.dataset(configuration.data_set_name);
      const options = {
        autoCreate: true,
        location: configuration.data_set_location
      };

      data_set_instance.get(options, (error, data_set) => {
        if (error) {
          return reject(error);
        }

        logger.debug(`[ X ] Ensure destination Dataset "${configuration.data_set_name}" exist. Metadata: ${util.inspect(data_set.metadata, null, 10)}`);

        return resolve(configuration);
      });
    });
  }

  static clean (configuration) {
    return new Promise((resolve, reject) => {
      try {
        // Reflect.deleteProperty(configuration, 'table_schema');

        logger.debug(`[ ~ ] Clean. ${util.inspect(configuration)}`);

        return resolve(configuration);
      } catch (exception) {
        return reject(exception);
      }
    });
  }
}

module.exports = Aggregator;
