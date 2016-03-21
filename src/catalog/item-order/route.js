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
      path: '/item-order/{order}',
      config: {
        description: 'GET item',
        notes: 'Returns itens by the id passed in the path for order',
        tags: ['api'],
        handler: controller.list,
        validate: Validator.list()
      }
    },
    {
      method: 'GET',
      path: '/item-order/{order}/{id}',
      config: {
        description: 'GET item',
        notes: 'Return the item based on the id and order',
        tags: ['api'],
        handler: controller.read,
        validate: Validator.read()
      }
    },
    {
      method: 'POST',
      path: '/item-order',
      config: {
        description: 'POST item',
        notes: 'Save item',
        tags: ['api'],
        handler: controller.create,
        validate: Validator.create()
      }
    },
    {
      method: 'PUT',
      path: '/item-order/{order}/{id}',
      config: {
        description: 'PUT item',
        notes: 'Update the item based on the id and order',
        tags: ['api'],
        handler: controller.update,
        validate: Validator.update()
      }
    },
    {
      method: 'DELETE',
      path: '/item-order/{order}/{id?}',
      config: {
        description: 'DELETE item',
        notes: 'Delete the item based on the id and order',
        tags: ['api'],
        handler: controller.destroy,
        validate: Validator.destroy()
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'item-order',
  version: '1.0.0'
};

