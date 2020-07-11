'use strict'

var Product = require('../models/product.model');
var Enterprise = require('../models/enterprise.model');
var BranchOffice = require('../models/branchOffice.model');

function saveProduct(req, res) {
    var enterpriseId = req.params.idE;
    var product = new Product();
    var params = req.body;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        if (params.name && params.brand && params.description && params.quantity && params.price) {
            Product.findOne({ name: params.name, brand: params.brand }, (err, finded) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (finded) {
                    res.send({ message: 'El producto de esta marca ya está registrado.' });
                } else {
                    Enterprise.findById(enterpriseId, (err, finded) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (finded) {
                            product.name = params.name;
                            product.brand = params.brand;
                            product.description = params.description;
                            product.quantity = params.quantity;
                            product.price = params.price;

                            product.save((err, productSaved) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor.', err });
                                } else if (productSaved) {
                                    Enterprise.findByIdAndUpdate(enterpriseId, { $push: { products: productSaved._id } }, { new: true }, (err, productAdded) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor', err });
                                        } else if (productAdded) {
                                            res.send({ 'Producto registrado': productSaved });
                                        } else {
                                            res.status(400).send({ message: 'Producto no registrado.' });
                                        }
                                    });
                                } else {
                                    res.status(418).send({ error: 'Producto no registrado.' });
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

function deleteProduct(req, res) {
    var enterpriseId = req.params.idE;
    var productId = req.params.id;

    if (enterpriseId != req.enterprise.sub) {
        res.status(403).send({ message: 'Error de permisos para realizar esta acción' });
    } else {
        Enterprise.findByIdAndUpdate(enterpriseId, { $pull: { products: productId } }, { new: true }, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                Product.findByIdAndDelete(productId, (err, productDeleted) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (productDeleted) {

                        if (productDeleted.existsOn != 0) {
                            var arreglo = productDeleted.existsOn.length;
                            for (var i = 0; i < arreglo; i++) {
                                var branchOffice = productDeleted.existsOn[i];
                                BranchOffice.findByIdAndUpdate(branchOffice, { $pull: { products: { product: productId } } }, { new: true }, (err, deleted) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Error interno del servidor', err });
                                    } else if (deleted && i == arreglo) {
                                        res.send({ message: 'Registros Eliminados' });
                                    } else {
                                        res.status(400).send({ message: 'Error al intentar eliminar' })
                                    }
                                });
                            }
                        }
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

function updateProduct(req, res) {
    var enterpriseId = req.params.idE;
    var productId = req.params.id;
    var actualizar = req.body;

    if (enterpriseId != req.enterprise.sub) {
        res.status(403).send({ message: 'Error de permisos para esta acción' });
    } else {
        Enterprise.findById(enterpriseId, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                Product.findById(productId, (err, finded) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (finded) {
                        if (actualizar.name != finded.name || actualizar.brand != finded.brand) {
                            Product.findOne({ name: actualizar.name, brand: actualizar.brand }, (err, finded) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (finded) {
                                    res.status(202).send({ message: 'El producto de esta marca ya está registrado.' });
                                } else {
                                    Product.findByIdAndUpdate(productId, actualizar, { new: true }, (err, updated) => {
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
                            Product.findByIdAndUpdate(productId, actualizar, { new: true }, (err, updated) => {
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

function searchProduct(req, res) {

}

module.exports = {
    saveProduct,
    deleteProduct,
    updateProduct
}