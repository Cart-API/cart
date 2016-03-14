'use strict';

// load deps
const Joi = require('joi');

const OrderValidator = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = OrderValidator;

const schema = {
  code: Joi
    .string()
    .max(5),
  emission: Joi
    .date(),
  delivery: Joi
    .date(),
  price: Joi
    .number()
    .precision(2)
    .positive(),
  discount: Joi
    .number()
    .precision(2)
    .positive(),
  client: Joi
    .number()
    .integer()
};

function list () {
  return {
    query: {
      page: Joi
        .number()
        .integer()
        .optional(),
      search: Joi
        .string()
        .optional()
    }
  };
}

function read () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

function create () {
  return {
    payload: {
      code: schema
        .code
        .required(),
      emission: schema
        .emission
        .required(),
      delivery: schema
        .delivery
        .required(),
      price: schema
        .price
        .required(),
      discount: schema
        .discount
        .required(),
      client: schema
        .client
        .required()
    }
  };
}

function update () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    },
    payload: {
      code: schema
        .code
        .optional(),
      emission: schema
        .emission
        .optional(),
      delivery: schema
        .delivery
        .optional(),
      price: schema
        .price
        .optional(),
      discount: schema
        .discount
        .optional(),
      client: schema
        .client
        .optional()
    }
  };
}

function destroy () {
  return {
    params: {
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

