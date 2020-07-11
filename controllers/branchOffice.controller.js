'use strict'

var BranchOffice = require('../models/branchOffice.model');
var Enterprise = require('../models/enterprise.model');
var Employee = require('../models/employee.model');
var Product = require('../models/product.model');

function saveBranchOffice(req, res) {
    var enterpriseId = req.params.idE;
    var branchOffice = new BranchOffice();
    var params = req.body;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        if (params.name && params.address && params.phone && params.manager) {
            BranchOffice.findOne({ $or: [{ name: params.address }, { phone: params.phone }] }, (err, exists) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (exists) {
                    res.status(400).send({ message: 'El nombre o número de teléfono ya están en uso.' });
                } else {
                    Enterprise.findById(enterpriseId, (err, finded) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (finded) {
                            Employee.findById(params.manager, (err, finded) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (finded) {
                                    branchOffice.name = params.name;
                                    branchOffice.address = params.address;
                                    branchOffice.phone = params.phone;
                                    branchOffice.manager = params.manager;

                                    branchOffice.save((err, branchOfficeSaved) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor', err });
                                        } else if (branchOfficeSaved) {
                                            Enterprise.findByIdAndUpdate(enterpriseId, { $push: { branchOffices: branchOfficeSaved } }, { new: true }, (err, branchOfficeAdded) => {
                                                if (err) {
                                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                                } else if (branchOfficeAdded) {
                                                    res.send({ 'Sucursal registrada': branchOfficeSaved });
                                                } else {
                                                    res.status(400).send({ message: 'Sucursal no registrada.' });
                                                }
                                            });
                                        } else {
                                            res.status(400).send({ message: 'No se ha podido registrar la sucursal' });
                                        }
                                    })
                                } else {
                                    res.status(404).send({ message: 'El empleado asignado como encargado no existe o no es correcto' });
                                }
                            });
                        } else {
                            res.status(404).send({ message: 'La empresa ingresada no existe o no es correcta' });
                        }
                    });
                }
            });
        } else {
            res.status(202).send({ message: 'Debe ingresar todos los datos requeridos.' });
        }
    }
}

function deleteBranchOffice(req, res) {
    var enterpriseId = req.params.idE;
    var branchOfficeId = req.params.id;

    if (enterpriseId != req.enterprise.sub) {
        res.status(403).send({ message: 'Error de permisos para realizar esta acción' });
    } else {
        Enterprise.findByIdAndUpdate(enterpriseId, { $pull: { branchOffices: branchOfficeId } }, { new: true }, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                BranchOffice.findByIdAndDelete(branchOfficeId, (err, branchOfficeDeleted) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (branchOfficeDeleted) {
                        res.send({ message: 'Registro eliminado exitosamente' });
                    } else {
                        res.status(400).send({ message: 'No ha sido posible eliminar, registro no encontrado.' });
                    }
                });
            } else {
                res.status(404).send({ message: 'No ha sido posible eliminar el registro, empresa no encontrada.' });
            }
        });
    }
}

function updateBranchOffice(req, res) {
    var enterpriseId = req.params.idE;
    var branchOfficeId = req.params.id;
    var actualizar = req.body;

    if (enterpriseId != req.enterprise.sub) {
        res.status(403).send({ message: 'Error de permisos para esta acción' });
    } else {
        Enterprise.findById(enterpriseId, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                BranchOffice.findById(branchOfficeId, (err, finded) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (finded) {
                        if (actualizar.name != finded.name || actualizar.phone != finded.phone) {
                            BranchOffice.findOne({ $or: [{ name: actualizar.name }, { phone: actualizar.phone }] }, (err, finded) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (finded) {
                                    res.status(200).send({ message: 'El nombre o número de teléfono ingresados ya están en uso.' });
                                } else {
                                    BranchOffice.findByIdAndUpdate(branchOfficeId, actualizar, { new: true }, (err, updated) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor', err });
                                        } else if (updated) {
                                            res.send({ 'Registro actualizado': updated });
                                        } else {
                                            res.status(400).send({ message: 'No ha sido posible actualizar el registro.' });
                                        }
                                    });
                                }
                            });
                        } else {
                            BranchOffice.findByIdAndUpdate(branchOfficeId, actualizar, { new: true }, (err, updated) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (updated) {
                                    res.send({ 'Registro actualizado': updated });
                                } else {
                                    res.status(400).send({ message: 'No ha sido posible actualizar el registro.' });
                                }
                            });
                        }
                    } else {
                        res.status(404).send({ message: 'Registro no encontrado' });
                    }
                });
            } else {
                res.status(404).send({ message: 'La empresa ingresada no existe o no es correcta.' });
            }
        });
    }
}

function distributeProduct(req, res) {
    var enterpriseId = req.params.idE;
    var branchOfficeId = req.params.id;
    var params = req.body;
    if (params.product && params.localQuantity) {
        Enterprise.findById(enterpriseId, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {

                BranchOffice.findOne({ _id: branchOfficeId, products: { $elemMatch: { product: params.product } } }, (err, exists) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (exists) {
                        res.status(202).send({ message: 'El producto ingresado ya existe en la sucursal.' });
                    } else {
                        Product.findById(params.product, (err, finded) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (finded && (finded.quantity - params.localQuantity >= 0)) {
                                var newQuantity = finded.quantity - params.localQuantity;
                                Product.findByIdAndUpdate(params.product, { quantity: newQuantity, $push: { existsOn: branchOfficeId } }, { new: true }, (err, added) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Error interno del servidor', err });
                                    } else if (added) {
                                        BranchOffice.findByIdAndUpdate(branchOfficeId, { $push: { products: { product: params.product, localQuantity: params.localQuantity } } }, { new: true }, (err, updated) => {
                                            if (err) {
                                                res.status(500).send({ error: 'Error interno del servidor', err });
                                            } else if (updated) {
                                                res.send({ 'Producto asignado': updated.products });
                                            } else {
                                                res.status(400).send({ message: 'No ha sido posible asignar el producto.' });
                                            }
                                        });
                                    } else {
                                        res.status(400).send({ message: 'Sucursal no registrada.' });
                                    }
                                });
                            } else {
                                res.status(404).send({ message: 'El producto no existe o se encuentra agotado.' });
                            }
                        });
                    }
                });
            } else {
                res.status(404).send({ message: 'La empresa ingresada no existe o no es correcta.' });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' })
    }
}

function removeProduct(req,res){
    var enterpriseId = req.params.idE;
    var branchOfficeId = req.params.idBO;
    var productId = req.params.id;

    Enterprise.findOne({_id:enterpriseId,branchOffices:branchOfficeId},(err,exists)=>{
        if(err){
            res.status(500).send({ error: 'Error interno del servidor', err });
        }else if(exists){
            BranchOffice.findByIdAndUpdate(branchOfficeId,{$pull:{products:{product:productId}}},{new:true},(err,updated)=>{
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (updated) {
                    res.send({'Producto Removido':updated});
                } else {
                    res.status(404).send({ message: 'No ha sido posible remover el registro.' })
                }
            });
        }else{
            res.status(404).send({message:'Sucursal no encontrada.'});
        }
    })
}

function listProducts(req, res) {
    var enterpriseId = req.params.idE;
    var branchOfficeId = req.params.id;

    Enterprise.findById(enterpriseId, (err, finded) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (finded) {
            BranchOffice.findById(branchOfficeId, (err, branchOffice) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (branchOffice) {
                    res.send({ 'Productos en sucursal': branchOffice.products });
                } else {
                    res.status(404).send({ message: 'La empresa no existe o no es correcta.' })
                }
            }).populate({ path: 'products.product', select: 'name brand description' });
        } else {
            res.status(404).send({ message: 'La empresa no existe o no es correcta.' })
        }
    });
}

module.exports = {
    saveBranchOffice,
    deleteBranchOffice,
    updateBranchOffice,
    distributeProduct,
    listProducts,
    removeProduct
}

