'use strict';

module.exports = (sequelize, DataType) => {
  const ItemOrder = sequelize.define('ItemOrder', {
    order: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    price: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    quantity: {
      type: DataType.INTEGER(),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'itens_orders',

    classMethods: {
      associate: (models) => {
        ItemOrder.belongsTo(models.Order, {
          foreignKey: 'order'
        });
        ItemOrder.belongsTo(models.Product, {
          foreignKey: 'product'
        });
      }
    },

    scopes: {
      order: (value) => {
        return {
          where: {
            order: value
          }
        };
      }
    }
  });
  return ItemOrder;
};
