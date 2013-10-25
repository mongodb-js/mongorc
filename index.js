var _ = require('lodash')
var argv = require('optimist').argv
var mongodb = require('mongoskin')
var rc = require('rc')

module.exports = function(opts, defaultConfig, cb) {

  var defaultConfig = defaultConfig || {}

  if (!opts.name)
    return cb(new Error("must specify a name in options object"), null)

  if (typeof cb !== 'function') 
    return cb(new Error("must supply a callback function"), null)

  // Collection to read config from.
  var configCollection = argv.configCollection || opts.configCollection || "config"
  // Database URL to read config from.
  var configUrl = argv.configUrl || opts.configUrl
  // Query to findOne the config with. Defaults to empty.
  var configQuery = argv.configQuery || opts.configQuery || {}

  var db = null

  if (!configUrl) {
    // No mongodb URL - passthru
    return cb(null, rc(opts.name, defaultConfig))
  }

  var gotConfig = function(err, config) {
    if (err) {
      return cb(new Error("error loading config from MongoDB: " + err, null))
    }
    db.close()
    var config = _.extend(defaultConfig, config)
    return cb(null, rc(opts.name, config))
  }

  var getConfig = function(url, collection, query, cb) {
    try {
      db = mongodb.db(url, {safe:true})
      db.collection(collection).findOne(query, cb)
    } catch(e) {
      return cb(e, null)
    }
  }

  getConfig(configUrl, configCollection, configQuery, gotConfig)

}

// If run from CLI by tests
if (require.main === module) {
  module.exports({name:"mongorctest"}, {}, function(err, config) {
    if (err) throw err
    console.log(config)
    process.exit(1)
  })
}
