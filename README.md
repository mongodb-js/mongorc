# mongorc

[![build status](https://secure.travis-ci.org/mongodb-js/mongorc.png)](http://travis-ci.org/mongodb-js/mongorc)

Work with ~/.mongorc.js programmatically.


## Example

```javascript
var mongorc = require('mongorc');
mongorc.contents(function(err, s){
  console.log('contents of current ~/.mongodb.js: ', s);

  mongorc.backup(function(err){
    if(err) return console.error('Backup failed: ', err);

    // .. do stuff ..
    // .. on nos!  we had an error!

    mongorc.restore(function(){
      console.log('restored ~/.mongodb.js');
      
      mongorc.contents(function(err, s){
        console.log('contents of current ~/.mongodb.js: ', s);
      });
    });
  });
});
```

## Install

```
npm install --save mongodb-js/mongorc
```

## License

Apache 2
