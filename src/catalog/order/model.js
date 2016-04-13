'use strict';

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

    getterMethods: {
      total: function () {
        sequelize.query('SELECT sum(unit_price * quantity) FROM itens_orders WHERE "order" = :order', {
          replacements: {
            order: this.id
          },
          type: sequelize.QueryTypes.SELECT
        })
        .then((value) => {
          return value[0];
        });
      }
    }
  });
  return Order;
};
