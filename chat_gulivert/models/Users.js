/**
 * Created by jacka on 7/13/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  historyRooms: [{ type: Schema.Types.ObjectId, required:true, ref: "ChatRooms" }],
  companies:[{ type: String, required: true }]
});

var Users = mongoose.model('User', userSchema);

module.exports = Users;