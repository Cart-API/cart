/* global describe, beforeEach, before, it, expect, db, server, after */
'use strict';

const Promise = require('bluebird');

describe('Routes /order', () => {
  let userInfo;
  let client;

  before((done) => {
    return db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'firstName',
            lastName: 'lastName',
            username: 'username',
            email: 'email@email.com',
            password: 'Aw3s0m#01'
          }
        };

        server.inject(options, (response) => {
          userInfo = response.result.token;

          const optionsCategory = {
            method: 'POST',
            url: '/client',
            headers: {'Authorization': 'Bearer ' + userInfo},
            payload: {
              name: 'name',
              lastName: 'lastName',
              email: 'email@email.com'
            }
          };
          server.inject(optionsCategory, (response) => {
            client = response.result;
            return done();
          });
        });
      });
  });

  after((done) => {
    db.Order.destroy({where: {}})
    .then(() => {
      const options = {
        method: 'DELETE',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        done();
      });
    }).catch((err) => {
      console.log(err);
    });
  });

  describe('GET /order', () => {
    beforeEach((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        let reqs = [];
        const options = {
          method: 'POST',
          url: '/order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            code: '0000' + i,
            emission: new Date(),
            delivery: new Date(),
            client: client.id
          };
          reqs.push(server.inject(options));
        }

        Promise.all(reqs)
        .then(() => {
          done();
        });
      });
    });

    it('return 5 orders at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');

        expect(response.result.data).to.contain.a.thing.with.property('code');
        expect(response.result.data).to.contain.a.thing.with.property('emission');
        expect(response.result.data).to.contain.a.thing.with.property('delivery');
        expect(response.result.data).to.contain.a.thing.with.property('client');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });

  describe('GET /order/{id}', () => {
    let order;
    before((done) => {
      return db.Order.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            code: '00001',
            emission: new Date(2016, 1, 1),
            delivery: new Date(2016, 1, 10),
            client: client.id
          }
        };

        server.inject(options, (response) => {
          order = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/order/' + order.id};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    describe('when request is authenticated', () => {
      it('returns 200 HTTP status code', (done) => {
        const options = {
          method: 'GET',
          url: '/order/' + order.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 order at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/order/' + order.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', order.id);
          expect(response.result).to.have.property('code', order.code);
          expect(response.result.emission).to.equalDate(order.emission);
          expect(response.result.delivery).to.equalDate(order.delivery);
          expect(response.result.Client).to.have.property('id', order.client);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/order/aa',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "id" fails because ["id" must be a number]');
          done();
        });
      });

      it('return 404 HTTP status code when the specified id is not found', (done) => {
        const options = {
          method: 'GET',
          url: '/order/1000',
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 404);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 404);
          expect(response.result).to.have.property('error', 'Not Found');

          done();
        });
      });
    });
  });

  describe('POST /order', () => {
    before((done) => {
      return db.Order.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/order'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `code` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          emission: new Date(2016, 1, 1),
          delivery: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `emission` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          delivery: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "emission" fails because ["emission" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `delivery` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "delivery" fails because ["delivery" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `client` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10)
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "client" fails because ["client" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `code` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `code` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: 0,
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `code` haven\'t more than 5 chars', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '0123456',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" length must be less than or equal to 5 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `client` isn\'t a number', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: 'AAA'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "client" fails because ["client" must be a number]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          emission: new Date(2016, 1, 1),
          delivery: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('code', '00001');
        expect(response.result).to.have.property('client', client.id);
        expect(response.result.emission).to.equalDate(new Date(2016, 1, 1));
        expect(response.result.delivery).to.equalDate(new Date(2016, 1, 10));
        done();
      });
    });
  });

  describe('PUT /order/{id}', () => {
    let order;
    before((done) => {
      return db.Order.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            code: '00001',
            emission: new Date(2016, 1, 1),
            delivery: new Date(2016, 1, 10),
            client: client.id
          }
        };

        server.inject(options, (response) => {
          order = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'PUT',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', '"value" must be an object');
        done();
      });
    });

    it('returns 400 HTTP status code  when `code` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `code` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: 0,
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `code` haven\'t more than 5 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '0123456',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: client.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "code" fails because ["code" length must be less than or equal to 5 characters long]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `client` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          code: '00001',
          delivery: new Date(2016, 1, 10),
          emission: new Date(2016, 1, 10),
          client: 'AAA'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "client" fails because ["client" must be a number]');
        done();
      });
    });
  });

  describe('DELETE /order/{id}', () => {
    let order;
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            code: '00001',
            emission: new Date(),
            delivery: new Date(),
            client: client.id
          }
        };

        server.inject(options, (response) => {
          order = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/order',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "id" fails because ["id" is required]');
        done();
      });
    });

    it('returns 200 HTTP status code when record is deleted', (done) => {
      const options = {
        method: 'DELETE',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        done();
      });
    });
  });
});

