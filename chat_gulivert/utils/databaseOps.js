/**
 * Created by jacka on 7/19/2016.
 */
var assert = require('assert');
var Users = require('./../models/Users');
var Companies = require('./../models/Company');
var ChatRooms = require('./../models/Chatrooms');
var Messages = require('./../models/Message');

exports.getUser = function() {
  throw errno;
};
/**
 * get all history chat room given a specific user.
 * @user: username of the history rooms owner
 * Usage: getHistoryChatRoomsObjId("username", function(err, result))
 */
exports.getHistoryChatRoomsObjId = function (user, callback) {
  Users.findOne({ username: user }, function (err, user) {
    if (err) {
      console.log("Dev Error: " + err); // todo: debugline
      callback(err, null);
    }
    if (user == null) {
      err = new Error("No such user");
      callback(err, null);
    } else {
      console.log("getHistoryChatRoom: " + user.historyRooms); // todo: debugline
      callback(err, user.historyRooms);
    }
  });
};
/**
 * return an array that contains the following objects
 * {  usernames : [username1, username2, ...],
 *    messages: [Msg1, Msg2, Msg3, ..., Msg20]
 * }
 * The messages array is from the latest to the earliest.
 * @param user: username, type String
 * @param callback: callback function, callback(err, results)
 */
exports.getHistoryChatRoomsWithLatest20Msgs = function(user, callback) {
  this.getHistoryChatRoomsObjId(user, function (err, userHistoryRoomIds) {
    if (err) callback(err, null);
    else {
      ChatRooms.find({'_id': { $in:userHistoryRoomIds}},"messages usernames -_id", function (err, docs) {
        var chatRoomsWithMsgs = [];
        docs.forEach(function (roomEntry) {
          chatRoomsWithMsgs.push({
            usernames: roomEntry.usernames,
            messages: roomEntry.messages.slice(-20)
          });
        });
        chatRoomsWithMsgs.reverse();
        console.log("Inner" + chatRoomsWithMsgs); // todo: debug line
        callback(err, chatRoomsWithMsgs);
      });
    }
  });
};

/**
 * Get a history room if there exists one
 * or a new room if not
 */
exports.getChatRoomByUsers = function (users, callback) {
  var sortedUsers = users.slice().sort(); // nondestructive sort
  // 1) search in all rooms: all people: n^2, search log(n^2)
  // 2) search one first and loop is O(n), and guaranteed <= n
  // proved if x != 3, 1) is optimized
  ChatRooms.findOne({ usernames: sortedUsers }, function (err, chatRoom) {
    if (err) {
      callback(err, null);
      console.log("getChatRoomByUsers: " + err); // todo: debug line
      return;
    }
    if (chatRoom == null) {
      var newChatRoom = new ChatRooms({usernames: sortedUsers});
      newChatRoom.save(function (err, newChatRoom) {
        if (err) { callback(err, null); return;}
        console.log("new ChatRoom created! ");
        // save this id to all users
        // todo: fix another for each issue

        // Users.update({'username': {$in: sortedUsers}}, {$push: {historyRooms: chatRoomFound._id }}, {safe:true}, function (err) {
/*
          for (var i = 0; i < sortedUsers.length; i++) {
          Users.update({ username: sortedUsers[i] },
            { $push: { historyRooms: newChatRoom._id}},{ safe:true },
              function (err, numAffected, rawResponse) {
                  callback(err, newChatRoom);
                  // end of program, no return needed.
              }
            );
        } // end of for loop
*/

        Users.update({'username': {$in: sortedUsers}}, {$push: {historyRooms: newChatRoom._id}}, {safe: true}, function (err) {
          if (err) callback(err, null);
          else callback(err, newChatRoom);
        });
      });
    } else { // already exist
      // console.log("getChatRoomByUsers: " + chatRoom);// todo:debug line
      callback(err, chatRoom);
    }
  });
};
/**
 * It add message to the chatrooms that belongs to the users. It guarantees to create an new chatRoom if not exist
 * No need to manually create one.
 * @param users: Array of Strings, each of which indicates a username
 * @param message: Format {user: the sender of the message, msg: the content of the message }
 * @param callback: function(err)
 */
exports.addMessageToChatRoom = function(users, message, callback) {
  var newMsg = {
    owner: message.user,
    content: message.msg
  };
  var sortedUsers = users.slice().sort();
  ChatRooms.findOneAndUpdate({ usernames: sortedUsers }, {$push: { messages: newMsg }}, { safe:true, upsert:true, new: true },
    function (err, chatRoomFound) {
      // console.log("Chat room found = " + chatRoomFound);
      if (chatRoomFound.messages.length == 1) {
          // Just Created a chatroom , save to users.
          Users.update({'username': {$in: sortedUsers}}, {$push: {historyRooms: chatRoomFound._id }}, {safe:true}, function (err) {
            if (err) {
              callback(err);
            }
          });
      }
      callback(err);
    }
  );
};

/**
 * To return the most recent [startIndex, endIndex) history message of users.
 */
exports.getHistoryMsgFromChatRoom = function(users, startIndex, endIndex, callback) {
  if (endIndex <= startIndex) {
    callback("startIndex = "+ startIndex+ " must be smaller than endIndex = " + endIndex, null);
    return;
  }

  ChatRooms.findOne({ usernames: users}, "messages", function (err, chatRoomFound) {
    if (err) callback(err, null);
    else {
      console.log("Chat room I found: ",chatRoomFound.messages); // todo: debug line
      if (startIndex == 0) {
        callback(err, chatRoomFound.messages.slice(-endIndex));
      } else {
        callback(err, chatRoomFound.messages.slice(-endIndex, -startIndex));
      }
    }
  });
};

exports.getContacts = function (username, callback) {
  Users.findOne({'username': username }, 'companies', function(err, userFound) {
    if (err) callback(err, null);
    else {
      var companies = userFound.companies;
      var contacts = [];
      
      function getContactsRecursive(callback) {
        function getContactsRecursiveHelper(i,callbackHelper) {
          if (i < companies.length) {
            Companies.findOne({'name': companies[i]}, 'employees', function (err, company) {
              if (err) callbackHelper(err, null);
              else {
                contacts = contacts.concat(company.employees);
                getContactsRecursiveHelper(i + 1, callbackHelper);
              }
            });
          } else {
            callbackHelper(err, contacts);
          }
        } // end of *helper definition
        getContactsRecursiveHelper(0, function (err, contacts) {
          callback(err, contacts);
        })
      }

      getContactsRecursive(function(err, contacts) {
        callback(err, contacts);
      });
    }
  });
};

