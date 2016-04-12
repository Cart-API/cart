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
    .integer()
    .positive(),
  product: Joi
    .number()
    .integer()
    .positive(),
  unitPrice: Joi
    .number()
    .precision(2)
    .positive(),
  quantity: Joi
    .number()
    .integer()
    .positive()
};

function list () {
  return {
    params: {
      order: Joi
        .number()
        .integer()
        .positive()
        .required()
    },
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
      unitPrice: schema
        .unitPrice
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
      unitPrice: schema
        .unitPrice
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

