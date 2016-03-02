/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

const Promise = require('bluebird');

describe('Routes /category', () => {
  let userInfo;

  before((done) => {
    return db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Marcos',
            lastName: 'Bérgamo',
            username: 'thebergamo',
            email: 'marcos@marcos.com',
            password: 'Aw3s0m#01'
          }
        };

        server.inject(options, (response) => {
          userInfo = response.result.token;
          return done();
        });
      });
  });

  describe('GET /category', () => {
    beforeEach((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        let reqs = [];
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            description: 'Some awesome category here!'
          };

          reqs.push(server.inject(options));
        }
        Promise.all(reqs)
        .then(() => {
          done();
        });
      });
    });

    it('return 5 categories at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/category',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');

        expect(response.result.data).to.contain.a.thing.with.property('description');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });

  describe('GET /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            description: 'Awesome smartphones are here!!'
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/category/' + category.id};
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
          url: '/category/' + category.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 category at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/category/' + category.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', category.id);
          expect(response.result).to.have.property('description', category.description);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/category/aa',
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
          url: '/category/1000',
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

  describe('POST /category', () => {
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/category'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/category',
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

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/category',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          description: 'Awesome smartphones are here!!'
        }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('description', 'Awesome smartphones are here!!');
        done();
      });
    });
  });

  describe('PUT /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            description: 'Awesome smartphones are here!!'
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `description` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/category/' + category.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {name: 'Smartphone', description: 0}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "description" fails because ["description" must be a string]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/category/' + category.id,
        payload: {
          description: 'Awesomeness smartphones are here!!'
        },
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', category.id);
        expect(response.result).to.have.property('description', 'Awesomeness smartphones are here!!');
        done();
      });
    });
  });

  describe('DELETE /category/{id}', () => {
    let category;
    before((done) => {
      return db.Category.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/category',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            description: 'Awesome smartphones are here!!'
          }
        };

        server.inject(options, (response) => {
          category = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/category',
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
        url: '/category/' + category.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        console.log(response.result);
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        done();
      });
    });
  });
});

