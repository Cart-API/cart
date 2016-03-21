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
      path: '/client',
      config: {
        description: 'GET clients',
        notes: 'Returns a clients',
        tags: ['api'],
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/client/{id}',
      config: {
        description: 'GET client',
        notes: 'Returns a client item by the id passed in the path',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/client',
      config: {
        description: 'POST client',
        notes: 'Save a client',
        tags: ['api'],
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/client/{id}',
      config: {
        description: 'PUT client',
        notes: 'Update a client item by the id passed in the path',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/client/{id?}',
      config: {
        description: 'DELETE client',
        notes: 'DELETE a client item by the id passed in the path',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'client',
  version: '1.0.0'
};

