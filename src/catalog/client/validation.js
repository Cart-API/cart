'use strict';

// load deps
const Joi = require('joi');

const ClientValidator = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = ClientValidator;

const schema = {
  name: Joi
    .string()
    .min(1)
    .max(250)
    .trim(),
  lastName: Joi
    .string()
    .default(''),
  email: Joi
    .string()
    .max(120)
    .email()
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
      name: schema
        .name
        .required(),
      lastName: schema
        .lastName
        .required(),
      email: schema
        .email
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
      name: schema
        .name
        .optional(),
      lastName: schema
        .lastName
        .optional(),
      email: schema
        .email
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
