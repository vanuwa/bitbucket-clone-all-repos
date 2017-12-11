const Promise = require('bluebird');
// const settings = require('config');
const logger = require('../lib/logger')(module);
const util = require('util');

const DEFAULT_SQL_QUERY_PARAMETER_TYPE = 'STRING';

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
      .then(Aggregator.ensureDestinationTableExist)
      .then(Aggregator.buildDatePartitionDecorator)
      .then(Aggregator.formatSQLQueryParameters)
      .then(Aggregator.executeAggregationJob)
      .then(Aggregator.clean);
  }

  // TODO: implement validation for each property
  /**
   * Validate presence of all required data for further processing (aggregating)
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with validated configuration or rejects with corresponding error message
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

      if (!configuration.sql_query || typeof configuration.sql_query !== 'string') {
        const error = new Error(`SQL Query is not present. Expected 'configuration.sql_query' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      if (!configuration.data_set_name || typeof configuration.data_set_name !== 'string') {
        const error = new Error(`Data Set name is not present or nullable. Expected 'configuration.data_set_name' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      if (!configuration.table_name || typeof configuration.table_name !== 'string') {
        const error = new Error(`Table name is not present or nullable. Expected 'configuration.table_name' to be defined. 'configuration' is ${configuration}`);

        return reject(error);
      }

      return resolve(configuration);
    });
  }

  /**
   * Ensure that destination dataset exist. Auto create dataset according to passed configuration
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with configuration or rejects with corresponding error message
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

  /**
   * Ensure destination table exist. Auto create table according to passed configuration
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with configuration or rejects with corresponding error message
   */
  static ensureDestinationTableExist (configuration) {
    return new Promise((resolve, reject) => {
      const table_instance = gc_big_query
        .dataset(configuration.data_set_name)
        .table(configuration.table_name);

      const options = {
        autoCreate: true,
        schema: configuration.table_schema,
      };

      if (configuration.table_time_partitioning) {
        options.timePartitioning = { type: configuration.table_time_partitioning };
      }

      table_instance.get(options, (error, table) => {
        if (error) {
          return reject(error);
        }

        logger.debug(`[ X ] Ensure destination Table "${configuration.table_name}" exist. Metadata: ${util.inspect(table.metadata, null, 10)}`);

        return resolve(configuration);
      });
    });
  }

  /**
   * Build date partitioning decorator if table time partitioning enabled, otherwise skip and continue
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with configuration populated with/without table_partition_decorator property or rejects with corresponding error message
   */
  static buildDatePartitionDecorator (configuration) {
    return new Promise((resolve, reject) => {
      if (!configuration.partition_date) {
        return resolve(configuration);
      }

      try {
        const datetime = new Date(configuration.partition_date);
        const year = datetime.getUTCFullYear().toString();
        let month = (datetime.getUTCMonth() + 1).toString();
        let date = datetime.getUTCDate().toString();

        // format
        month = month.length === 1 ? `0${month}` : month;
        date = date.length === 1 ? `0${date}` : date;

        return resolve(Object.assign(configuration, { table_partition_decorator: `$${year}${month}${date}` }));
      } catch (exception) {
        return reject(exception);
      }
    });
  }

  /**
   * Apply SQL Query prepared state parameters if applicable
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with configuration populated with/without sql_query_parameters_formatted property or rejects with corresponding error message
   */
  static formatSQLQueryParameters (configuration) {
    return new Promise((resolve, reject) => {
      if (!configuration.use_sql_query_parameters) {
        return resolve(configuration);
      }

      try {
        const sql_query_parameters_formatted = configuration.sql_query_parameters.map(Aggregator._buildSQLParameter);

        return resolve(Object.assign(configuration, { sql_query_parameters_formatted }));
      } catch (exception) {
        return reject(exception);
      }
    });
  }

  /**
   * Build BigQuery acceptable SQL Parameter structure
   * @param {string} name Parameter name
   * @param {string} type Parameter type
   * @param {*} value Parameter value
   * @returns {object} structured SQL Parameter acceptable by BigQuery
   * @private
   */
  static _buildSQLParameter ({ name, type, value }) {
    return {
      name,
      parameterType: {
        type: type || DEFAULT_SQL_QUERY_PARAMETER_TYPE
      },
      parameterValue: { value }
    };
  }

  /**
   * Execute aggregation job and wait for execution result
   * @param {object} configuration Setting and data accumulator
   * @returns {Promise.<object>} resolves with configuration populated with metadata property (result of job execution) or rejects with corresponding error message
   */
  static executeAggregationJob (configuration) {
    return new Promise((resolve, reject) => {
      const table_name = configuration.table_time_partitioning ? `${configuration.table_name}${configuration.table_partition_decorator}` : configuration.table_name;
      const destination_table = gc_big_query
        .dataset(configuration.data_set_name)
        .table(table_name);

      let use_legacy_sql = configuration.use_legacy_sql;

      use_legacy_sql = typeof use_legacy_sql === 'undefined' || use_legacy_sql === null ? true : use_legacy_sql;

      const options = {
        destination: destination_table,
        query: configuration.sql_query,
        useLegacySql: use_legacy_sql
      };

      if (configuration.use_sql_query_parameters) {
        options.queryParameters = configuration.sql_query_parameters_formatted;
      }

      if (configuration.write_disposition) {
        options.writeDisposition = configuration.write_disposition
      }

      gc_big_query.startQuery(options, (error, job) => {
        if (error) {
          return reject(error);
        }

        logger.debug(`[ AGGREGATION ] Job (job.id is ${job.id}) is running.`);

        job.on('error', (err) => {
          logger.error(`[ AGGREGATION ] Job ${job.id} failed. Err is ${err}`);
          job.removeAllListeners();

          return reject(err);
        });

        job.on('complete', (metadata) => {
          logger.debug(`[ AGGREGATION ] Job ${job.id} is complete. Metadata is ${util.inspect(metadata, null, 6)}`);
          job.removeAllListeners();

          if (metadata.status && metadata.status.errorResult) {
            // return reject(metadata.status.errors);
            return reject(metadata.status.getErrorResult);
          }

          return resolve(Object.assign(configuration, { metadata }));
        });
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
