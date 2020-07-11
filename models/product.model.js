'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var productSchema = Schema({
    name: String,
    brand: String,
    description: String,
    quantity: Number,
    price:Number,
    existsOn:[{type: Schema.Types.ObjectId, ref: 'branchOffice'}]
});

module.exports = mongoose.model('product', productSchema);