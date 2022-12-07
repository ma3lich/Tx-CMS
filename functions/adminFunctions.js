
const bcrypt = require("bcrypt");
const fs = require("fs");

const { getEnVvalue } = require("../config/config");
const db = require("../config/database");
const MailServer = require("../config/mailservice");

module.exports = {

    // Functions de la partie gestion Utilisateur
    getAllUsers: (callback) => {
        db.query(`SELECT * FROM users ORDER BY id DESC`, function (err, data) {
            if (err) req.flash("error-message", err);
            else
                return callback(data);
        });
    },

    getUserByID: (id, callback) => {
        db.query(`SELECT * FROM users WHERE id = ${id}`, function (err, data) {
            return callback(data[0]);
        })
    },

    updateUserByID: (id, options, callback) => {
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
}