'use strict'

var express = require('express');
var mdAuth = require('../middlewares/authenticated');
var enterpriseController = require('../controllers/enterprise.controller');

var api = express.Router();

api.post('/saveEnterprise',mdAuth.ensureAuthAdmin,enterpriseController.saveEnterprise);
api.delete('/deleteEnterprise/:id',mdAuth.ensureAuthEnterprise,enterpriseController.deleteEnterprise);
api.put('/updateEnterprise/:id',mdAuth.ensureAuthEnterprise,enterpriseController.updateEnteprise);
api.get('/countEmployees/:id',mdAuth.ensureAuthEnterprise,enterpriseController.countEmployees);
api.get('/listEnterprises',mdAuth.ensureAuthAdmin,enterpriseController.listEnterprises);
api.get('/createExcel',mdAuth.ensureAuthEnterprise,enterpriseController.createExcel);
api.post('/login',enterpriseController.login);
api.get('/listProducts/:idE',mdAuth.ensureAuthEnterprise, enterpriseController.listProducts);
api.get('/productControl/:idE/:id',mdAuth.ensureAuthEnterprise,enterpriseController.productControl);
api.get('/listBranchOffices/:idE',mdAuth.ensureAuthEnterprise,enterpriseController.listBranchOffices);

module.exports=api;