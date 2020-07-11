'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var enterpriseSchema = Schema({
    comertialName: String,
    businessName: String,
    businessCode: Number,
    password: String,
    ceo: String,
    address: String,
    phone: Number,
    activity: String,
    employees: [{
        type: Schema.Types.ObjectId, ref: 'employee'
    }],
    branchOffices: [{
        type: Schema.Types.ObjectId, ref: 'branchOffice'
    }],
    products: [{
        type: Schema.Types.ObjectId, ref: 'product'
    }]
});

module.exports = mongoose.model('enterprise', enterpriseSchema);