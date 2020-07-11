'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var key = 'c1av3_5up3r_53cr3ta_3mp13ad0';

exports.createToken = (employee)=>{
    var payload={
        sub:employee._id,
        email: employee.email,
        username: employee.username,
        name: employee.name,
        lastname: employee.lastname,
        department: employee.department,
        job: employee.job,
        role: employee.role,
        iat: moment().unix(),
        exp:moment().add(30,"minutes").unix()
    }
    return jwt.encode(payload,key);
}