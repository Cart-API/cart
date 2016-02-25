'use strict';

const Promise = require('bluebird');

module.exports = { up, down };

function up (db) {
  const DataType = db.Sequelize;

  const User = db.sequelize.define('User', {
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
    tableName: 'users'
  });  

  const Category = db.sequelize.define('Category', {
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
  });

  const Product = db.sequelize.define('Product', {
    reference: {
      type: DataType.STRING(8),
      allowNull: false
    },
    description: {
      type: DataType.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    unit: {
      type: DataType.DECIMAL(14, 2),
      allowNull: false,
      defaultValue: 0.00
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
    tableName: 'products'
  });

  const Client = db.sequelize.define('Client', {
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
  });

  const Order = db.sequelize.define('Order', {
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
    tableName: 'orders'
  });

  const ItemOrder = db.sequelize.define('ItemOrder', {
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
    tableName: 'itens_orders'
  });

  return Promise.all([User.sync()])
  .then(() => {
    return Promise.all([Category.sync(), Client.sync()])
    .then(() => {
      return Promise.all([Product.sync(), Order.sync()])
      .then(() => {
        return Promise.all([ItemOrder.sync()]);
      });
    });
  });
}

function down (db) {

  const User = require('../src/shared/user/model')(db.sequelize, db.Sequelize);
  const Client = require('../src/catalog/client/model')(db.sequelize, db.Sequelize);
  const Category = require('../src/catalog/category/model')(db.sequelize, db.Sequelize);
  const Product = require('../src/catalog/product/model')(db.sequelize, db.Sequelize);
  const Order = require('../src/catalog/order/model')(db.sequelize, db.Sequelize);
  const ItemOrder = require('../src/catalog/item-order/model')(db.sequelize, db.Sequelize);


  return Promise.all([ItemOrder.drop(),])
  .then(() => {
    return Promise.all([Order.drop(), Product.drop()])
    .then(() => {
      return Promise.all([Category.drop(), Client.drop()])
      .then(() => {
        Promise.all([User.drop()]);
      });
    });
  });  
}

