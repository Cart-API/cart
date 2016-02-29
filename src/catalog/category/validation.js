'use strict';

// load deps
const Joi = require('joi');

const CategoryValidator = {
  list,
  read,
  create,
  update,
  destroy
};

module.exports = CategoryValidator;

const schema = {
  description: Joi
    .string()
    .default('')
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
      description: schema
        .description
        .optional()
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
      description: schema
        .description
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

