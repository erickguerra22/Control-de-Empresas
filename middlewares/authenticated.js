'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var keyEnt = 'c1av3_5up3r_53cr3ta_3mpr35a';
var keyEmp = 'c1av3_5up3r_53cr3ta_3mp13ad0';

exports.ensureAuthEnterprise = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Petición sin autenticación' });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, keyEnt);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'Token no válido' });
        }

        req.enterprise = payload;
        next();
    }
}

exports.ensureAuthEmp = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Petición sin autenticación' });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, keyEmp);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado' });
            }
        } catch (ex) {
            return res.status(404).send({ messge: 'Token no válido' });
        }

        req.employee = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Petición sin autenticación' });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, keyEmp);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado' });
            } else if (payload.role != 'ADMIN') {
                return res.status(401).send({ message: 'Acceso denegado' })
            }
        } catch (ex) {
            return res.status(404).send({ message: 'Token no válido' });
        }

        req.employee = payload;
        next();
    }
}