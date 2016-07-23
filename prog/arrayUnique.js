var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/test';
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    user: {type:String, unique:true},
    scores:[{type:Number, }]
});
var Users = mongoose.model('User', userSchema);


mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

    Users.create({user: "aa", scores:[1,2,3,4,5,6,7,8,9,10]}, function (err, newUser) {
        Users.update({user: "aa"}, {$addToSet:{ scores: 11 }}, {new: true},function (err, result) {
            console.log("Uesr's scored updated " + result);
            db.close();
        });
    });
});
