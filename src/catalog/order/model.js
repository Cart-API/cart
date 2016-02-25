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
    price: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    discount: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
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
    }
  });
  return Order;
};
