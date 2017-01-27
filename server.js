var express = require('express');
var os = require('os');
var static = require('node-static');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var minimist = require('minimist');
var url = require('url');
var fs    = require('fs');
var https = require('https');
var socket_server=require('./websocket_server');


var routes = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(bodyParser());


app.use(cookieParser());

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use('/', routes);

var argv = minimist(process.argv.slice(2), {
  default: {
      as_uri: "https://localhost:2013/",
      ws_uri: "ws://localhost:8888/rdy"
  }
});

var options =
{
  key:  fs.readFileSync('keys/server.key'),
  cert: fs.readFileSync('keys/server.crt')
};

/*

 * Definition of global variables.
 */

var pipelines = {};
var candidatesQueue = {};
var idCounter = 0;

function nextUniqueId() {
    idCounter++;
    return idCounter.toString();
}



/*
 * Server startup
 */

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = https.createServer(options, app).listen(port, function() {
    console.log('rdy server started');
    console.log('Open ' + url.format(asUrl) + ' with a WebRTC capable browser');
});

/*

var fileServer = new(static.Server)();
var server = http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(2013);
*/

socket_server(server);