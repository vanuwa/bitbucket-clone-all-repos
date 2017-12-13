#!/usr/bin/env bash
today=`date '+%Y-%m-%d_%H%M%S'`
SOURCE_DIR=/var/www/nodejs-core-service
LOG_DIR=${SOURCE_DIR}/logs
LOG_FILE="execute_processing_$today.log"
NPM_PACKAGE_FILE_PATH="${SOURCE_DIR}/package.json"
NODE_ENGINE_VERSION=$(cat ${NPM_PACKAGE_FILE_PATH} | grep -P '(?<=\"node\": \").+(?=(\"))' -o | head -1)

cd ${SOURCE_DIR}
mkdir -p ${LOG_DIR}
export NODE_ENV=production
/home/ivan/.nvm/versions/node/v${NODE_ENGINE_VERSION}/bin/node ./app.js >> ${LOG_DIR}/${LOG_FILE} 2>&1
echo 'Done.'
