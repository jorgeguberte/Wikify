
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var cache = require('memory-cache');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname+'/public'));

var Wiki = require('wikijs');
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


function getArticle(res, term){  
  console.log('getArticle');

  //search cache
  console.log('Gonna search cache for '+term);
  var output = null;
  var cachedResult = cache.get(term);
  if(cachedResult !== null){
    console.log('Is in cache')
    res.send(cachedResult);
  }else{
    console.log('Is not in cache');
    Wiki.page(term, function(err, page){
        page.html(function(err, html){
            output = {html:html};
            cache.put(term, output);
            res.send(output);
        });
    });
  }
}

function getSuggestions(res, term){
  console.log('getSuggestions');
    Wiki.search(term, 3, function(err, results){
        var output = {suggestions:results};
        res.send(output);
    });
};

app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/wiki/suggestions/:term', function(req, res){
        getSuggestions(res, req.params.term);
});



app.get('/wiki/:term', function(req, res){
    console.time('articlefetch');
    getArticle(res, req.params.term);
});

app.get('/', routes.index);





http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
