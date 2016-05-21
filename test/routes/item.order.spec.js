/* global describe, beforeEach, before, it, expect, db, server, after */
'use strict';

const Promise = require('bluebird');

describe('Routes /product', () => {
  let userInfo;
  let client;
  let order;
  let product;
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

            const optionsProduct = {
              method: 'POST',
              url: '/product',
              headers: {'Authorization': 'Bearer ' + userInfo},
              payload: {
                reference: '001',
                description: 'description 001',
                unitPrice: 1,
                category: category.id
              }
            };

            server.inject(optionsProduct, (response) => {
              product = response.result;

              const optionsClient = {
                method: 'POST',
                url: '/client',
                headers: {'Authorization': 'Bearer ' + userInfo},
                payload: {
                  name: 'name',
                  lastName: 'lastName',
                  email: 'email@email.com'
                }
              };
              server.inject(optionsClient, (response) => {
                client = response.result;

                const optionsOrder = {
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

                server.inject(optionsOrder, (response) => {
                  order = response.result;
                  return done();
                });
              });
            });
          });
        });
      });
  });

  after((done) => {
    db.ItemOrder.destroy({where: {}})
    .then(() => {
      const optionsOrder = {
        method: 'DELETE',
        url: '/order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(optionsOrder, (response) => {
        const optionsClient = {
          method: 'DELETE',
          url: '/client/' + client.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };
        server.inject(optionsClient, (response) => {
          const optionsProduct = {
            method: 'DELETE',
            url: '/product/' + product.id,
            headers: {'Authorization': 'Bearer ' + userInfo}
          };
          server.inject(optionsProduct, (response) => {
            const optionsCategory = {
              method: 'DELETE',
              url: '/category/' + category.id,
              headers: {'Authorization': 'Bearer ' + userInfo}
            };
            server.inject(optionsCategory, (response) => {
              done();
            });
          });
        });
      });
    });
  });

  describe('GET /item-order', () => {
    beforeEach((done) => {
      return db.ItemOrder.destroy({where: {}})
      .then(() => {
        let reqs = [];
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {}
        };

        for (let i = 0; i < 5; i++) {
          options.payload = {
            order: order.id,
            product: product.id,
            unitPrice: 1,
            quantity: 1
          };
          reqs.push(server.inject(options));
        }

        Promise.all(reqs)
        .then(() => {
          done();
        });
      });
    });

    it('return 5 item orders at a time', (done) => {
      const options = {
        method: 'GET',
        url: '/item-order/' + order.id,
        headers: {'Authorization': 'Bearer ' + userInfo}
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('result');

        expect(response.result.data).to.contain.a.thing.with.property('order');
        expect(response.result.data).to.contain.a.thing.with.property('product');
        expect(response.result.data).to.contain.a.thing.with.property('unitPrice');
        expect(response.result.data).to.contain.a.thing.with.property('quantity');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });

  describe('GET /item-order/{id}', () => {
    let itemOrder;
    before((done) => {
      return db.ItemOrder.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            order: order.id,
            product: product.id,
            unitPrice: 1,
            quantity: 1
          }
        };

        server.inject(options, (response) => {
          itemOrder = response.result;
          done();
        });
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'GET', url: '/item-order/' + itemOrder.id};
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
          url: '/item-order/' + order.id + '/' + itemOrder.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 200);
          done();
        });
      });

      it('returns 1 item-order at a time', (done) => {
        const options = {
          method: 'GET',
          url: '/item-order/' + order.id + '/' + itemOrder.id,
          headers: {'Authorization': 'Bearer ' + userInfo}
        };

        server.inject(options, (response) => {
          expect(response.result.Order).to.have.property('id', itemOrder.order);
          expect(response.result.Product).to.have.property('id', itemOrder.product);
          expect(response.result).to.have.property('unitPrice', itemOrder.unitPrice);
          expect(response.result).to.have.property('quantity', itemOrder.quantity);
          done();
        });
      });

      it('return 400 HTTP status code when the specified id is invalid', (done) => {
        const options = {
          method: 'GET',
          url: '/item-order/' + order.id + '/aaa',
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
          url: '/item-order/' + order.id + '/1000',
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

  describe('POST /item-order', () => {
    before((done) => {
      return db.ItemOrder.destroy({where: {}})
      .then(() => {
        done();
      });
    });

    describe('when request is not authenticated', () => {
      it('returns 401 HTTP status code', (done) => {
        const options = {method: 'POST', url: '/item-order'};
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 401);
          done();
        });
      });

      it('returns 400 HTTP status code when no body is sended', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
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

      it('returns 400 HTTP status code  when no `order` is send', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "order" fails because ["order" is required]');
          done();
        });
      });

      it('returns 400 HTTP status code  when no `product` is send', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            order: order.id,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "product" fails because ["product" is required]');
          done();
        });
      });

      it('returns 400 HTTP status code  when no `unitPrice` is send', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            quantity: 1
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

      it('returns 400 HTTP status code  when no `quantity` is send', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "quantity" fails because ["quantity" is required]');
          done();
        });
      });

      it('returns 400 HTTP status code  when `product` isn\'t a number', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: 'AAA',
            order: order.id,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "product" fails because ["product" must be a number]');
          done();
        });
      });

      it('returns 400 HTTP status code  when `order` isn\'t a number', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: 'AAA',
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "order" fails because ["order" must be a number]');
          done();
        });
      });

      it('returns 400 HTTP status code  when `unitPrice` isn\'t a number', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 'AAA',
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "unitPrice" fails because ["unitPrice" must be a number]');
          done();
        });
      });

      it('returns 400 HTTP status code  when `quantity` isn\'t a number', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 1,
            quantity: 'AAA'
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "quantity" fails because ["quantity" must be a number]');
          done();
        });
      });

      it('return 400 HTTP status code when `product` isn\'t a positive number ', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: -1,
            order: order.id,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "product" fails because ["product" must be a positive number]');
          done();
        });
      });

      it('return 400 HTTP status code when `order` isn\'t a positive number ', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: -1,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "order" fails because ["order" must be a positive number]');
          done();
        });
      });

      it('return 400 HTTP status code when `unitPrice` isn\'t a positive number ', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: -1,
            quantity: 1
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

      it('return 400 HTTP status code when `quantity` isn\'t a positive number ', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 1,
            quantity: -1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 400);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('statusCode', 400);
          expect(response.result).to.have.property('error', 'Bad Request');
          expect(response.result).to.have.property('message', 'child "quantity" fails because ["quantity" must be a positive number]');
          done();
        });
      });

      it('returns 201 HTTP status code when all data is correct', (done) => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 1,
            quantity: 1
          }
        };
        server.inject(options, (response) => {
          expect(response).to.have.property('statusCode', 201);
          expect(response).to.have.property('result');
          expect(response.result).to.have.property('product', product.id);
          expect(response.result).to.have.property('order', order.id);
          expect(response.result).to.have.property('unitPrice', '1.00');
          expect(response.result).to.have.property('quantity', 1);
          done();
        });
      });
    });
  });

  describe('PUT /item-order/{id}', () => {
    let itemOrder;
    before((done) => {
      return db.ItemOrder.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 1,
            quantity: 1
          }
        };

        server.inject(options, (response) => {
          itemOrder = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code  when `product` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: 'AAA',
          order: order.id,
          unitPrice: 1,
          quantity: 1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "product" fails because ["product" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `order` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: 'AAA',
          unitPrice: 1,
          quantity: 1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "order" fails because ["order" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `unitPrice` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: order.id,
          unitPrice: 'AAA',
          quantity: 1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "unitPrice" fails because ["unitPrice" must be a number]');
        done();
      });
    });

    it('returns 400 HTTP status code  when `quantity` isn\'t a number', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: order.id,
          unitPrice: 1,
          quantity: 'AAA'
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "quantity" fails because ["quantity" must be a number]');
        done();
      });
    });

    it('return 400 HTTP status code when `product` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: -1,
          order: order.id,
          unitPrice: 1,
          quantity: 1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "product" fails because ["product" must be a positive number]');
        done();
      });
    });

    it('return 400 HTTP status code when `order` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: -1,
          unitPrice: 1,
          quantity: 1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "order" fails because ["order" must be a positive number]');
        done();
      });
    });

    it('return 400 HTTP status code when `unitPrice` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: order.id,
          unitPrice: -1,
          quantity: 1
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

    it('return 400 HTTP status code when `quantity` isn\'t a positive number ', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: order.id,
          unitPrice: 1,
          quantity: -1
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 400);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('statusCode', 400);
        expect(response.result).to.have.property('error', 'Bad Request');
        expect(response.result).to.have.property('message', 'child "quantity" fails because ["quantity" must be a positive number]');
        done();
      });
    });

    it('returns 201 HTTP status code when all data is correct', (done) => {
      const options = {
        method: 'PUT',
        url: '/item-order/' + order.id + '/' + itemOrder.id,
        headers: {'Authorization': 'Bearer ' + userInfo},
        payload: {
          product: product.id,
          order: order.id,
          unitPrice: 2,
          quantity: 2
        }
      };
      server.inject(options, (response) => {
        expect(response).to.have.property('statusCode', 200);
        expect(response).to.have.property('result');
        expect(response.result).to.have.property('product', product.id);
        expect(response.result).to.have.property('order', order.id);
        expect(response.result).to.have.property('unitPrice', 2);
        expect(response.result).to.have.property('quantity', 2);
        done();
      });
    });
  });

  describe('DELETE /item-order/{id}', () => {
    let itemOrder;
    before((done) => {
      return db.ItemOrder.destroy({where: {}})
      .then(() => {
        const options = {
          method: 'POST',
          url: '/item-order',
          headers: {'Authorization': 'Bearer ' + userInfo},
          payload: {
            product: product.id,
            order: order.id,
            unitPrice: 2,
            quantity: 2
          }
        };

        server.inject(options, (response) => {
          itemOrder = response.result;
          done();
        });
      });
    });

    it('returns 400 HTTP status code when no `id` is send', (done) => {
      const options = {
        method: 'DELETE',
        url: '/item-order/' + order.id + '/',
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
        url: '/item-order/' + order.id + '/' + itemOrder.id,
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
