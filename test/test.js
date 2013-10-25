var exec = require('child_process').exec
var expect = require('chai').expect
var mongodb = require('mongoskin')
var mongorc = require('../index')
var path = require('path')

var MONGODB_URI = process.env.MONGODB_URI || "localhost:27017/mongorc"

describe('#mongorc', function() {

  describe('passthru', function() {

    it('should error if no name specified', function(done) {
      mongorc({}, {}, function(err) {
        expect(err).to.exist
        done()
      })
    })

    it('should return regular rc object if no mongodb configured', function(done) {
      mongorc({name:"test"}, {foo:123}, function(err, config) {
        expect(err).to.be.null
        expect(config.foo).to.equal(123)
        done()
      })
    })

  })

  describe('mongodb in-process', function() {

    before(function(done) {
      var db = mongodb.db(MONGODB_URI, {safe:true})
      var coll = db.collection('config')
      coll.drop(function(err) {
        if (err && err.errmsg !== 'ns not found') throw err
        coll.insert({mongo_only: "test", override: "mongo"}, done)
      })
    })

    it('should error with invalid DB url', function(done) {
      mongorc({name:"test", configUrl:"foo.nonexistant"}, {foo:123}, function(err, config) {
        expect(err).to.exist
        done()
      })
    })

    it('should error with non-existant db', function(done) {
      mongorc({name:"test", configUrl:"foo.nonexistant/nowhere"}, {foo:123}, function(err, config) {
        expect(err).to.exist
        done()
      })
    })

    it('should load config from mongodb and override supplied defaults', function(done) {
      mongorc({name:"test", configUrl:MONGODB_URI}, {override:123}, function(err, config) {
        expect(err).to.be.null
        expect(config.override).to.equal("mongo")
        done()
      })
    })

    it('should load config from mongodb', function(done) {
      mongorc({name:"test", configUrl:MONGODB_URI}, {foo:123}, function(err, config) {
        expect(err).to.be.null
        expect(config.foo).to.equal(123)
        expect(config.override).to.equal("mongo")
        expect(config.mongo_only).to.equal("test")
        done()
      })
    })
  })

  describe('mongodb child process', function() {

    before(function(done) {
      var db = mongodb.db(MONGODB_URI, {safe:true})
      db.collection('config').drop(function(err) {
        if (err && err.errmsg !== 'ns not found') throw err
          db.collection('config').insert([{mongo_only: "test", override: "mongo"}, {name:"has a name", mongo_only:"test1", override:"mongo1"}], done)
      })
    })

    it('should error with invalid DB url', function(done) {
      var proc = exec("node index.js --configUrl foo.nonexistant", {cwd:path.join(__dirname, "../"),  }, function(code) {
        expect(code).to.not.equal(0)
        done()
      })

    })

    it('should error with non-existant db', function(done) {
      var proc = exec("node index.js --configUrl foo.nonexistant/nowhere", {cwd:path.join(__dirname, "../"),  }, function(code) {
        expect(code).to.not.equal(0)
        done()
      })
    })

    it('should load config from mongodb with custom query and override supplied defaults', function(done) {
      var proc = exec("node index.js --configQuery '{\"name\": \"has a name\"}'  --configUrl " + MONGODB_URI,
        {cwd:path.join(__dirname, "../")},
        function(code, stdout) {
        expect(code).to.be.null
        expect(stdout).to.exist
        var config = JSON.parse(stdout)
        expect(config.mongo_only).to.equal("test1")
        done()
      })
    })

  })
})
