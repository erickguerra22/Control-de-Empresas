'use strict'

var express = require('express');
var mdAuth = require('../middlewares/authenticated');
var employeeController = require('../controllers/employee.controller');

var api = express.Router();

api.post('/saveEmployee/:idE',mdAuth.ensureAuthEnterprise,employeeController.saveEmployee);
api.post('/saveADMIN',employeeController.saveADMIN);
api.delete('/deleteEmployee/:idE/:id',mdAuth.ensureAuthEmp,employeeController.deleteEmployee);
api.delete('/deleteAdmin/:id',mdAuth.ensureAuthAdmin,employeeController.deleteAdmin);
api.put('/updateEmployee/:idE/:id',mdAuth.ensureAuthEmp,employeeController.updateEmployee);
api.post('/searchEmployee/:idE',mdAuth.ensureAuthEnterprise,employeeController.searchEmployee);
api.get('/listEmployees/:idE',mdAuth.ensureAuthEnterprise,employeeController.listEmployees);
api.get('/createExcel/:idE',mdAuth.ensureAuthEnterprise,employeeController.createExcel);
api.post('/login',employeeController.login);

module.exports=api;