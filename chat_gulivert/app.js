var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Users = require('./models/Users');
var Companies = require('./models/Company');
var assert = require('assert');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

/**
 * add Socket module
 */
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//////////////////// mongo db
var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/conFusion';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
console.log("Connect a database");
db.once('open', function () {
  console.log("Connected correctly to server");
});

////////////////////////////////////////

var allSockets = {};

// start listen with socket.io
app.io.on('connection', function(socket){
  console.log('a user connected');

  // add user handler
  socket.on('add user', function (username) {
    console.log("add user: " + username);
    socket.username = username;
    Users.findOne({ 'username' : username }, 'companies', function (err, sender) {
      if (err)  next(err);
      var companies = sender.companies;
      var contacts = [];
      console.log("====>" + sender.companies);
      function getContacts() {
        var i = 0;
        function getContactsHelper(i) {
          Companies.findOne({'name': companies[i]}, 'employees', function (err, company) {
            if (err) console.log(err);
            if (i < companies.length) {
              contacts = contacts.concat(company.employees);
              getContactsHelper(i + 1);
            } else {
              console.log("===============> fetched contacts:" + contacts);
              socket.emit('initialize', {contacts: contacts});
            }
          });
        }
        getContactsHelper(0);
      }
      getContacts();
    });
    app.io.emit("system broadcast", username + " has joint the conversation");
    allSockets[username] = socket;
  });

  // broadcast all message
  /** user_msg format
   {  user: username(the receiver), msg: msg  }
  */
  socket.on('send chat', function (user_msg) {

    console.log("send to " + user_msg.user + " new message:" + user_msg.msg);
    var receiverSocket = allSockets[user_msg.user];

    if (receiverSocket) {
      // app.io.emit('update chat', socket.username, user_msg.msg);
      // app.io.to(receiverSocket).emit('update chat', socket.username, user_msg.msg);
      receiverSocket.emit('update chat', socket.username, user_msg.msg);
    }
    // todo: update the date base
    //  http://stackoverflow.com/questions/23619015/creating-a-private-chat-between-a-key-using-a-node-js-and-socket-io
  });

  socket.on('disconnect', function () {
    delete allSockets[socket.username];
    console.log(socket.username + " offline");
  });
}); // end of connection

module.exports = app;
