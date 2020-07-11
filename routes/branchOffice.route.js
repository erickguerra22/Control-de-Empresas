'use strict'

var express = require('express');
var mdAuth = require('../middlewares/authenticated');
var branchOfficeController = require('../controllers/branchOffice.controller');

var api = express.Router();

api.post('/saveBranchOffice/:idE', mdAuth.ensureAuthEnterprise, branchOfficeController.saveBranchOffice);
api.delete('/deleteBranchOffice/:idE/:id', mdAuth.ensureAuthEnterprise, branchOfficeController.deleteBranchOffice);
api.put('/updateBranchOffice/:idE/:id', mdAuth.ensureAuthEnterprise, branchOfficeController.updateBranchOffice);
api.post('/distributeProduct/:idE/:id', mdAuth.ensureAuthEnterprise, branchOfficeController.distributeProduct);
api.get('/listProducts/:idE/:id',mdAuth.ensureAuthEnterprise, branchOfficeController.listProducts);
api.put('/removeProduct/:idE/:idBO/:id',branchOfficeController.removeProduct);

module.exports = api;