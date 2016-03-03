'use strict';

const Path = require('path');
const glob = require('glob');
const Sequelize = require('sequelize');

const cwd = process.cwd();

exports.register = (server, options, next) => {
  const config = {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cart',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres'
  };

  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  let db = getModels(sequelize);
  db['sequelize'] = sequelize;

  doAssociations(db);

  server.decorate('server', 'database', db);

  return next();
};

exports.register.attributes = {
  name: 'database',
  version: '1.0.0'
};

function getModels (sequelize) {
  let files = glob.sync('./src/**/model.js', { nodir: true });

  return files.reduce((db, model) => {
    let modelPath = Path.isAbsolute(model) ? model : Path.join(cwd, model);

    let m = sequelize.import(modelPath);

    db[m.name] = m;
    return db;
  }, {});
}

function doAssociations (db) {
  Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  return;
}
