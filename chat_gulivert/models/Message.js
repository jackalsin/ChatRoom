/**
 * Created by jacka on 7/13/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var messageSchema = new Schema({
  date: { type: Date, default: Date.now },
  content: { type: String, required: true },
  owner: { type: String, required: true }
});

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;