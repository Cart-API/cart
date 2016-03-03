'use strict';

var core = require('./src/core/bootstrap');

core.start()
.catch((err) => {
  console.log(err);
});

