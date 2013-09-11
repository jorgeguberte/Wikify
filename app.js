
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

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
app.use(express.static(path.join(__dirname, 'public')));

var Wiki = require('wikijs');
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


function getArticle(res, term){  
    Wiki.page(term, function(err, page){
        page.html(function(err, html){
            var output = {content:html};
            res.send(output);
            console.timeEnd('articlefetch');
        });
    });
}

function getSuggestions(res, term){
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
