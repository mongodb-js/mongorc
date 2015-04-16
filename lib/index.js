var fs = require('fs-extra');
var untildify = require('untildify');
var EOL = require('os').EOL;

var mongorc = module.exports = {};

mongorc.RC_PATH = untildify('~/.mongorc.js');
mongorc.RC_BACKUP_PATH = untildify('~/.mongorc.bak.js');
mongorc.RC_JSON_PATH = untildify('~/.mongorc.json');

mongorc.contents = function(fn) {
  fs.readFile(mongorc.RC_PATH, 'utf-8', function(err, contents) {
    if (err) return fn(null, '');
    fn(null, contents);
  });
};

mongorc.backup = function(done) {
  fs.exists(mongorc.RC_PATH, function(exists) {
    if (!exists) {
      return done();
    }
    fs.move(mongorc.RC_PATH, mongorc.RC_BACKUP_PATH, {
      clobber: true
    }, done);

  });
};

mongorc.restore = function(done) {
  fs.exists(mongorc.RC_BACKUP_PATH, function(backupExists) {
    if (!backupExists) return done();

    fs.move(mongorc.RC_BACKUP_PATH, mongorc.RC_PATH, {
      clobber: true
    }, done);
  });
};

mongorc.ls = function(fn) {
  fs.readJson(mongorc.RC_JSON_PATH, function(err, d) {
    fn(null, (d || {}));
  });
};

mongorc.install = function(name, path, done) {
  mongorc.ls(function(_, d) {
    if (d[name]) return done(); // already installed
    d[name] = path;
    fs.writeJson(mongorc.RC_JSON_PATH, d, done);
  });
};

mongorc.uninstall = function(name, done) {
  mongorc.ls(function(_, d) {
    if (!d[name]) return done(); // already uninstalled
    delete d[name];

    fs.writeJson(mongorc.RC_JSON_PATH, d, done);
  });
};

mongorc._init = function(done) {
  mongorc.backup(function() {
    var loader = [
      'var packages = cat("' + mongorc.RC_JSON_PATH + '");',
      'var names = Object.keys(packages);',
      'print("Loading " + names.length + " mongorc packages...")',
      'names.map(function(p){load(packages[p]);});',
    ].join(EOL);

    fs.writeFile(mongorc.RC_PATH, loader, function(err) {
      if (err) {
        console.error('Could not write %s', mongorc.RC_PATH);
        return mongorc.restore(function() {
          done(err);
        });
      }
      fs.writeJsonFile(mongorc.RC_JSON_PATH, {}, function(err) {
        if (err) {
          console.error('Could not write %s', mongorc.RC_JSON_PATH);
          return mongorc.restore(function() {
            done(err);
          });
        }
        done();
      });
    });
  });
};
