/* global describe, beforeEach, before, it, expect, db, server, after */
'use strict';

const Promise = require('bluebird');

describe('Routes /product', () => {
  let userInfo;
  let category;

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
            url: '/category',
            headers: {'Authorization': 'Bearer ' + userInfo},
            payload: {
              description: 'category'
            }
          };
          server.inject(optionsCategory, (response) => {
            category = response.result;
            return done();
          });
        });
      });
  });

  after((done) => {
    const options = {
      method: 'DELETE',
      url: '/category/' + category.id,
      headers: {'Authorization': 'Bearer ' + userInfo}
    };
    server.inject(options, (response) => {
      done();
    });
  });

  describe('GET /product', () => {
    beforeEach((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        let reqs = [];
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            reference: '00' + i,
            description: 'description',
            unitPrice: i + 1,
            category: category.id
          };
          reqs.push(server.inject(options));
        }

        Promise.all(reqs)
        .then(() => {
          done();
        });
      });
    });

    it('return 5 products at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');

        expect(response.result.data).to.contain.a.thing.with.property('reference');
        expect(response.result.data).to.contain.a.thing.with.property('description');
        expect(response.result.data).to.contain.a.thing.with.property('unitPrice');
        expect(response.result.data).to.contain.a.thing.with.property('category');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });

  describe('GET /product/{id}', () => {
    let product;
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            reference: '001',
            description: 'description',
            unitPrice: 2,
            category: category.id
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/product/' + product.id};
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
          url: '/product/' + product.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 product at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/product/' + product.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result).to.have.property('id', product.id);
          expect(response.result).to.have.property('reference', product.reference);
          expect(response.result).to.have.property('description', product.description);
          expect(response.result).to.have.property('unitPrice', product.unitPrice);
          expect(response.result.Category).to.have.property('id', product.category);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/product/aa',
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
          url: '/product/1000',
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

  describe('POST /product', () => {
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/product'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no body is sended', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
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

    it('returns 400 HTTP status code  when no `reference` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          description: 'description',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "reference" fails because ["reference" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `description` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "description" fails because ["description" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `unitPrice` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'description',
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "unitPrice" fails because ["unitPrice" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when no `category` is send', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'description',
          unitPrice: 2
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "category" fails because ["category" is required]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `reference` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '',
          description: 'description',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "reference" fails because ["reference" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `description` is empty', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: '',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "description" fails because ["description" is not allowed to be empty]');
        done();
      });
    });

    it('return 400 HTTP status code when `unitPrice` isn\'t a positive number ', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'description',
          unitPrice: 0,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "unitPrice" fails because ["unitPrice" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `reference` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: 0,
          description: 'description',
          unitPrice: 1,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "reference" fails because ["reference" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `description` isn\'t a string', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 0,
          unitPrice: 1,
          category: category.id
        }
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

    it('returns 400 HTTP status code  when `category` isn\'t a number', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'reference',
          unitPrice: 1,
          category: 'category'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "category" fails because ["category" must be a number]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'POST',
        url: '/product',
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'description',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 201);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('reference', '001');
        expect(response.result).to.have.property('description', 'description');
        expect(response.result).to.have.property('unitPrice', '2.00');
        expect(response.result).to.have.property('category', category.id);
        done();
      });
    });
  });

  describe('PUT /product/{id}', () => {
    let product;
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            reference: '001',
            description: 'description',
            unitPrice: 2,
            category: category.id
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `reference` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '',
          description: 'description',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "reference" fails because ["reference" is not allowed to be empty]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `description` is empty', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: '',
          unitPrice: 2,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "description" fails because ["description" is not allowed to be empty]');
        done();
      });
    });

    it('return 400 HTTP status code when `unitPrice` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'description',
          unitPrice: 0,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "unitPrice" fails because ["unitPrice" must be a positive number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `reference` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: 0,
          description: 'description',
          unitPrice: 1,
          category: category.id
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "reference" fails because ["reference" must be a string]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `description` isn\'t a string', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 0,
          unitPrice: 1,
          category: category.id
        }
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

    it('returns 400 HTTP status code  when `category` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          reference: '001',
          description: 'reference',
          unitPrice: 1,
          category: 'category'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "category" fails because ["category" must be a number]');
        done();
      });
    });

    it('returns 200 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/product/' + product.id,
        payload: {
          reference: '001',
          description: 'description',
          unitPrice: 2,
          category: category.id
        },
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('id', product.id);
        expect(response.result).to.have.property('reference', '001');
        expect(response.result).to.have.property('description', 'description');
        expect(response.result).to.have.property('unitPrice', 2);
        expect(response.result).to.have.property('category', category.id);
        done();
      });
    });
  });

  describe('DELETE /product/{id}', () => {
    let product;
    before((done) => {
      return db.Product.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/product',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            reference: '001',
            description: 'description',
            unitPrice: 2,
            category: category.id
          }
        };

        server.inject(options, (response) => {
          product = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/product',
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
        url: '/product/' + product.id,
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

