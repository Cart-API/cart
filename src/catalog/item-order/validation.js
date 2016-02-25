'use strict';

// load deps
const Joi = require('joi');

const ItemOrderValidator = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = ItemOrderValidator;

const schema = {
  order: Joi
    .number()
    .integer(),
  product: Joi
    .number()
    .integer(),
  price: Joi
    .number()
    .precision(2)
    .positive(),
  quantity: Joi
    .number()
    .integer()
};

function list () {
  return {
    params: {
      order: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

function read () {
  return {
    params: {
      order: Joi
        .number()
        .integer()
        .positive()
        .required(),
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
      order: schema
        .order
        .required(),
      product: schema
        .product
        .required(),
      price: schema
        .price
        .required(),
      quantity: schema
        .quantity
        .required()
    }
  };
}

function update () {
  return {
    params: {
      order: Joi
        .number()
        .integer()
        .positive()
        .required(),
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    },
    payload: {
      order: schema
        .order
        .optional(),
      product: schema
        .product
        .optional(),
      price: schema
        .price
        .optional(),
      quantity: schema
        .quantity
        .optional()
    }
  };
}

function destroy () {
  return {
    params: {
      order: Joi
        .number()
        .integer()
        .positive()
        .required(),
      id: Joi
        .number()
        .integer()
        .positive()
        .required()
    }
  };
}

