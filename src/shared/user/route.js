'use strict';

const Controller = require('./controller');
const Validator = require('./validation');

exports.register = (server, options, next) => {
  // instantiate controller
  const controller = new Controller(server.database);

  server.bind(controller);
  server.route([
    {
      method: 'GET',
      path: '/user',
      config: {
        description: 'GET users',
        notes: 'Returns a users',
        tags: ['api'],
        auth: false,
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/user/{id}',
      config: {
        description: 'GET user',
        notes: 'Returns a user item by the id passed in the path',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/user',
      config: {
        description: 'POST user',
        notes: 'Save a user',
        tags: ['api'],
        auth: false,
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'POST',
      path: '/user/login',
      config: {
        description: 'POST user',
        notes: 'User login to the token generation',
        tags: ['api'],
        auth: false,
        handler: controller.logIn,
        validate: Validator.logIn()
      }
    },
    {
      method: 'PUT',
      path: '/user/{id}',
      config: {
        description: 'PUT user',
        notes: 'Update a User',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/user/{id}',
      config: {
        description: 'DELETE user',
        notes: 'Delete a User',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'user',
  version: '1.0.0'
};

