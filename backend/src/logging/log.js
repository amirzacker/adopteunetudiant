const { logTransport } = require("./elastic");

const ENV = process.env;
let indexPrefix = "adopte-etudiant-api-";

if (ENV.NODE_ENV === "development") {
  indexPrefix = indexPrefix.concat("dev");
} else if (ENV.NODE_ENV === "test") {
  indexPrefix = indexPrefix.concat("test");
} else if (ENV.NODE_ENV === "production") {
  indexPrefix = indexPrefix.concat("prod");
} else {
  indexPrefix = indexPrefix.concat("local");
}

class Logger {
    
  info(msg, data) {
    const logger = logTransport(indexPrefix);
    const metaData = { data };
    logger.info(msg, metaData);
  }
  
  warning(msg, data) {
    const logger = logTransport(indexPrefix);
    const metaData = { data };
    logger.warn(msg, metaData);
  }
  
  http(msg, data) {
    const logger = logTransport(indexPrefix);
    const metaData = { data };
    logger.http(msg, metaData);
  }
  
  child(data) {
    const logger = logTransport(indexPrefix);
    const child = logger.child(data);
    child.http();
  }
  
  error(msg, data) {
    const logger = logTransport(indexPrefix);
    const metaData = { data };
    logger.error(msg, metaData);
  }
   
  debug(msg, data) {
    const logger = logTransport(indexPrefix);
    const metaData = { data };
    logger.debug(msg, metaData);
  }
}

module.exports = new Logger();
