'use strict';

exports.register = (server, options, next) => {
  const limit = options.limit || 10;

  const search = function () {
    return this.query.search || null;
  };

  const offset = function () {
    let page = this.query.page || 1;
    if (page) {
      return limit * (page - 1);
    }
    return 0;
  };

  server.decorate('request', 'offset', offset);
  server.decorate('request', 'limit', limit);
  server.decorate('request', 'search', search);

  next();
};

exports.register.attributes = {
  name: 'hapi-paginate',
  version: '1.0.0'
};

