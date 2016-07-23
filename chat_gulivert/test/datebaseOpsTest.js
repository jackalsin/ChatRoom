var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/conFusion';
var assert = require('assert');
var Users = require('./../models/Users');
var Companies = require('./../models/Company');
var dbOps = require('./../utils/databaseOps');

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to mongodb server");

  dbOps.getHistoryChatRoomsObjId("INVALID_USRNAME", function (err, chatRooms) {
    console.log("Err msg :" + err);
    assert(err, "Error: No such user");
  });

  dbOps.getHistoryChatRoomsObjId("a1", function (err, chatRooms) {
    if(err) throw err;
    console.log("********************ChatroomIDs = " + chatRooms); // debug line
    console.log("getHistoryChatRoomsObjId test passed");
    // test getChatRoomByUsers
    dbOps.getChatRoomByUsers(['a1', 'a2'], function (err, chatRoom) {
      if (err) throw err;
      console.log("First Fetch ", chatRoom); //todo: debug line
      dbOps.getChatRoomByUsers(['a1', 'a2'], function (err, secChatRoom) {
        console.log("Second Fetch", secChatRoom);
        assert(chatRoom._id, secChatRoom._id);
        dbOps.getChatRoomByUsers(['a2', 'a1'], function (err, thirdChatRoom) {
          assert(chatRoom._id, thirdChatRoom._id);
          console.log("Test reverse order fetch getChatRoomByUsers passed");
          Users.findOne({username: "a1"}, function (err, userFound) {
            if (err) throw err;
            // ensure multiple getChatRoom still ensure it has 2 chatRooms
            console.log("************** Step 2222 ", userFound.historyRooms);
            assert(userFound.historyRooms.length, 2);
            dbOps.addMessageToChatRoom(["a1", "a2"], { user: "a1", msg: "Sent from a1"}, function (err) {
              if (err) throw err;
              console.log("Updated Successfully");
              dbOps.addMessageToChatRoom(["a1", "a3"], { user: "a1", msg: "Sent from a1"}, function (err) {
                if (err) throw err;
                console.log("Updated Successfully");
                dbOps.getHistoryChatRoomsObjId("a1", function (err, chatRoomObjIds) {
                  if (err) throw err;
                  assert(chatRoomObjIds.length, 2);
                });
                // test of getHistoryMsgFromChatRoom
                dbOps.getHistoryMsgFromChatRoom(["a1", "a2"], 0, 20, function (err, result) {
                  // todo: add assert about 20
                  if (err) throw err;

                  dbOps.getHistoryChatRoomsObjId("a1", function (err, chatRoomObjIds) {
                    if (err) throw err;
                    assert(chatRoomObjIds.length, 2);
                  });


                  dbOps.getContacts("a1", function (err, contacts) {
                    if (err) throw err;
                    else {
                      console.log(contacts);
                      assert(contacts, ["a1", "a2", "a3"]);

                      // test of getHistoryChatRoomsWithLatest20Msgs
                      Users.findOne({username: "a1"}, function (err, userFound) {
                        console.log("User Found: " + userFound.historyRooms);

                        dbOps.getHistoryChatRoomsWithLatest20Msgs("a1", function (err, result) {
                          console.log("\n\nTest of getHistoryChatRoomsWithLatest20Msgs ");
                          if (err) throw err;
                          else {
                            console.log("result = " + result);
                          }
                        });
                      });
                    }
                  }); // end of test of getContacts
                });
              }); // end of test of add messages [a1, a2]
            }); // end of test of add messages [a1, a2]
          });
          // test of add messages
        });
      });
    });
  });
});

