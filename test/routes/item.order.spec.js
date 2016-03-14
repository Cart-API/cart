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
                unit: 1,
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
                    price: 1,
                    discount: 1,
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
            price: 1,
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
        expect(response.result.data).to.contain.a.thing.with.property('price');
        expect(response.result.data).to.contain.a.thing.with.property('quantity');
        expect(response.result).to.have.property('count', 5);
        done();
      });
    });
  });
});

