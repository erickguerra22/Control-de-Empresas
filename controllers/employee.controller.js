'use strict'

var Employee = require('../models/employee.model');
var Enterprise = require('../models/enterprise.model');
var excel = require('mongo-xlsx');
var bcrypt = require('bcrypt-nodejs');
var jwtEmp = require('../services/employee.jwt');

function saveEmployee(req, res) {
    var enterpriseId = req.params.idE;
    var employee = new Employee();
    var params = req.body;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        if (params.username && params.email && params.name && params.lastname && params.password && params.department && params.job) {
            Employee.findOne({ $or: [{ email: params.email }, { username: params.username }] }, (err, finded) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (finded) {
                    res.send({ message: 'El nombre de usuario o correo electrónico ya están en uso.' });
                } else {
                    Enterprise.findById(enterpriseId, (err, finded) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (finded) {
                            employee.name = params.name;
                            employee.lastname = params.lastname;
                            employee.department = params.department;
                            employee.job = params.job;
                            employee.role = 'EMPLOYEE';
                            employee.username = params.username;
                            employee.email = params.email;

                            bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err })
                                } else if (passwordHashed) {
                                    employee.password = passwordHashed;

                                    employee.save((err, employeeSaved) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor.', err });
                                        } else if (employeeSaved) {
                                            Enterprise.findByIdAndUpdate(enterpriseId, { $push: { employees: employeeSaved._id } }, { new: true }, (err, employeeAdded) => {
                                                if (err) {
                                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                                } else if (employeeAdded) {
                                                    res.send({ 'Empleado registrado': employeeSaved });
                                                } else {
                                                    res.status(400).send({ message: 'Empleado no registrado.' });
                                                }
                                            });
                                        } else {
                                            res.status(418).send({ error: 'Empleado no registrado.' });
                                        }
                                    });
                                } else {
                                    res.status(400).send({ message: 'Error al encriptar' });
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

function saveADMIN(req, res) {
    var employee = Employee();
    var params = req.body;

    if (params.name && params.lastname && params.password && params.department && params.job && params.username && params.email) {
        Employee.findOne({ $or: [{ email: params.email }, { username: params.username }] }, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (finded) {
                res.send({ message: 'El nombre de usuario o correo electrónico ya están en uso.' });
            } else {
                employee.name = params.name;
                employee.lastname = params.lastname;
                employee.department = params.department;
                employee.job = params.job;
                employee.role = 'ADMIN';
                employee.username = params.username;
                employee.email = params.email;

                bcrypt.hash(params.password, null, null, (err, passwordHashed) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err })
                    } else if (passwordHashed) {
                        employee.password = passwordHashed;

                        employee.save((err, employeeSaved) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor.', err });
                            } else if (employeeSaved) {
                                res.send({ 'Empleado registrado': employeeSaved });
                            } else {
                                res.status(418).send({ error: 'Empleado no registrado.' });
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'Error al encriptar' });
                    }
                });
            }
        });
    } else {
        res.status(202).send({ message: 'Debe ingresar todos los datos requeridos.' });
    }
}

function deleteEmployee(req, res) {
    var employeeId = req.params.id;
    var enterpriseId = req.params.idE;

    if (req.employee.sub != employeeId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Employee.findByIdAndDelete(employeeId, (err, employeeDeleted) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (employeeDeleted) {
                Enterprise.findByIdAndUpdate({ _id: enterpriseId, employee: employeeId }, { $pull: { employees: employeeId } }, { new: true }, (err, deleted) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor.', err });
                    } else if (deleted) {
                        res.send({ message: 'Registro eliminado exitosamente.' });
                    } else {
                        res.status(400).send({ message: 'Error al eliminar.' });
                    }
                })
            } else {
                res.status(400).send({ message: 'No ha sido posible eliminar el registro.' });
            }
        });
    }
}

function deleteAdmin(req, res) {
    var employeeId = req.params.id;

    if (req.employee.sub != employeeId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Employee.findByIdAndDelete(employeeId, (err, employeeDeleted) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (employeeDeleted) {
                res.send({ message: 'Registro eliminado exitosamente.' });
            } else {
                res.status(400).send({ message: 'No ha sido posible eliminar el registro.' });
            }
        });
    }
}

function updateEmployee(req, res) {
    var enterpriseId = req.params.idE;
    var employeeId = req.params.id;
    var actualizar = req.body;

    if (req.employee.sub != employeeId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        if (actualizar.password) {
            bcrypt.hash(actualizar.password, null, null, (err, passwordHashed) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (passwordHashed) {
                    actualizar.password = passwordHashed;
                } else {
                    res.status(400).send({ message: 'Error al encriptar.' });
                }
            });
        }
        Enterprise.findById(enterpriseId, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (finded) {
                Employee.findById(employeeId, (err, finded) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor.', err });
                    } else if (finded) {
                        if (actualizar.username != finded.username || actualizar.email != finded.email) {
                            Employee.findOne({ $or: [{ username: actualizar.username }, { email: actualizar.email }] }, (err, finded) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (finded) {
                                    res.send({ message: 'El nombre de usuario o el correo ingresado ya están en uso.' });
                                } else {
                                    Employee.findByIdAndUpdate(employeeId, actualizar, { new: true }, (err, employeeUpdated) => {
                                        if (err) {
                                            res.status(500).send({ error: 'Error interno del servidor.', err });
                                        } else if (employeeUpdated) {
                                            res.send({ 'Datos actualizados': employeeUpdated });
                                        } else {
                                            res.status(400).send({ message: 'No ha sido posible actualizar los datos.' })
                                        }
                                    });
                                }
                            });
                        } else {
                            Employee.findByIdAndUpdate(employeeId, actualizar, { new: true }, (err, employeeUpdated) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor.', err });
                                } else if (employeeUpdated) {
                                    res.send({ 'Datos actualizados': employeeUpdated });
                                } else {
                                    res.status(400).send({ message: 'No ha sido posible actualizar los datos.' })
                                }
                            });
                        }
                    } else {
                        res.status(404).send({ message: 'No se ha encontrado el usuario.' });
                    }
                });
            } else {
                res.status(404).send({ message: 'La empresa ingresada no existe o es incorrecta.' })
            }
        });
    }
}

function searchEmployee(req, res) {
    var enterpriseId = req.params.idE;
    var params = req.body;

    Enterprise.findById(enterpriseId, (err, finded) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (finded) {
            if (params.search) {
                finded.find({
                    $or: [
                        { name: { $regex: params.search, $options: 'i' } },
                        { lastname: { $regex: params.search, $options: 'i' } },
                        { job: { $regex: params.search, $options: 'i' } },
                        { department: { $regex: params.search, $options: 'i' } }]
                }, (err, employees) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (employees && employees != '') {
                        res.send({ 'Empleado(s) asignado(s)': employees });
                    } else {
                        res.status(404).send({ message: 'No se han encontrado registros' });
                    }
                });
            } else if (params.id) {
                Employee.find({ _id: params.id }, (err, employees) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor.', err });
                    } else if (employees && employees != '') {
                        res.send({ usuario: employees });
                    } else {
                        res.status(404).send({ message: 'No se han encontrado registros.' });
                    }
                });
            } else {
                res.status(400).send({ message: 'Debe ingresar los parámetros de búsqueda' })
            }
        } else {
            res.status(404).send({ message: 'No se han encontrado registros.' });
        }
    });
}

function listEmployees(req, res) {
    var enterpriseId = req.params.idE;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, employees) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor,err' });
            } else if (employees) {
                res.send({ 'Empleados asignados': employees.employees });
            } else {
                res.status(404).send({ message: 'No hay datos que mostrar' });
            }
        }).populate('employees');
    }
}

function createExcel(req, res) {
    var enterpriseId = req.params.idE;

    if (req.enterprise.sub != enterpriseId) {
        res.status(403).send({ message: 'Error de permisos para esta acción.' });
    } else {
        Enterprise.findById(enterpriseId, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor' });
            } else if (finded && finded != '') {
                var model = excel.buildDynamicModel(finded.employees);

                excel.mongoData2Xlsx(finded.employees, model, (err, saved) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (saved) {
                        res.send({ message: 'Documento creado con éxito.' });
                    } else {
                        res.status(400).send({ message: 'No se ha creado el documento.' });
                    }
                });
            } else {
                res.status(404).send({ message: 'No hay registros.' });
            }
        }).populate('employees');
    }
}

function login(req, res) {
    var params = req.body;

    if (params.username || params.email) {
        if (params.password) {
            Employee.findOne({ $or: [{ username: params.username }, { email: params.email }] }, (err, check) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (check) {
                    bcrypt.compare(params.password, check.password, (err, passwordOk) => {
                        if (err) {
                            res.status(500).send({ error: 'Error al comparar', err });
                        } else if (passwordOk) {
                            if (params.gettoken = true) {
                                res.send({ token: jwtEmp.createToken(check) });
                            } else {
                                res.send({ 'Acceso correcto': check });
                            }
                        } else {
                            res.send({ message: 'Contraseña incorrecta' });
                        }
                    });
                } else {
                    res.send({ message: 'Datos de usuario incorrectos' });
                }
            });
        } else {
            res.send({ message: 'Debes ingresar tu contraseña.' })
        }
    } else {
        res.send({ message: 'Debes ingresar tu correo electrónico o tu username' });
    }
}

module.exports = {
    saveEmployee,
    saveADMIN,
    deleteEmployee,
    deleteAdmin,
    updateEmployee,
    searchEmployee,
    listEmployees,
    createExcel,
    login
}