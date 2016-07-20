var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/conFusion';
var assert = require('assert');
var Users = require('./../models/Users');
var Companies = require('./../models/Company');

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

  console.log("Connected to mongodb server");

  Users.create({
    username: "c1",
    companies:["c"]
  }, function(err) {
    if (err) console.log(err);
  });

});
