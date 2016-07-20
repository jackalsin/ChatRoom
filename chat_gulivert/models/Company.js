/**
 * Created by jacka on 7/19/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema({
    name: {type: String, required: true },
    employees:[String]
}, {
    timestamps:true
});

var companies = mongoose.model('Company', companySchema);

module.exports = companies;