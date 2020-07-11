'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'c1av3_5up3r_53cr3ta_3mpr35a';

exports.createToken = (enterprise)=>{
    var payload = {
        sub:enterprise._id,
        comertialName: enterprise.comertialName,
        businessName: enterprise.businessName,
        businessCode: enterprise.businessCode,
        ceo: enterprise.ceo,
        address: enterprise.address,
        phone: enterprise.phone,
        activity: enterprise.activity,
        iat: moment().unix(),
        exp: moment().add(30, "minutes").unix()
    }
    return jwt.encode(payload,key);
}

