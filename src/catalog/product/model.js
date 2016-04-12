'use strict';

module.exports = (sequelize, DataType) => {
  const Product = sequelize.define('Product', {
    reference: {
      type: DataType.STRING(8),
      allowNull: false
    },
    description: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    unitPrice: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'unit_price'
    },
    category: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
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
    tableName: 'products',

    classMethods: {
      associate: (models) => {
        Product.belongsTo(models.User, {
          foreignKey: 'user'
        });
        Product.belongsTo(models.Category, {
          foreignKey: 'category'
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

  return Product;
};
