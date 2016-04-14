'use strict';

const async = require('async');

module.exports = (sequelize, DataType) => {
  const Order = sequelize.define('Order', {
    code: {
      type: DataType.STRING(5),
      defaultValue: '',
      allowNull: false
    },
    emission: {
      type: DataType.DATE(),
      allowNull: false
    },
    delivery: {
      type: DataType.DATE(),
      allowNull: false
    },
    client: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      },
      field: 'client'
    },
    user: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    priceTotal: {
      type: DataType.VIRTUAL
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'orders',

    classMethods: {
      associate: (models) => {
        Order.belongsTo(models.User, {
          foreignKey: 'user'
        });
        Order.belongsTo(models.Client, {
          foreignKey: 'client'
        });
      }
    },

    scopes: {
      user: (value) => {
        return {
          where: {
            user: value
          }
        };
      }
    },

    hooks: {
      afterFind: function (order, options, fn) {
        if (!order) {
          return fn(null);
        }

        if (Array.isArray(order)) {
          async.map(order, getPriceTotal, (err, result) => {
            if (err) {
              return fn(null, order);
            }
            return fn(null, result);
          });
        } else {
          sequelize.query('SELECT sum(unit_price * quantity) FROM itens_orders WHERE "order" = :order', {
            replacements: {
              order: order.id
            },
            type: sequelize.QueryTypes.SELECT
          })
          .then((value) => {
            order.priceTotal = value[0].sum;
            return fn(null, order);
          });
        }
      }
    }
  });

  function getPriceTotal (order, callback) {
    sequelize.query('SELECT sum(unit_price * quantity) FROM itens_orders WHERE "order" = :order', {
      replacements: {
        order: order.id
      },
      type: sequelize.QueryTypes.SELECT
    })
    .then((value) => {
      order.priceTotal = value[0].sum;

      callback(null, order);
    });
  }

  return Order;
};
