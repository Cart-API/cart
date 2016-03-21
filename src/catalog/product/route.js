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
      path: '/product',
      config: {
        description: 'GET products',
        notes: 'Returns a products',
        tags: ['api'],
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/product/{id}',
      config: {
        description: 'GET product',
        notes: 'Returns a product item by the id passed in the path',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/product',
      config: {
        description: 'POST product',
        notes: 'Save a product',
        tags: ['api'],
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/product/{id}',
      config: {
        description: 'PUT product',
        notes: 'Returns a product item by the id passed in the path',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/product/{id?}',
      config: {
        description: 'DELETE product',
        notes: 'Returns a product item by the id passed in the path',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'product',
  version: '1.0.0'
};

