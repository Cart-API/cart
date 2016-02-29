'use strict';

function Pagination () {
  this.LIMIT = 10;
}

Pagination.prototype = {
  getOffset,
  getLimit
};

module.exports = Pagination;

function getOffset (request) {
  let page = request.query.page;
  if (page) {
    return this.LIMIT * (page - 1);
  }
  return 0;
}

function getLimit () {
  return this.LIMIT;
}
