'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var employeeSchema = Schema({
    email: String,
    username: String,
    password: String,
    name: String,
    lastname: String,
    department: String,
    job: String,
    role:String
});

module.exports = mongoose.model('employee', employeeSchema);