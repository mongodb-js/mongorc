#!/usr/bin/env node

var mongorc = require('../');

mongorc._init(function(err){
  process.exit((err ? 1 : 0));
});
