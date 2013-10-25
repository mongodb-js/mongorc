mongorc
=======

Read your [rc](https://github.com/dominictarr/rc) config from MongoDB.


Installation
============

`npm install mongorc`

Usage
=====

`mongorc` sits in front of `rc` and passes any config from MongoDB:

```javascript

var mongorc = require('mongorc')

var MONGODB_URL = process.env.MONGODB_URL || "localhost:27017/mydb"

mongorc({name:"myApp", configUrl:MONGODB_URL}, {foo:123}, function(err, config) {
  console.log("config:", config)
})

```

`mongorc` will also parse CLI arguments for you - similar to how `rc` itself will parse the `--config` argument.

CLI arguments:

```
--configUrl <mongo db url>

--configCollection <collection name> [default: "config"]

--configQuery <JSON-form mongo query>

```

Example of CLI arguments for an application using `mongorc`:


`node index.js --configUrl localhost:27017/myapp --configQuery '{"name":"myconfig"}' --configCollection configuration`

Tests
=====

Run `npm test`

License
=======

BSD

