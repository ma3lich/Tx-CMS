/* Importation des modules nodeJS */
const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const package_json = require("../package.json");
const {
  sendMail,
  getHostStats,
  getPterodactylEggs,
  getPterodactylNodes,
} = require("../config/customFunction");
const { Login } = require("../templates/emails/templates_emails");
const { pterodactylApp, pterodactylClient } = require("../private/servers");
const Nodeactyl = require("nodeactyl");
const application = new Nodeactyl.NodeactylApplication(
  "https://panel.txhost.fr",
  "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
);

module.exports = {
  /* Méthode Get pour la page admin/index */
  index: (req, res) => {
    getHostStats(function (hostStats) {
      res.render("admin/index", {
        title: app.config.company.name + " - Espace Admin",
        action: "info",
        hostStats,
        app: app,
        system: package_json,
        user: req.user[0],
      });
    });
  },

  /* Méthode Get pour la page admin/users/ */
  getUsers: (req, res) => {
    db.query(`SELECT * FROM users ORDER BY id DESC`, function (err, data) {
      if (err) req.flash("error-message", err);
      else
        res.render("admin/users/index", {
          title: app.config.company.name + " - Liste des utilisateurs",
          action: "list",
          users: data,
          user: req.user[0],
          app: app,
          system: package_json,
        });
    });
  },

  /* Méthode Get pour la page admin/users/edit */
  editUser: (req, res) => {
    const id = req.params.id;

    db.query(`SELECT * FROM users WHERE id = ${id}`, function (err, data) {
      if (err) throw err;
      else {
        res.render("admin/users/edit", {
          title: app.config.company.name + " - Gestion d'utilisateur",
          action: "edit",
          app: app,
          user: JSON.parse(JSON.stringify(data))[0],
        });
      }
    });
  },

  /* Méthode Post pour la page admin/users/edit */
  submitEditedUser: (req, res) => {
    const id = req.body.id;
    if (req.body.password) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.password, salt, function (err, hash) {
          db.query(
            `UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', password = '${hash}', sex = '${req.body.sex}', birthday = '${req.body.birthday}' , logo = '${req.body.logo}', role = '${req.body.role}', wallet = '${req.body.wallet}' WHERE id = ${id}`,
            function (success, err) {
              if (err) {
                req.flash("error-message", err);
                res.redirect("/admin/users");
              } else {
                req.flash("success-message", "Offre Créé !"),
                  res.redirect("/admin/users");
              }
            }
          );
        });
      });
    } else {
      db.query(
        `UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', sex = '${req.body.sex}', birthday = '${req.body.birthday}' , logo = '${req.body.logo}', role = '${req.body.role}', wallet = '${req.body.wallet}' WHERE id = ${id}`,
        function (success, err) {
          if (err) {
            req.flash("error-message", err);
            res.redirect("/admin/users");
          } else {
            req.flash("success-message", "Offre Créé !"),
              res.redirect("/admin/users");
          }
        }
      );
    }
  },

  /* Méthode Get pour la page admin/users/create */
  createUser: (req, res) => {
    res.render("admin/users/create", {
      title: app.config.company.name + " - Gestion d'utilisateur",
      action: "edit",
      app: app,
      user: req.user[0].id,
    });
  },

  /* Méthode Post pour la page admin/users/create */
  submitCreatedUser: (req, res) => {
    db.query(
      `SELECT * FROM users WHERE email = ${req.body.email}`,
      function (err, data) {
        if (data) {
          req.flash("error-message", "Email déja utiliser");
          res.redirect("/admin/users");
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              db.query(
                `INSERT INTO users ( name, lastname, email, password, sex, birthday, role, wallet, logo) VALUES ('${req.body.name}', '${req.body.lastname}', '${req.body.email}', '${hash}', '${req.body.sex}', '${req.body.birthday}', '${req.body.role}', '${req.body.wallet}', '${req.body.logo}' )`,
                function (success, err) {
                  req.flash("success-message", "Utilisateur Créé !"),
                    res.redirect("/admin/users");
                }
              );
            });
          });
        }
      }
    );
  },

  /* Méthode Post pour la page admin/users/mail/ */

  mailUser: (req, res) => {
    const email = req.params.email;

    db.query(
      `SELECT * FROM users WHERE email = "${email}"`,
      function (err, data) {
        if (err) throw err;
        else
          res.render("admin/users/mail", {
            title: app.config.company.name + " - Contacte d'utilisateur",
            action: "edit",
            user: JSON.parse(JSON.stringify(data))[0],
          });
      }
    );
  },

  SendMailUser: async (req, res) => {
    sendMail(req.params.email, req.body.subject, "", Login);
  },

  /* Méthode Post pour la page admin/users/delete */
  deleteUser: (req, res) => {
    const id = req.params.id;

    db.query(`DELETE FROM users WHERE id = ${id}`, function (success, err) {
      if (err) {
        req.flash("error-message", err);
        res.redirect("/admin/users");
      } else {
        res.redirect("/admin/users"),
          req.flash("success-message", "Offre Suprimé !");
      }
    });
  },

  /* Méthode Get pour la page admin/plans */
  getPlans: (req, res) => {
    let plans = [];
    db.query(`SELECT * FROM plans`, function (err, data) {
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

      res.render("admin/plans/index", {
        title: app.config.company.name + " - List des offres",
        action: "list",
        user: req.user[0],
        plans,
        app: app,
        system: package_json,
      });
    });
  },

  /* Méthode Get pour la page admin/plans/create */
  createPlan: (req, res) => {
    db.query(`SELECT * FROM categories ORDER BY id`, function (err, data) {
      if (err) req.flash("error-message", err);
      console.log(JSON.parse(JSON.stringify(data)));
      res.render("admin/plans/create", {
        title: app.config.company.name + " - Créé une offre",
        action: "list",
        categories: JSON.parse(JSON.stringify(data)),
      });
    });
  },

  /* Méthode Post pour la page admin/plans/create */
  submitCreatedPlan: (req, res) => {
    db.query(
      `INSERT INTO plans ( name, category, price, stock, state) VALUES ('${req.body.name}', '${req.body.category}', '${req.body.price}', '${req.body.stock}', '${req.body.state}')`,
      function (success, err) {
        if (err) {
          req.flash("error-message", err);
          res.redirect("/admin/plans");
        } else {
          req.flash("success-message", "Offre Créé !"),
            res.redirect("/admin/plans");
        }
      }
    );
  },

  /* Méthode Get pour la page admin/plans/edit/id */
  editPlan: (req, res) => {
    let plan = [];
    db.query(
      `SELECT * FROM plans WHERE id = ${req.params.id}`,
      function (err, data) {
        data.forEach((item) => {
          db.query(
            `SELECT * FROM categories WHERE id = ${item.category}`,
            function (err, result) {
              result.forEach((category) => {
                plan.push({
                  id: item.id,
                  name: item.name,
                  category: category.name,
                  price: item.price,
                  stock: item.stock,
                  state: item.state,
                });
              });
              res.render("admin/plans/edit", {
                title: app.config.company.name + " - Modification d'une offre",
                action: "edit",
                plan: plan[0],
                user: req.user[0],
                app: app,
                system: package_json,
              });
            }
          );
        });
      }
    );
  },

  /* Méthode Post pour la page admin/plans/edit/id */
  submitEditedPlan: (req, res) => {
    db.query(
      `UPDATE plans SET name = '${req.body.name}', price = '${req.body.price}', stock = '${req.body.stock}', state = '${req.body.state}' WHERE id = ${req.params.id}`,
      function (success, err) {
        if (err) {
          req.flash("error_message", err);
          res.redirect("/admin/plans");
        } else {
          req.flash("success_message", "Offre Créé !"),
            res.redirect("/admin/plans");
        }
      }
    );
  },

  configPterodactylPlan: (req, res) => {
    let id = req.params.id;
    let plan = [];

    getPterodactylNodes(function (nodes) {
      getPterodactylEggs(function (eggs) {
        db.query(`SELECT * FROM plans WHERE id = ${id}`, function (err, data) {
          data.forEach((item) => {
            db.query(
              `SELECT * FROM categories WHERE id = ${item.category}`,
              function (err, result) {
                result.forEach((category) => {
                  plan.push({
                    id: item.id,
                    name: item.name,
                    category: category.name,
                    price: item.price,
                    stock: item.stock,
                    state: item.state,
                  });
                });
              }
            );
          });
        });
        res.render(`admin/plans/config/1/index`, {
          title:
            app.config.company.name +
            " - Configuration d'une offre pterodactyl",
          action: "edit",
          user: req.user[0],
          plan: plan[0],
          nodes,
          eggs,
          app: app,
          system: package_json,
        });
      });
    });
  },

  /* Méthode Post pour la page admin/plans/ */
  deletePlan: (req, res) => {
    const id = req.params.id;
    db.query(`DELETE FROM plans WHERE id = ${id}`, function (success, err) {
      if (err) {
        req.flash("error-message", err);
        res.redirect("/admin/plans");
      } else {
        res.redirect("/admin/plans"),
          req.flash("success-message", "Offre Suprimé !");
      }
    });
  },

  /* Méthode Get pour la page admin/categories */
  getCategories: (req, res) => {
    db.query(`SELECT * FROM categories ORDER BY id DESC`, function (err, data) {
      if (err) req.flash("error-message", err);
      let categorys = [];
      data.forEach((category) => {
        db.query(
          `SELECT * FROM servers WHERE id = ${category.server}`,
          function (err, servers) {
            servers.forEach((server) => {
              categorys.push({
                id: category.id,
                name: category.name,
                server: server.name,
                auto: category.auto,
              });
            });
          }
        );
      });
      res.render("admin/categories/index", {
        title: app.config.company.name + " - Liste des catégories",
        action: "list",
        category: categorys,
        user: req.user[0],
        app: app,
        system: package_json,
      });
    });
  },

  /* Méthode Get pour la page admin/categories/create */
  createCategory: (req, res) => {
    db.query(`SELECT * FROM servers ORDER BY id`, function (err, data) {
      if (err) req.flash("error-message", err);
      else
        res.render("admin/categories/create", {
          title: app.config.company.name + " - Créé une offre",
          action: "list",
          server: data,
        });
    });
  },

  /* Méthode Post pour la page admin/categories/create */
  submitCreatedCategory: (req, res) => {
    console.log(req.body)
    db.query(
      `INSERT INTO categories (name, server, auto) VALUES ('${req.body.name}', '${req.body.server}', '${req.body.auto}')`,
      function (success, err) {
        if (err) {
          req.flash("error-message", err);
          res.redirect("/admin/categories");
        } else {
          req.flash("success-message", "Offre Créé !"),
            res.redirect("/admin/categories");
        }
      }
    );
  },

  /* Méthode Get pour la page admin/categories/edit */
  editCategory: (req, res) => {
    const id = req.params.id;

    db.query(`SELECT * FROM categories WHERE id = ${id}`, function (err, data) {
      if (err) throw err;
      else {
        db.query(`SELECT * FROM servers ORDER BY id`, function (err, server) {
          if (err) req.flash("error-message", err);
          else {
            res.render("admin/categories/edit", {
              title: app.config.company.name + " Plans Edit",
              action: "edit",
              server,
              category: JSON.parse(JSON.stringify(data))[0],
            });
          }
        });
      }
    });
  },

  /* Méthode Post pour la page admin/categories/edit */
  submitEditedCategory: (req, res) => {
    const id = req.body.id;

    db.query(
      `UPDATE categories SET name = '${req.body.name}', auto = '${req.body.auto}' WHERE id = ${id}`,
      function (success, err) {
        if (err) {
          req.flash("error-message", err);
          res.redirect("/admin/categories");
        } else {
          req.flash("success-message", "Catégorie mise a jour !"),
            res.redirect("/admin/categories");
        }
      }
    );
  },

  /* Méthode Post pour la page admin/categories/ */
  deleteCategory: (req, res) => {
    db.query(
      `DELETE FROM categories WHERE id = ${req.params.id}`,
      function (success, err) {
        if (err) {
          req.flash("error-message", err);
          res.redirect("/admin/categories");
        } else {
          res.redirect("/admin/categories"),
            req.flash("success-message", "categories Suprimé !");
        }
      }
    );
  },

  /* Méthode Get pour la page admin/servers/ */
  getServers: (req, res) => {
    db.query(`SELECT * FROM servers ORDER BY id`, function (err, data) {
      if (err) req.flash("error-message", err);
      else
        res.render("admin/servers/index", {
          title: app.config.company.name + " - Serveurs",
          action: "list",
          server: data,
          user: req.user[0],
          app: app,
          system: package_json,
        });
    });
  },

  getSettings: (req, res) => {
    const app = require("../config/app.json");
    res.render("admin/settings/index", {
      title: app.config.company.name + " - Paramètres",
      action: "config",
      user: req.user[0],
      app: app,
      system: package_json,
    });
  },

  postSettings: (req, res) => {
    const fs = require("fs");
    let {
      hostname,
      port,
      license,
      name,
      description,
      adresse,
      domaine,
      logo,
      mentions,
      privacy,
    } = req.body;
    var app = {
      config: {
        system: {
          hostname: hostname,
          port: parseInt(port, 10),
          license: license,
        },

        company: {
          name: name,
          description: description,
          adresse: adresse,
          domaine: domaine,
          logo: logo,

          legale: {
            mentions: mentions,
            privacy: privacy,
          },
        },
      },
    };
    const jsonString = JSON.stringify(app);

    fs.writeFile("./config/app.json", jsonString, (err) => {
      if (err) console.log("Error writing file", err);
      else console.log("Successfully wrote file");
    });

    res.redirect("/admin/settings");
  },

  getDBSettings: (req, res) => {
    const database = require("../config/database.json");
    res.render("admin/settings/database", {
      title: app.config.company.name + " - Paramètres de la base de données",
      action: "config",
      database: database,
    });
  },

  postDBSettings: (req, res) => {
    const fs = require("fs");
    let { hostname, username, password, dbname } = req.body;
    var database = {
      config: {
        host: hostname,
        port: 2004,
        user: username,
        password: password,
        dbname: dbname,
      },
    };
    const jsonString = JSON.stringify(database);

    fs.writeFile("./config/database.json", jsonString, (err) => {
      if (err) console.log("Error writing file", err);
      else console.log("Successfully wrote file");
    });
    res.redirect("/admin/settings");
  },

  getMailSettings: (req, res) => {
    const smtp = require("../config/smtp.json");
    res.render("admin/settings/e-mail", {
      title: app.config.company.name + " - Paramètres du serveur mail",
      action: "config",
      smtp: smtp,
    });
  },

  postMailSettings: (req, res) => {
    const fs = require("fs");
    let { hostname, port, encryption, username, password } = req.body;
    var smtp = {
      config: {
        host: hostname,
        port: parseInt(port, 10),
        secure: JSON.parse(encryption.toLowerCase()),
        auth: {
          user: username,
          pass: password,
        },
      },
    };
    const jsonString = JSON.stringify(smtp);

    fs.writeFile("./config/smtp.json", jsonString, (err) => {
      if (err) console.log("Error writing file", err);
      else console.log("Successfully wrote file");
    });
    res.redirect("/admin/settings");
  },

  getPaymentsSettings: (req, res) => {
    const paymentsGateways = require("../config/payments-gateways.json");
    res.render("admin/settings/payments-gateways", {
      title: app.config.company.name + " - Paramètres du serveur mail",
      action: "config",
      paymentsGateways: paymentsGateways,
    });
  },

  postPaymentsSettings: (req, res) => {
    const fs = require("fs");

    var PaypalEnabled = false;
    PaypalEnabled = req.body.PaypalEnabled == "on" ? true : false;
    PaypalEnabled = req.body.PaypalEnabled == "on" ? true : false;

    var paymentsGateways = {
      config: {
        paypal: {
          enabled: PaypalEnabled,
          client_id: req.body.PaypalPublicKey,
          client_secret: req.body.PaypalSecretKey,
        },

        stripe: {
          enabled: StripeEnabled,
          publicKey: req.body.StripePublicKey,
          secretKey: req.body.StripeSecretKey,
        },
      },
    };
    const jsonString = JSON.stringify(paymentsGateways);

    fs.writeFile("./config/payments-gateways.json", jsonString, (err) => {
      if (err) console.log("Error writing file", err);
      else console.log("Successfully wrote file");
    });
    res.redirect("/admin/settings");
  },
};
