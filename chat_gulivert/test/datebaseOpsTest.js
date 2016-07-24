var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/conFusion';
var assert = require('assert');
var Users = require('./../models/Users');
var Companies = require('./../models/Company');
var ChatRooms = require('./../models/Chatrooms');
var dbOps = require('./../utils/databaseOps');
var additionalMsgs = require('./addtionalData').additionalMsgs;
var usersToInsert = require('./addtionalData').usersToInsert;
var companiesToInsert = require('./addtionalData').companiesToInsert;


mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongodb server");

  // ------------ Insert data ------------------------
  Companies.create(companiesToInsert, function (err, companies) {
    if (err) throw err;
    console.log("Insert Companies successfully");
    Users.create(usersToInsert, function(err, users) {
      if (err) throw err;
      console.log("Initialized companies and users are inserted");

      //--------------------- begin of test code ----------------------
      dbOps.getHistoryChatRoomsObjIds("INVALID_USRNAME", function (err, chatRooms) {
        console.log("Err msg :" + err);
        dbOps.getHistoryChatRoomsObjIds("a1", function (err, chatRooms) {
          if(err) throw err;
          console.log("getHistoryChatRoomsObjIds test passed");
          // test getChatRoomByUsers
          dbOps.getChatRoomByUsers(['a1', 'a2'], function (err, chatRoom) {
            if (err) throw err;
            dbOps.getChatRoomByUsers(['a1', 'a2'], function (err, secChatRoom) {
              if (err) throw err;
              assert(chatRoom._id.equals(secChatRoom._id));
              dbOps.getChatRoomByUsers(['a2', 'a1'], function (err, thirdChatRoom) {
                assert(chatRoom._id.equals(thirdChatRoom._id));
                console.log("Test reverse order fetch getChatRoomByUsers passed");
                Users.findOne({username: "a1"}, function (err, userFound) {
                  if (err) throw err;
                  // ensure multiple getChatRoom still ensure it has 2 chatRooms
                  assert(userFound.historyRooms.length === 1);
                  dbOps.addMessageToChatRoom(["a1", "a2"], { user: "a1", msg: "Sent from a1"}, function (err) {
                    if (err) throw err;
                    console.log("Updated Successfully");
                    dbOps.addMessageToChatRoom(["a1", "a3"], { user: "a1", msg: "Sent from a1"}, function (err) {
                      if (err) throw err;
                      console.log("Updated Successfully");

                      ChatRooms.update({usernames: ["a1", "a3"]}, {$pushAll:{messages: additionalMsgs}}, {safe:true}, function (err) {
                        if (err) throw err;
                        dbOps.getHistoryChatRoomsObjIds("a1", function (err, chatRoomObjIds) {
                          if (err) throw err;
                          assert(chatRoomObjIds.length === 2);
                          // test of getHistoryMsgFromChatRoom
                          dbOps.getHistoryMsgFromChatRoom(["a1", "a3"], 0, 20, function (err, result) {
                            if (err) throw err;
                            console.log(result.length);
                            assert.equal(result.length, 20, "test of getHistoryMsgFromChatRoom passed");
                            dbOps.getHistoryChatRoomsObjIds("a1", function (err, chatRoomObjIds) {
                              if (err) throw err;
                              assert(chatRoomObjIds.length === 2);
                            });
                            dbOps.getContacts("a1", function (err, contacts) {
                              if (err) throw err;
                              else {
                                console.log(contacts);
                                var compared = ["a1", "a2", "a3"];
                                for (var i = 0; i < contacts.length; i++) {
                                  assert(contacts[i] === compared[i]);
                                }

                                // test of getHistoryChatRoomsWithLatest20Msgs
                                Users.findOne({username: "a1"}, function (err, userFound) {
                                  console.log("User Found: " + userFound.historyRooms);

                                  dbOps.getHistoryChatRoomsWithLatest20Msgs("a1", function (err, result) {
                                    console.log("\n\nTest of getHistoryChatRoomsWithLatest20Msgs");
                                    if (err) throw err;
                                    else {
                                      console.log("result = " + result);
                                    }
                                    db.collections['chatrooms'].drop(function (err) {
                                      if (err) throw err;
                                      db.collections['users'].drop(function (err) {
                                        if (err) throw err;
                                        db.collections['companies'].drop(function (err) {
                                          if (err) throw err;
                                          console.log("Three collections are dropped");
                                          db.close();
                                        });
                                      });
                                    });
                                  });
                                });
                              }
                            }); // end of test of getContacts
                          });
                        });
                      });
                    }); // end of test of add messages [a1, a2]
                  }); // end of test of add messages [a1, a2]
                }); // test of add messages
              });
            });
          });
        });
      });
      // -------------------- end of test code ------------------------
    });
  });


});

