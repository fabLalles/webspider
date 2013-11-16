// API


// A simple (non-REST) API
// You may (should) want to improve it in order to provide a real-GUI for:
// - adding/removing urls to scrape
// - monitoring the crawler state
// - providing statistics like
//    - a word-cloud of the 100 most used word on the web
//    - the top 100 domain name your crawler has see
//    - the average number of link by page on the web
//    - the most used top-level-domain (TLD: http://en.wikipedia.org/wiki/Top-level_domain )
//    - ...
 
// You should extract all the following "api" related code into its own NodeJS module and require it with
// var api = require('./api');
// api.listen(PORT);

var PORT            = 3000;

// See: http://expressjs.com/guide.html

var express         = require('express');
var app             = express();
var scraper = require('./scraper');
 
app.get('/', function(req, res){
  // See: http://expressjs.com/api.html#res.json
  res.json(200, {
    title:'YOHMC - Your Own Home Made Crawler',
    endpoints:[{
      url:'http://127.0.0.1:'+PORT+'/queue/size',
      details:'the current crawler queue size'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/add?url=http%3A//voila.fr',
      details:'immediately start a `get_page` on voila.fr.'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/list',
      details:'the current crawler queue list.'
    }]
  });
});
 
app.get('/queue/size', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.json(200, {queue:{length:queue.length}});
});
 
app.get('/queue/add', function(req, res){
  var url = req.param('url');
  get_page(url);
  res.json(200, {
    queue:{
      added:url,
      length:queue.length,
    }
  });
});
 
app.get('/queue/list', function(req, res){
  res.json(200, {
    queue:{
      length:queue.length,
      urls:queue
    }
  });
});
 
app.listen(PORT);
console.log('Web UI Listening on port '+PORT);