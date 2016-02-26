/* global describe, beforeEach, before, it, expect, db, server */
'use strict';

let jwt = require('jsonwebtoken');
const SECRET = process.env.JWT || 'stubJWT';

describe('Routes /user', () => {
  describe('GET /user', () => {
    beforeEach((done) => {
      return db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            firstName: 'User ' + i,
            lastName: 'Doe',
            password: 'JK1234$eco',
            username: 'user_' + i,
            email: 'user_' + i + '@example.com'
          };

          server.inject(options, (response) => {
            if (i === 4) {
              return done();
            }
          });
        }
      });
    });

    it('return 200 HTTP status code', (done) => {
      db.User.destroy({where: {}})
      .then(() => {
        const options = {method: 'GET', url: '/user'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });
    });

    it('return an empty array when users is empty', (done) => {
      db.User.destroy({where: {}})
      .then(() => {
        let options = {method: 'GET', url: '/user'};
        server.inject(options, (response) => {
          expect(response).to.have.property('result');
          expect(response.result).to.have.length.least(0);
          done();
        });
      });
    });

    it('return 5 users at a time', (done) => {
      const options = {method: 'GET', url: '/user'};
      server.inject(options, (response) => {
        expect(response).to.have.property('result');
        expect(response.result).to.have.length.least(5);
        expect(response.result).to.contain.a.thing.with.property('firstName');
        expect(response.result).to.contain.a.thing.with.property('lastName');
        expect(response.result).to.contain.a.thing.with.property('username');
        expect(response.result).to.contain.a.thing.with.property('email');
        done();
      });
    });
  });

  describe('GET /user/{id}', () => {
    let token;
    let userInfo;
    before((done) => {
      return db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    describe('when user is authenticated', () => {
      it('returns 200 HTTP status code', (done) => {
        const options = {
          method: 'GET',
          url: '/user/' + userInfo.id,
          headers: {'Authorization': 'Bearer ' + token}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 user at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/user/' + userInfo.id,
          headers: {'Authorization': 'Bearer ' + token}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('firstName', 'Jack');
          expect(response.result).to.have.property('lastName', 'Bauer');
          expect(response.result).to.have.property('username', 'jack_b');
          expect(response.result).to.have.property('email', 'jbauer@24hours.com');
          done();
        });
      });
    });
  });

  describe('POST /user', () => {
    beforeEach((done) => {
      return db.User.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {method: 'POST', url: '/user'};
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
      const options = {method: 'POST', url: '/user', payload: {firstName: 'Jack', lastName: 'Bauer', username: 'jack_b', email: 'jack_b@24h.com', password: '12#345Mp6'}};
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('token');
        done();
      });
    });
  });

  describe('PUT /user/{id}', () => {
    let userInfo;
    let token;
    before((done) => {
      db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/user/' + userInfo.id,
        payload: {firstName: 'Jack', lastName: 'Brauer', username: 'jack_br', email: 'jack_br@24h.com', password: 'JB#ddd0123'},
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', userInfo.id);
        expect(response.result).to.have.property('firstName', 'Jack');
        expect(response.result).to.have.property('lastName', 'Brauer');
        expect(response.result).to.have.property('username', 'jack_br');
        expect(response.result).to.have.property('email', 'jack_br@24h.com');
        done();
      });
    });
  });

  describe('POST /user/login', () => {
    before((done) => {
      db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          done();
        });
      });
    });

    it('returns 200 HTTP status code when success login', (done) => {
      const options = {
        method: 'POST',
        url: '/user/login',
        payload: {email: 'jbauer@24hours.com', password: '#24hoursRescuePresident'}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('token');
        done();
      });
    });
  });

  describe('DELETE /user/{id}', () => {
    let userInfo;
    let token;
    before((done) => {
      db.User.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/user',
          payload: {
            firstName: 'Jack',
            lastName: 'Bauer',
            username: 'jack_b',
            email: 'jbauer@24hours.com',
            password: '#24hoursRescuePresident'
          }
        };

        server.inject(options, (response) => {
          token = response.result.token;
          userInfo = jwt.verify(token, SECRET);
          done();
        });
      });
    });

    it('returns 200 HTTP status code when record is deleted', (done) => {
      const options = {
        method: 'DELETE',
        url: '/user/' + userInfo.id,
        headers: {'Authorization': 'Bearer ' + token}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.be.empty;
        done();
      });
    });
  });
});
