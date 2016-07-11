var express = require('express');
var router = express.Router();
var io = require('../app').io;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.io.emit("socketToMe", "users");
  res.render('users', { title: 'Users' });
});


module.exports = router;
