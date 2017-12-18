/**
 * Created by ivan on 4/27/17.
 */
const log4js = require('log4js');
const settings = require('config');

const service_name = settings.get('app.name');
const log_level = settings.get('app.log_level');
const log_pattern = settings.get('app.log_pattern');

const default_pattern = `%[ [%d{ISO8601}] [%p] [%h] [${service_name}] [%c] %] - %m%n`;

const pattern = log_pattern ? log_pattern.replace('${service_name}', service_name) : default_pattern;
// const pattern = '%[ %c %] - %m%n';

/* log4js.configure({
  appenders: [{
    type: 'console',
    layout: {
      type: 'pattern',
      pattern
    }
  }],
  replaceConsole: false
});*/

log4js.configure({
  appenders: {
    out: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern
      }
    }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'all'
    }
  }
});

// const logger = log4js.getLogger();

// logger.setLevel(log_level);       // possible values: ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF

function extractModuleName (path) {
  const regexp = /[\w-_]+\.js$/ig;

  if (!path || typeof path !== 'string') {
    return null;
  }

  return path.match(regexp)[0] || null;
}

module.exports = function getLogger (module) {
  let logger;

  if (!module || !module.filename) {
    logger = log4js.getLogger();

    if (typeof logger.setLevel === 'function') {
      logger.setLevel(log_level);
    }

    logger.level = log_level;

    return logger;
  }

  const category = extractModuleName(module.filename);

  logger = log4js.getLogger(category);
  logger.level = log_level;

  return logger;
};
