/**
 * Created by jacka on 7/10/2016.
 */
var express = require('express');
var router = express.Router();


module.exports = function (io) {
  io.sockets.on('connection', function(socket) {
    console.log("A user is connected");
  });
};


router.get('/', function(req, res, next) {
  res.render("chat-room", { title: 'Express' });
});

