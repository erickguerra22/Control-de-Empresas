'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var enterpriseRoutes = require('./routes/enterprise.route');
var employeeRoutes = require('./routes/employee.route');
var branchOfficeRoutes = require('./routes/branchOffice.route');
var productRoutes = require('./routes/product.route');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use('/enterprise', enterpriseRoutes);
app.use('/employee', employeeRoutes);
app.use('/branchOffice',branchOfficeRoutes);
app.use('/product',productRoutes);

module.exports = app;