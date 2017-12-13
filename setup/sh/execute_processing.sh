#!/usr/bin/env bash
today=`date '+%Y-%m-%d_%H%M%S'`
SOURCE_DIR=/var/www/nodejs-core-service
LOG_DIR=${SOURCE_DIR}/logs
LOG_FILE="execute_processing_$today.log"

cd ${SOURCE_DIR}
mkdir -p ${LOG_DIR}
export NODE_ENV=production
/home/ivan/.nvm/versions/node/v8.9.1/bin/node ./app.js >> ${LOG_DIR}/${LOG_FILE} 2>&1
echo 'Done.'
