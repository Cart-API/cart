'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataType) => {
  return sequelize.define('User', {
    username: {
      type: DataType.STRING(40),
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataType.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataType.STRING(50),
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataType.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataType.STRING(200),
      allowNull: false,
      validate: {
        is: /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
      }
    }
  }, {
    createdAt: 'created_at',
    updatedAt: 'update_at',
    tableName: 'users',

    hooks: {
      beforeCreate: function (user) {
        user.set({
          password: hashPassword(user.get('password'))
        });
      },
      beforeUpdate: function (user) {
        if (!user.changed('password')) {
          return;
        }
        user.set({
          password: hashPassword(user.get('password'))
        });
      }
    },
    instanceMethods: {
      validatePassword: function (password) {
        return bcrypt.compareSync(password, this.get('password'));
      }
    }
  });
};

function hashPassword (password) {
  if (!password) {
    return false;
  }

  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
