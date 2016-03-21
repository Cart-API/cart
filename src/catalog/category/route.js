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
      path: '/category',
      config: {
        description: 'GET categories',
        notes: 'Returns a categories',
        tags: ['api'],
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/category/{id}',
      config: {
        description: 'GET category',
        notes: 'Returns a category item by the id passed in the path',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/category',
      config: {
        description: 'POST category',
        notes: 'Save a category',
        tags: ['api'],
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/category/{id?}',
      config: {
        description: 'PUT category',
        notes: 'Update a category item by the id passed in the path',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/category/{id?}',
      config: {
        description: 'DELETE category',
        notes: 'Delete a category item by the id passed in the path',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'category',
  version: '1.0.0'
};
