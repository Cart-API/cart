'use strict';

module.exports = (sequelize, DataType) => {
  const Client = sequelize.define('Client', {
    name: {
      type: DataType.STRING(250),
      allowNull: false
    },
    lastName: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: '',
      field: 'last_name'
    },
    email: {
      type: DataType.STRING(120),
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
    tableName: 'clients',

    classMethods: {
      associate: (models) => {
        Client.belongsTo(models.User, {
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
  return Client;
};
