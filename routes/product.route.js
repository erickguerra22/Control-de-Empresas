'use strict'

var express = require('express');
var mdAuth = require('../middlewares/authenticated');
var productController = require('../controllers/product.controller');

var api = express.Router();

api.post('/saveProduct/:idE', mdAuth.ensureAuthEnterprise,productController.saveProduct);
api.delete('/deleteProduct/:idE/:id',mdAuth.ensureAuthEnterprise,productController.deleteProduct);
api.put('/updateProduct/:idE/:id',mdAuth.ensureAuthEnterprise,productController.updateProduct);

module.exports = api;