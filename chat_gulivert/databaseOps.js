/**
 * Created by jacka on 7/19/2016.
 */
var assert = require('assert');
var Users = require('./models/Users');
var Companies = require('./models/Company');
var ChatRooms = require('./models/Chatrooms');
var Messages = require('./models/Message');

exports.getUser = function() {
  throw errno;
};
/**
 * get all history chat room given a specific user.
 * @user: username of the history rooms owner
 * Usage: getHistoryChatRooms("username", function(err, result))
 */
exports.getHistoryChatRooms = function (user, callback) {
  Users.findOne({ username: user }, function (err, user) {
    if (err) {
      console.log("Dev Error: " + err); // todo: debugline
      callback(err, []);
    }
    if (user == null) {
      err = new Error("No such user");
      callback(err, []);
    } else {
      console.log("getHistoryChatRoom: " + user.historyRooms); // todo: debugline
      callback(err, user.historyRooms);
    }
  });
};

exports.getChatRoomById = function(id, callback) {

};

/**
 * Get a history room if there exists one
 * or a new room if not
 */
exports.getChatRoom = function (users, callback) {
  var sortedUsers = users.slice().sort(); // nondestructive sort
  // 1) search in all rooms: all people: n^2, search log(n^2)
  // 2) search one first and loop is O(n), and guaranteed <= n
  // proved if x != 3, 1) is optimized
  ChatRooms.findOne({ usernames: sortedUsers }, function (err, chatRoom) {
    if (err) {
      callback(err, null);
      console.log("getChatRoom: " + err); // todo: debug line
      return;
    }
    if (chatRoom == null) {
      var newChatRoom = new ChatRooms({usernames: sortedUsers});
      newChatRoom.save(function (err, newChatRoom) {
        if (err) { callback(err, null); return;}
        console.log("new ChatRoom created! ");
        // save this id to all users
        // todo: fix another for each issue
        for (var i = 0; i < sortedUsers.length; i++) {
          Users.update({ username: sortedUsers[i] },
            { $push: { historyRooms: newChatRoom._id}},{ safe:true },
              function (err, numAffected, rawResponse) {
                if (err) { // todo: delete generated and the one already inserted
                  callback(err, newChatRoom);
                  // end of program, no return needed.
                }
              }
            );
        }
      });
    } else { // already exist
      console.log("getChatRoom: " + chatRoom);
      callback(err, chatRoom);
    }
  });
};
/**
 * It add message to the chatrooms that belongs to the users. It guarantees to create an new chatRoom if not exist
 * No need to manually create one.
 * @users: Array of Strings, each of which indicates a username
 * @message: Format {user: the sender of the message, msg: the content of the message }
 * @callback: function(err)
 */
exports.addMessageToChatRoom = function(users, message, callback) {
  var newMsg = {
    owner: message.user,
    content: message.msg
  };
  var sortedUsers = users.slice().sort();
  ChatRooms.update({ usernames: sortedUsers }, {$push: { messages: newMsg }}, { safe:true, upsert:true },
    function (err) {
      if (err) callback(err);
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
  // http://stackoverflow.com/questions/32083170/how-to-retrieve-an-arrays-last-object-in-an-embedded-document-in-mongoose

};

