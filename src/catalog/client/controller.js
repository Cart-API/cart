'use strict';

function ClientController (db) {
  this.database = db;
  this.model = db.Client;
}

ClientController.prototype = {
  list,
  read,
  create,
  update,
  destroy,
  search
};

module.exports = ClientController;

// [GET] /client
function list (request, reply) {
  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findAndCountAll({
    attributes: ['id', 'name', 'lastName', 'email'],
    order: 'name',
    offset: request.offset(),
    limit: request.limit,
    where: {
      $and: this.search(request.search())
    }
  })
  .then((result) => {
    reply({
      data: result.rows,
      count: result.count
    });
  }).catch((err) => reply.badImplementation(err.message));
}

// [GET] /client/{id}
function read (request, reply) {
  const id = request.params.id;

  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findOne({
    attributes: ['id', 'name', 'lastName', 'email'],
    where: {id: id}
  })
  .then((client) => {
    if (!client) {
      return reply.notFound();
    }
    reply(client);
  }).catch((err) => reply.badImplementation(err.message));
}

// [POST] /client
function create (request, reply) {
  let payload = request.payload;
  payload.user = request.auth.credentials.id;

  this.model.create(payload)
  .then((client) => reply(client).code(201))
  .catch((err) => reply.badImplementation(err.message));
}

// [PUT] /client
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
  .then((client) => {
    if (!client) {
      return reply.notFound();
    }
    return client.update(payload, {where: {id: id}});
  })
  .then(client => reply(client))
  .catch((err) => reply.badImplementation(err.message));
}

// [DELETE] /client
function destroy (request, reply) {
  const id = request.params.id;

  this.model
  .scope({
    method: ['user', request.auth.credentials.id]
  })
  .findOne({
    where: {id: id}
  })
  .then((client) => {
    if (!client) {
      return reply.notFound();
    }
    return client.destroy().then(() => reply());
  }).catch((err) => reply.badImplementation(err.message));
}

function search (search) {
  if (search) {
    const conditions = [{
      name: {
        $ilike: '%' + search + '%'
      },
      lastName: {
        $ilike: '%' + search + '%'
      },
      email: {
        $ilike: '%' + search + '%'
      }
    }];
    return conditions;
  }
  return null;
}
