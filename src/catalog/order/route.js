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
      path: '/order',
      config: {
        description: 'GET order',
        notes: 'Returns a order',
        tags: ['api'],
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/order/{id}',
      config: {
        description: 'GET order',
        notes: 'Returns a order item by the id passed in the path',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/order',
      config: {
        description: 'GET order',
        notes: 'Save a order',
        tags: ['api'],
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/order/{id}',
      config: {
        description: 'PUT order',
        notes: 'Update a order item by the id passed in the path',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/order/{id?}',
      config: {
        description: 'DELETE order',
        notes: 'Delete a order item by the id passed in the path',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'order',
  version: '1.0.0'
};

