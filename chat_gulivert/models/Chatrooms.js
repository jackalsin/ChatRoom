/**
 * Created by jacka on 7/13/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
  date: { type: Date, default: Date.now },
  content: { type: String, required: true },
  owner: { type: String, required: true }
});

// create a schema
var chatRoomSchema = new Schema({
  usernames: [{ type: String, required: true, unique: true }],
  messages: [messageSchema]
});

var ChatRooms = mongoose.model('ChatRooms', chatRoomSchema);

module.exports = ChatRooms;