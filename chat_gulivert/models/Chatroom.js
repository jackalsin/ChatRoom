/**
 * Created by jacka on 7/13/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Message = require('./Message');

// create a schema
var chatRoomSchema = new Schema({
  usernames: [{ type: String, required: true, unique: true }],
  // msgFilePath: String, // if need
  messages: [Message]
});

var ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;