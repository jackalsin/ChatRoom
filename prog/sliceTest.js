var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/test';
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    user: {type:String, unique:true},
    scores:[Number]
});
var Users = mongoose.model('User', userSchema);


mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

    Users.create({user: "aa", scores:[1,2,3,4,5,6,7,8,9,10]}, function (err, newUser) {
        Users.find({user: "aa"}).where('scores').slice(-3, 3).exec(function (err, result) {
        // Users.find({user: "aa"}).slice("scores",5).exec(function (err, result) {
            
            if (err) throw err;
            console.log(result);

            console.log("\nSecond Time ");
            Users.findOne({user: "aa"}, "scores -_id", function (err, userFound) {
                if (err) throw err;
                console.log(userFound.scores);
                console.log(userFound.scores.slice(-3, -6));                
                // userFound.scores.slice(5).exec(function (err, result) {
                //     console.log("Slice result = " + result);
                    db.close();                
                // });
                
            });
        });

    
    });
});
