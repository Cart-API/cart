'use strict';

function OrderController (db) {
  this.database = db;
  this.model = db.Order;
}

OrderController.prototype = {
  list,
  read,
  create,
  update,
  destroy,
  search
};

module.exports = OrderController;

// [GET] /order
function list (request, reply) {
  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findAndCountAll({
    attributes: ['id', 'code', 'emission', 'delivery', 'price', 'discount'],
    include: [{
      model: this.database.Client,
      attributes: ['id', 'name'],
      where: {
        $and: this.search(request.search())
      }
    }],
    order: 'code'
  })
  .then((result) => {
    reply({
      data: result.rows,
      count: result.count
    });
  }).catch((err) => reply.badImplementation(err.message));
}

// [GET] /order/{id}
function read (request, reply) {
  const id = request.params.id;

  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findOne({
    attributes: ['id', 'code', 'emission', 'delivery', 'price', 'discount'],
    include: [{
      model: this.database.Client,
      attributes: ['id', 'name']
    }],
    where: {id: id}
  })
  .then((order) => {
    if (!order) {
      return reply.notFound();
    }
    reply(order);
  }).catch((err) => reply.badImplementation(err.message));
}

// [POST] /order
function create (request, reply) {
  let payload = request.payload;
  payload.user = request.auth.credentials.id;

  this.model.create(payload)
  .then((order) => reply(order).code(201))
  .catch((err) => reply.badImplementation(err.message));
}

// [PUT] /order
function update (request, reply) {
  const id = request.params.id;
  const payload = request.payload;

  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findOne({
    where: {id: id}
  })
  .then((order) => {
    if (!order) {
      return reply.notFound();
    }
    return order.update(payload, {where: {id: id}});
  })
  .then(order => reply(order))
  .catch((err) => reply.badImplementation(err.message));
}

// [DELETE] /order
function destroy (request, reply) {
  const id = request.params.id;

  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findOne({
    where: {id: id}
  })
  .then((order) => {
    if (!order) {
      return reply.notFound();
    }
    return order.destroy().then(() => reply());
  }).catch((err) => reply.badImplementation(err.message));
}

function search (search) {
  if (search) {
    const conditions = {
      name: {
        $ilike: '%' + search + '%'
      }
    };
    return conditions;
  }
  return null;
}
