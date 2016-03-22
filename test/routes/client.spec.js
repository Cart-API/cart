/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

const Promise = require('bluebird');

describe('Routes /client', () => {
  let userInfo;

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
          return done();
        });
      });
  });

  describe('GET /client', () => {
    beforeEach((done) => {
      return db.Client.destroy({where: {}})
      .then(() => {
        let reqs = [];
        const options = {
          method: 'POST',
          url: '/client',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            name: 'name',
            lastName: 'lastName',
            email: 'email@email.com'
          };

          reqs.push(server.inject(options));
        }
        Promise.all(reqs)
        .then(() => {
          done();
        });
      });
    });

    it('return 5 clients at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        console.log(response.result);
        console.log(response);
        expect(response).to.have.property('result');

        expect(response.result.data).to.contain.a.thing.with.property('name');
        expect(response.result.data).to.contain.a.thing.with.property('lastName');
        expect(response.result.data).to.contain.a.thing.with.property('email');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });

  describe('GET /client/{id}', () => {
    let client;
    before((done) => {
      return db.Client.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/client',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'name',
            lastName: 'lastName',
            email: 'email@email.com'
          }
        };

        server.inject(options, (response) => {
          client = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/client/' + client.id};
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
          url: '/client/' + client.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 client at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/client/' + client.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', client.id);
          expect(response.result).to.have.property('name', client.name);
          expect(response.result).to.have.property('lastName', client.lastName);
          expect(response.result).to.have.property('email', client.email);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/client/aa',
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
          url: '/client/1000',
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

  describe('POST /client', () => {
    before((done) => {
      return db.Client.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/client'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
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

    it('returns 400 HTTP status code  when no `name` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          lastName: 'lastName',
          email: 'email@email.com'
        }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `lastName` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          email: 'email@email.com'
        }};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `email` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: '',
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: '',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: ''
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 0,
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 0,
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 0
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 250 chars', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 250 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `email` haven\'t more than 120 chars', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" length must be less than or equal to 120 characters long]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/client',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('name', 'name');
        expect(response.result).to.have.property('lastName', 'lastName');
        expect(response.result).to.have.property('email', 'email@email.com');
        done();
      });
    });
  });

  describe('PUT /client/{id}', () => {
    let client;
    before((done) => {
      return db.Client.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/client',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'name',
            lastName: 'lastName',
            email: 'email@email.com'
          }
        };

        server.inject(options, (response) => {
          client = response.result;
          done();
        });
      });
    });

    it('return 404 HTTP status code when the specified id is not found', (done) => {
      const options = {
        method: 'GET',
        url: '/client/1000',
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

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
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

    it('returns 400 HTTP status code  when `name` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: '',
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: '',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: ''
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `name` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 0,
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `lastName` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 0,
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "lastName" fails because ["lastName" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `email` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 0
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" must be a string]');
        done();
      });
    });

    it('return 400 HTTP status code when `name` haven\'t more than 250 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          lastName: 'lastName',
          email: 'email@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "name" fails because ["name" length must be less than or equal to 250 characters long]');
        done();
      });
    });

    it('return 400 HTTP status code when `email` haven\'t more than 120 chars', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@email.com'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "email" fails because ["email" length must be less than or equal to 120 characters long]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/client/' + client.id,
        payload: {
          name: 'name',
          lastName: 'lastName',
          email: 'email@email.com'
        },
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', client.id);
        expect(response.result).to.have.property('name', 'name');
        expect(response.result).to.have.property('lastName', 'lastName');
        expect(response.result).to.have.property('email', 'email@email.com');
        done();
      });
    });
  });

  describe('DELETE /client/{id}', () => {
    let client;
    before((done) => {
      return db.Client.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/client',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            name: 'name',
            lastName: 'lastName',
            email: 'email@email.com'
          }
        };

        server.inject(options, (response) => {
          client = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/client',
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
        url: '/client/' + client.id,
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

