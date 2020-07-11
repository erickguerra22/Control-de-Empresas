'use strict'

var mongoose =require('mongoose');
var Schema = mongoose.Schema;
var branchOfficeSchema = Schema({
    name:String,
    address:String,
    phone:String,
    manager:String,
    products:[{
        product: {type:Schema.Types.ObjectId, ref: 'product'},
        localQuantity: Number
    }]
});

module.exports = mongoose.model('branchOffice', branchOfficeSchema);