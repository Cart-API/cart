'use strict';

require('dotenv').config({ path: __dirname + '/.env', silent: true });

// load deps
const lab = exports.lab = require('lab').script();
const chai = require('chai');
chai.use(require('chai-datetime'));

// chai plugins
chai.use(require('chai-things'));

global.expect = chai.expect;

// prepare environment
global. it = lab.it;
global.describe = lab.describe;
global.before = lab.before;
global.beforeEach = lab.beforeEach;
global.after = lab.after;

// get the server
global.describe('load the bootstrap', () => {
  global.before((done) => {
    require('../src/core/bootstrap').start()
    .then((server) => {
      global.server = server;
      global.db = global.server.database;
      return done();
    });
  });
});
