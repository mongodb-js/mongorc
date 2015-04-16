var mongorc = require('../');
var assert = require('assert');
var path = require('path');
var fs = require('fs-extra');

describe('mongorc', function() {
  describe('postinstall', function() {
    before(function() {
      mongorc.RC_PATH = path.resolve(__dirname + '/.mongorc.js');
      mongorc.RC_JSON_PATH = path.resolve(__dirname + '/.mongorc.json');
      mongorc.RC_BACKUP_PATH = path.resolve(__dirname + '/.mongorc.bak.js');
    });

    after(function() {
      fs.removeSync(mongorc.RC_PATH);
      fs.removeSync(mongorc.RC_JSON_PATH);
      fs.removeSync(mongorc.RC_BACKUP_PATH);
    });
    it('should initialize the mongorc.js files', function(done) {
      mongorc._init(function(err) {
        if (err) {
          return done(err);
        }

        assert(fs.existsSync(mongorc.RC_PATH), mongorc.RC_PATH + ' does not exist');

        mongorc.ls(function(err, d) {
          if (err) {
            return done(err);
          }
          assert.deepEqual(d, {}, 'Should not have any packages but got ' + JSON.stringify(d));
          done();
        });
      });
    });
  });
});
