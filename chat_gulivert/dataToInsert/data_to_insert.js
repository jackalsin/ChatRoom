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

  // initialize company
  var companiesToInsert = [{
    name: "a",
    employees:["a1", "a2", "a3"]
  },{
    name: "b",
    employees:["b1", "b2", "b3"]
  }];

  Companies.create(companiesToInsert, function (err, companies) {
    if (err) throw err;
    console.log("Insert Companies successfully");
  });
  // ----- users ---------------
  Users.create({
    username: "a1",
    companies:["a"]
  }, function(err) {
    if (err)
      console.log(err);
  });
  Users.create({
    username: "a2",
    companies:["a"]
  }, function(err) {
    if (err)
      console.log(err);
  });
  Users.create({
    username: "a3",
    companies:["a"]
  }, function(err) {
    if (err)
      console.log(err);
  });
    // b company
  Users.create({
    username: "b1",
    companies:["b"]
  }, function(err) {
    if (err)
      console.log(err);
  });
  Users.create({
    username: "b2",
    companies:["b"]
  }, function(err) {
    if (err)
      console.log(err);
  });
  Users.create({
    username: "b3",
    companies:["b"]
  }, function(err) {
    if (err)
      console.log(err);
  });


});
