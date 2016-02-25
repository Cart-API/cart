'use strict';

function ItemOrderController (db) {
  this.database = db;
  this.model = db.ItemOrder;
}

ItemOrderController.prototype = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = ItemOrderController;

// [GET] /order/{order}
function list (request, reply) {
  const order = request.params.order;

  this.model
  .scope({
    method: ['order', order]
  })
  .findAndCountAll({
    attributes: ['id', 'price', 'quantity'],
    include: [{
      model: this.database.Order,
      attributes: ['id', 'code']
    },
    {
      model: this.database.Product,
      attributes: ['id', 'description']
    }]
  })
  .then((result) => {
    reply({
      data: result.rows,
      count: result.count
    });
  }).catch((err) => reply.badImplementation(err.message));
}

// [GET] /order/{order}/{id}
function read (request, reply) {
  const order = request.params.order;
  const id = request.params.id;

  this.model
  .scope({
    method: ['order', order]
  })
  .findOne({
    attributes: ['id', 'price', 'quantity'],
    include: [{
      model: this.database.Order,
      attributes: ['id', 'code']
    },
    {
      model: this.database.Product,
      attributes: ['id', 'description']
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
  const order = request.params.order;
  const payload = request.payload;

  this.model
  .scope({
    method: ['order', order]
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
  const order = request.params.order;

  this.model
  .scope({
    method: ['order', order]
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
