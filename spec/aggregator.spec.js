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
        .catch((error) => done(error));
    });

    it('resolves with default configuration if calls without arguments', (done) => {
      Aggregator
        .configure()
        .then((result) => {
          expect(result).to.deep.equal(Aggregator._default_configuration);
          done();
        })
        .catch((error) => done(error));
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
        .catch((error) => done(error));
    });
  });
});

