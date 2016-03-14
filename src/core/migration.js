'use strict';

const envPath = process.env.NODE_ENV === 'test' ? __dirname + '/../../test/.env' : __dirname + '/../../.env';

require('dotenv').config({ path: envPath });

const Umzug = require('umzug');
const K7Sequelize = require('k7-sequelize');
const k7 = new K7Sequelize();
const Sequelize = k7.db.Sequelize;

const config = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cart',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: process.env.DB_DIALECT || 'postgres'
};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

let db = {sequelize, Sequelize};
// Instantiate Umzug
let options = {
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
    modelName: 'MigrationSchema',
    tableName: 'migration_table'
  },
  logging: false,   // TODO: Create new logger to migration function receive a message parameter.
  upName: 'up',
  downName: 'down',
  migrations: {
    params: [db],
    path: 'migrations',
    pattern: /(migrations.js)$/
  }
};

const umzug = new Umzug(options);

const type = process.argv[2];
run(type);

function run (type) {
  type = type === 'down' ? 'down' : 'up';

  return umzug[type]()
    .then((migrations) => {
      migrations.map((migration) => {
        console.log('Executed ' + type.toUpperCase() + ': ', migration.file);
      });
    })
    .then(() => {
      console.log('Migration Success');
      process.exit();
    })
    .catch((err) => {
      console.log('Error executing migrations: ', err);
      process.exit(1);
    });
}
