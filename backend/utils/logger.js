const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const config = require('../config');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Determine environment-specific index prefix
let indexPrefix = "adopte-etudiant-api-";
if (process.env.NODE_ENV === "development") {
  indexPrefix = indexPrefix.concat("dev");
} else if (process.env.NODE_ENV === "test") {
  indexPrefix = indexPrefix.concat("test");
} else if (process.env.NODE_ENV === "production") {
  indexPrefix = indexPrefix.concat("prod");
} else {
  indexPrefix = indexPrefix.concat("local");
}

// Base transports (existing functionality)
const baseTransports = [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Add Elasticsearch transport if credentials are configured
if (config.elasticPassword) {
  const elasticsearchTransport = new ElasticsearchTransport({
    level: 'debug',
    indexPrefix,
    indexSuffixPattern: 'YYYY-MM-DD',
    transformer: (logData) => {
      return {
        '@timestamp': new Date(),
        severity: logData.level,
        stack: logData.meta && logData.meta.stack,
        service_name: 'adopte-etudiant-api',
        service_version: '1.0.0',
        message: `${logData.message}`,
        data: logData.meta ? JSON.stringify(logData.meta) : null,
        utcTimestamp: logData.timestamp
      };
    },
    clientOpts: {
      node: 'http://localhost:9200',
      maxRetries: 5,
      requestTimeout: 10000,
      sniffOnStart: false,
      auth: {
        username: config.elasticUser,
        password: config.elasticPassword,
      },
    },
  });

  baseTransports.push(elasticsearchTransport);
}

const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: 'adopte-etudiant-api' },
  transports: baseTransports,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

module.exports = logger;
