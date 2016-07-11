var express = require('express');
var router = express.Router();

/* GET home page. */


// module.exports = router;
module.exports = function(io) {
  var app = require('express');
  io.on('connection', function(socket) {
    console.log("Index: a user connected");
  });

  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  
  return router;

};