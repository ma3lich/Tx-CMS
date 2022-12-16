
const bcrypt = require("bcrypt");
const fs = require("fs");

const { getEnVvalue } = require("../config/config");
const db = require("../config/database");
const MailServer = require("../config/mailservice");

module.exports = {

    // Functions de la partie gestion Utilisateur
    getAllUsers: (callback) => {
        db.query(`SELECT * FROM users ORDER BY id DESC`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            }
            else return callback(data);
        });
    },

    getUserByID: (id, callback) => {
        db.query(`SELECT * FROM users WHERE id = ${id}`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            }
            else return callback(data[0]);
        })
    },

    editUserByID: (options, callback) => {
        if (options.password) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(options.password, salt, function (err, hash) {
                    db.query(
                        `UPDATE users SET name = '${options.name}', lastname = '${options.lastname}', password = '${hash}', sex = '${options.sex}', birthday = '${options.birthday}' , logo = '${options.logo}', role = '${options.role}', wallet = '${options.wallet}' WHERE id = ${options.id}`,
                        function (err, success) {
                            if (err) {
                                return callback({
                                    type: 'error',
                                    message: "L'utilisateur n'a pas été mis à jour",
                                });
                            } else {
                                return callback({
                                    type: 'success',
                                    message: "L'utilisateur a été mis à jour"
                                });
                            }
                        }
                    );
                });
            });
        } else {
            db.query(
                `UPDATE users SET name = '${options.name}', lastname = '${options.lastname}', sex = '${options.sex}', birthday = '${options.birthday}' , logo = '${options.logo}', role = '${options.role}', wallet = '${options.wallet}' WHERE id = ${options.id}`,
                function (err, success) {
                    if (err) {
                        return callback({
                            type: 'error',
                            message: "L'utilisateur n'a pas été mis à jour !"
                        });
                    }
                    if (success) {
                        return callback({
                            type: 'success',
                            message: "L'utilisateur a été mis à jour !"
                        });
                    }
                }
            );
        }
    },

    createNewUser: (options, callback) => {
        db.query(
            `SELECT * FROM users WHERE email = "${options.email}"`,
            function (err, data) {
                if (data.length > 0) {
                    return callback({
                        type: 'error',
                        message: "Un utilisateur utilisant cette email existe déja !"
                    });
                } else {
                    bcrypt.hash(options.password, 10, (err, hash) => {
                        db.query(
                            `INSERT INTO users ( name, lastname, email, password, sex, birthday, role, wallet, logo) VALUES ('${options.name}', '${options.lastname}', '${options.email}', '${hash}', '${options.sex}', '${options.birthday}', '${options.role}', '${options.wallet}', '${options.logo}' )`,
                            function (err, success) {
                                if (err) {
                                    return callback({
                                        type: 'error',
                                        message: "L'utilisateur n'a pas été crée !"
                                    });
                                }
                                if (success) {
                                    return callback({
                                        type: 'success',
                                        message: "L'utilisateur a été crée !"
                                    });
                                }
                            }
                        );
                    });
                }
            }
        );
    },

    deleteUserByID: (id, callback) => {
        db.query(`DELETE FROM users WHERE id = ${id}`, function (err, success) {
            if (err) {
                return callback({
                    type: 'error',
                    message: "L'utilisateur n'a pas été suprimé !"
                });
            }
            if (success) {
                return callback({
                    type: 'success',
                    message: "L'utilisateur a été suprimé !"
                });
            }
        });
    },

    sendEmailToUser: (to, subject, text, html, callback) => {
        let options = {
            from: `"${getEnVvalue('HOST_NAME')}" <${getEnVvalue('MAIL_USERNAME')}>`,
            to: to,
            subject: subject,
            text,
            html,
        }

        MailServer.sendMail(options, function (err, response) {
            if (err) {
                console.log(err);
                return callback({
                    type: 'error',
                    message: "E-mail n'a pas été envoyé !",
                });
            } else {
                console.log(response);
                return callback({
                    type: 'success',
                    message: "E-mail a été envoyé !",
                });
            }
        });
    },

    // Routes de la partie gestion offres


    getAllPlans: (callback) => {
        let plans = []
        db.query(`SELECT * FROM plans`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            } else {
                data.forEach((plan) => {
                    db.query(
                        `SELECT * FROM categories WHERE id = ${plan.category}`,
                        function (err, result) {
                            result.forEach((category) => {
                                plans.push({
                                    id: plan.id,
                                    name: plan.name,
                                    category: category.name,
                                    server: category.server,
                                    price: plan.price,
                                    stock: plan.stock,
                                });
                            });
                        }
                    );
                });
                return callback(plans)
            }
        });
    },

    createNewPlan: (options, callback) => {
        db.query(
            `INSERT INTO plans ( name, category, price, stock, state) VALUES ('${options.name}', '${options.category}', '${options.price}', '${options.stock}', '${options.state}')`,
            function (err, success) {
                if (err) {
                    return callback({
                        type: 'error',
                        message: "L'offre n'a pas été crée !"
                    });
                }
                if (success) {
                    return callback({
                        type: 'success',
                        message: "L'offre a été crée !"
                    });
                }
            }
        );
    },

    getPlanByID: (id, callback) => {
        db.query(
            `SELECT * FROM plans WHERE id = ${id}`, function (err, data) {
                if (err) {
                    return callback({
                        type: 'error',
                        message: err,
                    });
                } else {
                    return callback(data[0])
                }
            })
    },

    editPlanByID: (options, callback) => {
        db.query(
            `UPDATE plans SET name = '${options.name}', price = '${options.price}', stock = '${options.stock}', state = '${options.state}' WHERE id = ${options.id}`,
            function (err, success) {
                if (err) {
                    console.log(err);
                    return callback({
                        type: 'error',
                        message: "L'offre n'a pas été mis à jour !"
                    });
                }
                if (success) {
                    return callback({
                        type: 'success',
                        message: "L'offre a été mis à jour !"
                    });
                }
            }
        );
    },

    deletePlanByID: (id, callback) => {
        db.query(`DELETE FROM plans WHERE id = ${id}`, function (err, success) {
            if (err) {
                return callback({
                    type: 'error',
                    message: "L'offre n'a pas été suprimé !"
                });
            }
            if (success) {
                return callback({
                    type: 'success',
                    message: "L'offre a été suprimé !"
                });
            }
        });
    },

    updateConfigPlanByID: (options, callback) => {
        db.query(
            `UPDATE plans SET node = '${options.node}', egg = '${options.egg}', allowed_cpu = '${options.allowed_cpu}', allowed_ram = '${options.allowed_ram}', allowed_disk = '${options.allowed_disk}', allowed_swap = '${options.allowed_swap}', allowed_db = '${options.allowed_db}', allowed_backups = '${options.allowed_backups}' WHERE id = ${options.id}`,
            function (err, success) {
                if (err) {
                    console.log(err);
                    return callback({
                        type: 'error',
                        message: "La configuration n'a pas été mis à jour !"
                    });
                }
                if (success) {
                    return callback({
                        type: 'success',
                        message: "La configuration a été mis à jour !"
                    });
                }
            }
        );
    },



    // Routes de la partie gestion catégories

    getAllCategories: (callback) => {
        db.query(`SELECT * FROM categories ORDER BY id`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            } else {
                return callback(data)
            }
        })
    },

    getCategoryByID: (id, callback) => {
        db.query(`SELECT * FROM categories WHERE id = ${id}`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            } else {
                return callback(data[0])
            }
        })
    },

    createNewCategory: (options, callback) => {
        db.query(
            `INSERT INTO categories (name, server, auto) VALUES ('${options.name}', '${options.server}', '${options.auto}')`,
            function (err, success) {
                if (err) {
                    return callback({
                        type: 'error',
                        message: "La catégorie n'a pas été crée !"
                    });
                }
                if (success) {
                    return callback({
                        type: 'success',
                        message: "La catégorie a été crée !"
                    });
                }
            }
        );
    },

    updateCategoryByID: (options, callback) => {
        db.query(
            `UPDATE categories SET name = '${options.name}', auto = '${options.auto}' WHERE id = ${options.id}`,
            function (err, success) {
                if (err) {
                    console.log(err);
                    return callback({
                        type: 'error',
                        message: "La catégorie n'a pas été mis à jour !"
                    });
                }
                if (success) {
                    return callback({
                        type: 'success',
                        message: "La catégorie a été mis à jour !"
                    });
                }
            }
        );
    },

    deleteCategoryByID: (id, callback) => {
        db.query(`DELETE FROM categories WHERE id = ${id}`, function (err, success) {
            if (err) {
                return callback({
                    type: 'error',
                    message: "La catégorie n'a pas été suprimé !"
                });
            }
            if (success) {
                return callback({
                    type: 'success',
                    message: "La catégorie a été suprimé !"
                });
            }
        });
    },


    // Routes de la partie gestion servers

    getAllServers: (callback) => {
        db.query(`SELECT * FROM servers ORDER BY id`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            } else {
                return callback(data)
            }
        })
    },


    getServerById: (id, callback) => {
        db.query(`SELECT * FROM servers WHERE id = ${id}`, function (err, data) {
            if (err) {
                return callback({
                    type: 'error',
                    message: err,
                });
            } else {
                return callback(data[0])
            }
        })
    },


}