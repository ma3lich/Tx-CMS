/* Importation des modules nodeJS */
const bcrypt = require('bcrypt');
const config = require('config');
const db = require('../config/database');
const nodemailer = require('nodemailer')
const mailserver = require('../config/mail');
const app = require('../config/app.json');
const package_json = require('../package.json');

module.exports = {
    /* Méthode Get pour la page admin/index */
    index: (req , res) => {
        db.query('SELECT COUNT(*) AS userCount FROM users',(err, data) => {
            res.render('admin/index',{title:app.config.company.name + ' - Espace Admin', action:'info', userCount:JSON.parse(JSON.stringify(data))[0].userCount, user:req.user[0],app:app, system:package_json});
        })
    },

    /* Méthode Get pour la page admin/users/ */
    getUsers: (req, res) => {
        db.query(`SELECT * FROM users ORDER BY id DESC`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/users/index',{title:app.config.company.name + ' - Liste des utilisateurs', action:'list', users:data, user:req.user[0], app:app, system:package_json});
        })

    },

    /* Méthode Get pour la page admin/users/edit */
    editUser: (req,res) => {
        const id = req.params.id;

        db.query(`SELECT * FROM users WHERE id = ${id}`, function(err, data){
            if(err) throw err
            else{
                res.render('admin/users/edit',{title:"TxCMS - Gestion d'utilisateur", action:'edit', user:JSON.parse(JSON.stringify(data))[0]});
                console.log(JSON.parse(JSON.stringify(data))[0])
            }
        })
    },

    /* Méthode Post pour la page admin/users/edit */
    submitEditedUser: (req, res) => {
        const id = req.body.id;

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                db.query(`UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', password = '${hash}', sexe = '${req.body.sexe}', birthday = '${req.body.birthday}' , logo = '${req.body.logo}', role = '${req.body.role}', wallet = '${req.body.wallet}' WHERE id = ${id}`, function(success, err){
                    if (err){
                        req.flash('error-message', err)
                        res.redirect('/admin/users')
                    }else{
                        req.flash('success-message', 'Offre Créé !'),
                        res.redirect('/admin/users')
                    }
                })
            });
        });  
    },

    /* Méthode Get pour la page admin/users/create */
    createUser: (req, res) => {
        res.render('admin/users/create')
    },

    /* Méthode Post pour la page admin/users/create */
    submitCreatedUser: (req, res) => {
        db.query(`SELECT * FROM users WHERE email = ${req.body.email}`, function(err, data){
            if(data){
                req.flash('error-message', 'Email déja utiliser')
                res.redirect('/admin/users')
            }else{
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        db.query(`INSERT INTO users ( name, lastname, email, password, sexe, birthday, role, wallet, logo) VALUES ('${req.body.name}', '${req.body.lastname}', '${req.body.email}', '${hash}', '${req.body.sexe}', '${req.body.birthday}', '${req.body.role}', '${req.body.wallet}', '${req.body.logo}' )`, function(success, err){
                            req.flash('success-message', 'Utilisateur Créé !'),
                            res.redirect('/admin/users')
                        }) 
                    })
                })
            }
        })  
    },

    /* Méthode Post pour la page admin/users/mail/ */

    mailUser:(req, res) => {
        const email = req.params.email;

        db.query(`SELECT * FROM users WHERE email = "${email}"`, function(err, data){
            if(err) throw err
            else res.render('admin/users/mail',{title:"TxCMS - Gestion d'utilisateur", action:'edit', user:JSON.parse(JSON.stringify(data))[0]});
        })
    },

    SendMailUser: async (req, res) => {
        if(req.body.template == "none"){
            const title = config.get("TxCMS.company.name")
            const from = config.get("TxCMS.mail.auth.user")
            const email = req.params.email;
            const subject = req.body.subject
            const message = req.body.message
            console.log(email + " " + subject + " " + message)
            
            let info = await mailserver.sendMail({
                from: `"${title}" ${from}`,
                to: email,
                subject: subject,
                text: message, 
              });
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            res.redirect('/admin/users');
        }
        
    },


    /* Méthode Post pour la page admin/users/delete */
    deleteUser:(req, res) => {
        const id = req.params.id;

        db.query(`DELETE FROM users WHERE id = ${id}`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/users')
            }else{
                res.redirect('/admin/users'),
                req.flash('success-message', 'Offre Suprimé !')
            }
        })
     },

    /* Méthode Get pour la page admin/plans */
    getPlans: (req, res) => {
        db.query(`SELECT * FROM plans ORDER BY id DESC`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/plans/index',{title:app.config.company.name + ' Plans Liste', action:'list', plans:data, user:req.user[0], app:app, system:package_json});
        })
    },

    /* Méthode Get pour la page admin/plans/create */
    createPlan: (req, res) => {
        db.query(`SELECT * FROM categories ORDER BY id`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/plans/create',{title:app.config.company.name + ' - Créé une offre', action:'list', categorie:data});
        })
    },

    /* Méthode Post pour la page admin/plans/create */
    submitCreatedPlan: (req, res) => {
        console.log(req.body)
        db.query(`INSERT INTO plans ( name, categorie, price, stock, state) VALUES ('${req.body.name}', '${req.body.categorie}', '${req.body.price}', '${req.body.stock}', '${req.body.state}')`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/plans')
            }else{
                req.flash('success-message', 'Offre Créé !'),
                res.redirect('/admin/plans')
            }
        })
    },

    /* Méthode Get pour la page admin/plans/edit/id */
    editPlan: (req,res) => {
        const id = req.params.id;

        db.query(`SELECT * FROM plans WHERE id = ${id}`, function(err, data){
            if(err) throw err
            else{
                db.query(`SELECT * FROM categories ORDER BY id`, function(err, results){
                    if(err){
                        req.flash('error-message', err)
                    }else{
                        res.render('admin/plans/edit',{title:app.config.company.name + ' Plans Edit', action:'edit', plan:JSON.parse(JSON.stringify(data))[0], categorie: results});
                    }
                })
            }
        })
    },

    /* Méthode Post pour la page admin/plans/edit/id */
    submitEditedPlan: (req, res) => {
        const id = req.body.id;

        db.query(`UPDATE plans SET name = '${req.body.name}', price = '${req.body.price}', stock = '${req.body.stock}', state = '${req.body.state}' WHERE id = ${id}`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/plans')
            }else{
                req.flash('success-message', 'Offre Créé !'),
                res.redirect('/admin/plans')
            }
        }) 
    },

    /* Méthode Post pour la page admin/plans/ */
    deletePlan:(req, res) => {
        const id = req.params.id;
        db.query(`DELETE FROM plans WHERE id = ${id}`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/plans')
            }else{
                res.redirect('/admin/plans'),
                req.flash('success-message', 'Offre Suprimé !')
            }
        })
        
    },

    /* Méthode Get pour la page admin/categories */
    getCategories: (req, res) => {
        db.query(`SELECT * FROM categories ORDER BY id`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/categories/index',{title:app.config.company.name + ' - Catégories', action:'list', categorie:data, user:req.user[0], app:app, system:package_json});
        })
    },

    /* Méthode Get pour la page admin/categories/create */
    createCategorie: (req, res) => {
        db.query(`SELECT * FROM servers ORDER BY id`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/categories/create',{title:app.config.company.name + ' - Créé une offre', action:'list', server:data});
        })
    },

    /* Méthode Post pour la page admin/categories/create */
    submitCreatedCategorie: (req, res) => {
        console.log(req.body)
        db.query(`INSERT INTO categories ( name, server, auto) VALUES ('${req.body.name}', '${req.body.server}', '${req.body.auto}')`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/categories')
            }else{
                req.flash('success-message', 'Offre Créé !'),
                res.redirect('/admin/categories')
            }
        })
    },    

    /* Méthode Get pour la page admin/categories/edit */
    editCategorie: (req,res) => {
        const id = req.params.id;

        db.query(`SELECT * FROM categories WHERE id = ${id}`, function(err, data){
            if(err) throw err
            else{
                db.query(`SELECT * FROM servers ORDER BY id`, function(err, results){
                    if(err) req.flash('error-message', err)
                    else{
                        res.render('admin/categories/edit',{title:app.config.company.name + ' Plans Edit', action:'edit', server:results ,categorie:JSON.parse(JSON.stringify(data))[0] });
                        console.log(JSON.parse(JSON.stringify(data))[0])
                    }
                })
            }
        })
    },

    /* Méthode Post pour la page admin/categories/edit */
    submitEditedCategorie: (req, res) => {
        const id = req.body.id;

        db.query(`UPDATE categories SET name = '${req.body.name}', auto = '${req.body.auto}' WHERE id = ${id}`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/categories')
            }else{
                req.flash('success-message', 'Catégorie mise a jour !'),
                res.redirect('/admin/categories')
                console.log(success)
            }
        })
    },

    /* Méthode Post pour la page admin/categories/ */
    deleteCategorie:(req, res) => {
        const id = req.params.id;

        db.query(`DELETE FROM categories WHERE id = ${id}`, function(success, err){
            if (err){
                req.flash('error-message', err)
                res.redirect('/admin/categories')
            }else{
                res.redirect('/admin/categories'),
                req.flash('success-message', 'categories Suprimé !')
            }
        })
    },

    /* Méthode Get pour la page admin/servers/ */
    getServers: (req, res) => {
        db.query(`SELECT * FROM servers ORDER BY id`, function(err, data){
            if(err) req.flash('error-message', err)
            else res.render('admin/servers/index',{title:app.config.company.name + ' - Serveurs', action:'list', server:data, user:req.user[0], app:app, system:package_json});
        })
    },

    getSettings: (req, res) => {
        const app = require('../config/app.json');;
        res.render('admin/settings/index',{title:app.config.company.name + ' - Paramètres', action:'config', user:req.user[0], app:app, system:package_json});
    },

    postSettings: (req, res) => {
        const fs = require("fs");
        let {hostname, port, license, name, description, adresse, domaine, logo, mentions, privacy} = req.body;
        var app = {
            config: {
                system: {
                    hostname: hostname,
                    port: parseInt(port, 10),
                    license : license
                },

                company: {
                    name: name,
                    description: description,
                    adresse: adresse,
                    domaine: domaine,
                    logo: logo,
        
                    legale: {
                        mentions : mentions,
                        privacy: privacy
                    }
                }
            }
        }
        const jsonString = JSON.stringify(app)

        fs.writeFile('./config/app.json', jsonString, err => {
            if (err) console.log('Error writing file', err)
            else console.log('Successfully wrote file')
        })

        res.redirect('/admin/settings');
    },

    getDBSettings: (req, res) => {
        const database = require('../config/database.json');;
        res.render('admin/settings/database',{title:app.config.company.name + ' - Paramètres de la base de données', action:'config',database:database});
    },

    postDBSettings: (req, res) => {
        const fs = require("fs");
        let {hostname, username, password, dbname} = req.body;
        var database = {
            config: {
                host: hostname,
                port: 2004,
                user: username,
                password: password,
                dbname: dbname
            }
        }
        const jsonString = JSON.stringify(database)

        fs.writeFile('./config/database.json', jsonString, err => {
            if (err) console.log('Error writing file', err)
            else console.log('Successfully wrote file')
        })
        res.redirect('/admin/settings');
    },

    getMailSettings: (req, res) => {
        const smtp = require('../config/smtp.json');;
        res.render('admin/settings/e-mail',{title:app.config.company.name + ' - Paramètres du serveur mail', action:'config',smtp:smtp});
    },

    postMailSettings: (req, res) => {
        const fs = require("fs");
        let {hostname, port, encryption, username, password} = req.body;
        var smtp = {
            config: {
                host:  hostname,
                port:  parseInt(port, 10),
                secure:  JSON.parse(encryption.toLowerCase()),
                auth: {
                  user: username,
                  pass: password
                }
            }
        }
        const jsonString = JSON.stringify(smtp)

        fs.writeFile('./config/smtp.json', jsonString, err => {
            if (err) console.log('Error writing file', err)
            else console.log('Successfully wrote file')
        })
        res.redirect('/admin/settings');
    },

    getPaymentsSettings: (req, res) => {
        const paymentsGateways = require('../config/payments-gateways.json');
        res.render('admin/settings/payments-gateways',{title:app.config.company.name + ' - Paramètres du serveur mail', action:'config',paymentsGateways:paymentsGateways});
    },

    postPaymentsSettings: (req, res) => {
        const fs = require("fs");

        var PaypalEnabled = false
        PaypalEnabled = (req.body.PaypalEnabled == "on" ? true : false)
        PaypalEnabled = (req.body.PaypalEnabled == "on" ? true : false)

        var paymentsGateways = {
            config: {
                paypal: {
                    enabled : PaypalEnabled,
                    publicKey : req.body.PaypalPublicKey,
                    secretKey : req.body.PaypalSecretKey
                },

                stripe: {
                    enabled : StripeEnabled,
                    publicKey : req.body.StripePublicKey,
                    secretKey : req.body.StripeSecretKey
                }
            }
        }
        const jsonString = JSON.stringify(paymentsGateways)

        fs.writeFile('./config/payments-gateways.json', jsonString, err => {
            if (err) console.log('Error writing file', err)
            else console.log('Successfully wrote file')
        })
        res.redirect('/admin/settings');
    }
}