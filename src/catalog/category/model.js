'use strict';

module.exports = (sequelize, DataType) => {
  const Category = sequelize.define('Category', {
    description: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: ''
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
    tableName: 'categories',

    classMethods: {
      associate: (models) => {
        Category.belongsTo(models.User, { 
          foreignKey: 'user' 
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

  return Category;
};

