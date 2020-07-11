'use strict'

var Enterprise = require('../models/enterprise.model');
var Employee = require('../models/employee.model');
var BranchOffice = require('../models/branchOffice.model');
var Product = require('../models/product.model');
var excel = require('mongo-xlsx');
var bcrypt = require('bcrypt-nodejs');
var jwtEnt = require('../services/enterprise.jwt');

function businessCode(randomNumber) {
    Enterprise.findOne({ businessCode: randomNumber }, (err, find) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (find) {
            randomNumber = Math.floor(Math.random() * 100000000);
        } else {
            randomNumber = randomNumber;
        }
    });

    return randomNumber;
}

function saveEnterprise(req, res) {
    var enterprise = new Enterprise();
    var params = req.body;

    if (params.businessName && params.activity && params.phone && params.address && params.password && params.ceo) {
        Enterprise.findOne({ $or: [{ businessName: params.businessName }, { phone: params.phone }] }, (err, finded) => {
            if (err) {
                res.status(500).send({ err: 'Error interno del servidor', err });
            } else if (finded) {
                res.send({ message: 'La razón social o el número de teléfono ya está en uso.' });
            } else {
                Employee.findOne({ _id: params.ceo, role: 'ADMIN' }, (err, finded) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (finded) {
                        enterprise.comertialName = params.comertialName;
                        enterprise.ceo = params.ceo;
                        enterprise.address = params.address;
                        enterprise.phone = params.phone;
                        enterprise.activity = params.activity;
                        enterprise.businessName = params.businessName;
                        enterprise.businessCode = businessCode(Math.floor(Math.random() * 100000000));

                        bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor.', err });
                            } if (passwordHashed) {
                                enterprise.password = passwordHashed;

                                enterprise.save((err, enterpriseSaved) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Error interno del servidor.', err });
                                    } else if (enterpriseSaved) {
                                        res.send({ 'Empresa registrada': enterpriseSaved });
                                    } else {
                                        res.status(400).send({ message: 'No ha sido posible registrar la empresa.' });
                                    }
                                });
                            } else {
                                res.status(400).send({ message: 'Error al encriptar' });
                            }
                        });
                    } else {
                        res.status(404).send({ message: 'El usuario ingresado no existe o no cuenta con los permisos requeridos.' });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' });
    }
}

function updateEnteprise(req, res) {
    var enterpriseId = req.params.id;
    var actualizar = req.body;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        if (actualizar.password) {
            bcrypt.hash(actualizar.password, null, null, (err, paswordHashed) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (paswordHashed) {
                    actualizar.password = paswordHashed;
                } else {
                    res.status(400).send({ message: 'Error al encriptar.' });
                }
            });
        }

        Enterprise.findById(enterpriseId, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor.', err });
            } else if (finded) {
                if (actualizar.businessName != finded.businessName) {
                    Enterprise.findOne({ businessName: actualizar.businessName }, (err, finded) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor.', err });
                        } else if (finded) {
                            res.send({ message: 'La razón social ingresada ya está en uso.' });
                        } else if (actualizar.ceo) {
                            Employee.findById(actualizar.ceo, (err, finded) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (finded && finded.role == 'ADMIN') {
                                    Enterprise.findByIdAndUpdate(enterpriseId, actualizar, { new: true }, (err, enterpriseUpdated) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor.', err });
                                        } else if (enterpriseUpdated) {
                                            res.send({ 'Datos actualizados': enterpriseUpdated });
                                        } else {
                                            res.status(400).send({ message: 'No ha sido posible actualizar los datos.' })
                                        }
                                    });
                                } else {
                                    res.status(400).send({ message: 'El empleado ingresado no tiene los permisos requeridos.' })
                                }
                            });
                        } else {
                            Enterprise.findByIdAndUpdate(enterpriseId, actualizar, { new: true }, (err, enterpriseUpdated) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor.', err });
                                } else if (enterpriseUpdated) {
                                    res.send({ 'Datos actualizados': enterpriseUpdated });
                                } else {
                                    res.status(400).send({ message: 'No ha sido posible actualizar los datos.' })
                                }
                            });
                        }
                    });
                } else {
                    Enterprise.findByIdAndUpdate(enterpriseId, actualizar, (err, enterpriseUpdated) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor.', err });
                        } else if (enterpriseUpdated) {
                            res.send({ 'Datos actualizados': enterpriseUpdated });
                        } else {
                            res.status(400).send({ message: 'No ha sido posible actualizar los datos.' })
                        }
                    });
                }
            } else {
                res.status(404).send({ message: 'No se ha encontrado el usuario.' });
            }
        });
    }
}

function deleteEnterprise(req, res){
    var enterpriseId = req.params.id;
    
    if(enterpriseId != req.enterprise.sub){
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    }else{
        Enterprise.findByIdAndDelete(enterpriseId, (err, deleted)=>{
            if(err){
                res.status(500).send({ error: 'Error interno del servidor.', err });
            }else if(deleted){
                if(deleted.employees.length  > 0){
                    Employee.deleteMany({_id: deleted.employees}, (err, deletedEmp)=>{
                        if(err){
                            res.status(500).send({ error: 'Error interno del servidor.', err });
                        }else if(deletedEmp){
                            if(deleted.branchOffices.length > 0){
                                BranchOffice.deleteMany({_id:deleted.branchOffices}, (err, deletedBO) =>{
                                    if(err){
                                        res.status(500).send({ error: 'Error interno del servidor.', err });
                                    }else if(deletedBO){
                                        if(deleted.products.length > 0){
                                            Product.deleteMany({_id:deleted.products}, (err, deletedProd) =>{
                                                if(err){
                                                    res.status(500).send({ error: 'Error interno del servidor.', err });
                                                }else if(deletedProd){
                                                    res.send({message:'Registros eliminados'});
                                                }else{
                                                    res.status(404).send({message: 'Sin productos asignados'});
                                                }
                                            });
                                        }else{
                                            res.send({message:'Registros eliminados'});
                                        }
                                    }else{
                                        res.status(404).send({message: 'Sin sucursales asignadas'});
                                    }
                                });
                            }else{
                                res.send({message:'Registros eliminados'});
                            }
                        }else{
                            res.status(404).send({message: 'Sin empleados asignados'});
                        }
                    });
                }else{
                    res.send({message:'Registros eliminados'});
                }
            }else{
                res.status(404).send({message: 'No se encontraron registros.'})
            }
        });
    }
}

//administrar empleados por empresa
function countEmployees(req, res) {
    var enterpriseId = req.params.id;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor.', err });
            } else if (finded) {
                res.send({ 'Empleados registrados': finded.employees.length });
            } else {
                res.status(404).send({ message: 'No se han encontrado registros.' })
            }
        });
    }
}



function listEnterprises(req, res) {
    Enterprise.find({}, (err, enterprises) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (enterprises != '') {
            res.send({ enterprises: enterprises });
        } else {
            res.status(404).send({ message: 'Sin datos para mostrar' });
        }
    });
}

function createExcel(req, res) {

    Enterprise.find({}, (err, enterprises) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (enterprises) {
            var model = excel.buildDynamicModel(enterprises);

            excel.mongoData2Xlsx(enterprises, model, (err, saved) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (saved) {
                    res.send({ message: 'Documento creado con éxito.' });
                } else {
                    res.status(400).send({ message: 'No se ha creado el documento.' });
                }
            });
        } else {
            res.status(404).send({ message: 'No hay registros.' })
        }
    });
}

function login(req, res) {
    var params = req.body;

    if (params.businessCode || params.email) {
        if (params.password) {
            Enterprise.findOne({ businessCode: params.businessCode }, (err, check) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (check) {
                    bcrypt.compare(params.password, check.password, (err, passwordOk) => {
                        if (err) {
                            res.status(500).send({ error: 'Error al comparar', err });
                        } else if (passwordOk) {
                            if (params.gettoken = true) {
                                res.send({ token: jwtEnt.createToken(check) });
                            } else {
                                res.send({ 'Acceso correcto': check });
                            }
                        } else {
                            res.send({ message: 'Contraseña incorrecta' });
                        }
                    });
                } else {
                    res.send({ message: 'Datos de ingreso incorrectos' });
                }
            });
        } else {
            res.send({ message: 'Debes ingresar tu contraseña.' })
        }
    } else {
        res.send({ message: 'Debe ingresar el código de la empresa o correo electronico' });
    }
}

function listProducts(req, res) {
    var enterpriseId = req.params.idE;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (finded) {
                res.send({ 'Productos en stock': finded.products });
            } else {
                res.status(404).send({ message: 'La empresa no existe o no es correcta.' })
            }
        }).populate('products');
    }
}

function productControl(req, res) {
    var enterpriseId = req.params.idE;
    var productId = req.params.id

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                Product.findById(productId, (err, finded) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (finded) {
                        res.send({ 'Cantidad en stock': finded.quantity, 'Cantidad de productos por sucursal': finded.existsOn });
                    } else {
                        res.status(404).send({ message: 'La empresa no existe o no es correcta.' })
                    }
                }).populate('existsOn', 'name products.localQuantity');
            } else {
                res.status(404).send({ message: 'La empresa no existe o no es correcta.' })
            }
        });
    }
}

function listBranchOffices(req, res) {
    var enterpriseId = req.params.idE;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                res.send({ 'Sucursales de empresa': exists.branchOffices });
            } else {
                res.status(404).send({ message: 'No hay datos para mostrar.' });
            }
        }).populate('branchOffices');
    }
}

module.exports = {
    saveEnterprise,
    deleteEnterprise,
    updateEnteprise,
    countEmployees,
    listEnterprises,
    createExcel,
    login,
    listProducts,
    productControl,
    listBranchOffices
}