const expect = require('chai').expect;
const Aggregator = require('../src/aggregator');

describe('Aggregator', () => {
  describe('#configure', () => {
    it('resolves with default configuration if any custom arguments have been passed', (done) => {
      Aggregator
        .configure({})
        .then((result) => {
          expect(result).to.deep.equal(Aggregator._default_configuration);
          done();
        })
        .catch(done);
    });

    it('resolves with default configuration if calls without arguments', (done) => {
      Aggregator
        .configure()
        .then((result) => {
          expect(result).to.deep.equal(Aggregator._default_configuration);
          done();
        })
        .catch(done);
    });

    it('resolves with extended default configuration with passed arguments', (done) => {
      const custom_configuration = {
        gcp_project_id: 'fixture-project-id',
        sql_query: 'SELECT * FROM data LIMIT 100',
        table_name: 'result_data'
      };

      Aggregator
        .configure(custom_configuration)
        .then((result) => {
          expect(result).to.deep.equal(Object.assign({}, Aggregator._default_configuration, custom_configuration));
          done();
        })
        .catch(done);
    });
  });

  describe('#validateConfiguration', () => {
    let configuration;

    beforeEach(() => {
      configuration = {
        gcp_project_id: 'fixture-project-1234',
        sql_query: 'SELECT * FROM data WHERE id = 123456',
        use_sql_query_parameters: false,
        sql_query_parameters: null,
        use_legacy_sql: true,
        data_set_name: 'fixture_data_set_name',
        data_set_location: 'EU',
        table_name: 'fixture_table_name',
        table_schema: [{
          name: 'fixture_id',
          type: 'INTEGER',
          mode: 'NULLABLE'
        }, {
          name: 'name_id',
          type: 'STRING',
          mode: 'NULLABLE'
        }, {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE'
        }],
        table_time_partitioning: 'DAY',
        partition_date: new Date(),
        write_disposition: 'WRITE_EMPTY'
      };
    });

    it('resolves if configuration object is valid and contains all required properties', (done) => {
      Aggregator
        .validateConfiguration(configuration)
        .then(() => done())
        .catch(done);
    });

    const properties = ['gcp_project_id', 'sql_query', 'data_set_name', 'table_name'];

    describe('it fails if:', () => {
      properties.forEach((property) => {
        it(`property \`${property}\` is absent within configuration object`, (done) => {
          const data = Object.assign({}, configuration);

          Reflect.deleteProperty(data, property);

          Aggregator
            .validateConfiguration(data)
            .then(done)
            .catch(() => done());
        });
      });
    });
  });
});

