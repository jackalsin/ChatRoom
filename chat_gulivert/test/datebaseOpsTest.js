var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/conFusion';
var assert = require('assert');
var Users = require('./../models/Users');
var Companies = require('./../models/Company');
var dbOps = require('./../databaseOps');

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongodb server");

  dbOps.getHistoryChatRooms("a1", function (err, chatRooms) {
    if(err) throw err;
    console.log("getHistoryChatRooms test passed");
  });

  dbOps.getHistoryChatRooms("INVALID_USRNAME", function (err, chatRooms) {
    console.log("Err msg :" + err);
    assert(err, "Error: No such user");
  });

  // check room
  dbOps.getChatRoom(['a1', 'a2'], function (err, chatRoom) {
    if (err) throw err;
    dbOps.getChatRoom(['a1', 'a2'], function (err, secChatRoom) {
      assert(chatRoom._id, secChatRoom._id);
      dbOps.getChatRoom(['a2', 'a1'], function (err, thirdChatRoom) {
        assert(chatRoom._id, thirdChatRoom._id);
      });
    });
  });

  dbOps.addMessageToChatRoom(["a1", "a2"], { user: "a1", msg: "Sent from a1"}, function (err) {
    if (err) throw err;
    console.log("Updated Successfully");
  });

  dbOps.addMessageToChatRoom(["a1", "a3"], { user: "a1", msg: "Sent from a1"}, function (err) {
    if (err) throw err;
    console.log("Updated Successfully");
  });

});

