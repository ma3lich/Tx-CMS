/* Importation des modules nodeJS */
const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const system = require("../package.json");
const {
  //Functions de la partie gestion utilisateurs
  getAllUsers,
  getUserByID,
  updateUserByID,
  createNewUser,
  deleteUserByID,
  sendEmailToUser, } = require("../functions/adminFunctions");

const {
  sendEmail,
  getHostStats,
  getPterodactylEggs,
  getPterodactylNodes,
  GetConfigVariables,
  getBestSelledProducts,
} = require("../config/customFunction");
const { Login } = require("../templates/emails/templates_emails");
const Nodeactyl = require("nodeactyl");
const { setEnvValue, getEnVvalue } = require("../config/config");

const application = new Nodeactyl.NodeactylApplication(
  "https://panel.txhost.fr",
  "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
);

module.exports = {

  index: (req, res) => {
    GetConfigVariables(function (config) {
      getHostStats(function (hostStats) {
        getBestSelledProducts(function (bestSelling) {
          res.render("admin/index", {
            title: config.host.name + " - Espace Admin",
            action: "info",
            hostStats,
            config: config,
            bestSelling,
            system,
            user: req.user[0],
          });
        })
      })
    });
  },


  // Routes de la partie gestion utilisateurs
  getUsersListePage: (req, res) => {
    GetConfigVariables(function (config) {
      getAllUsers(function (users) {
        res.render("admin/users/index", {
          title: config.host.name + " - Liste des utilisateurs",
          action: "list",
          user: req.user[0],
          users,
          config,
          system,
        });
      })
    })
  },

  getEditUserPage: (req, res) => {
    GetConfigVariables(function (config) {
      getUserByID(req.params.id, function (user) {
        res.render("admin/users/edit", {
          title: config.host.name + " - Gestion d'utilisateur",
          action: "edit",
          config,
          user,
        });
      });
    })
  },

  postEditUser: (req, res) => {
    updateUserByID(req.params.id, req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/users")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/users")
      }
    });
  },

  getCreateUserPage: (req, res) => {
    GetConfigVariables(function (config) {
      res.render("admin/users/create", {
        title: config.host.name + " - Gestion d'utilisateur",
        action: "edit",
        config,
        user: req.user[0],
      });
    })
  },

  postCreateUser: (req, res) => {
    createNewUser(req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/users")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/users")
      }
    })
  },

  deleteUser: (req, res) => {
    deleteUserByID(req.params.id, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/users")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/users")
      }
    })
  },

  getMailUserPage: (req, res) => {
    GetConfigVariables(function (config) {
      getUserByID(req.params.id, function (user) {
        res.render("admin/users/mail", {
          title: config.host.name + " - Contacter un utilisateur",
          action: "edit",
          config,
          user,
        });
      });
    })
  },

  postMailUser: (req, res) => {
    sendEmailToUser(req.body.email, req.body.subject, "", req.body.message, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/users")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/users")
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
        title: config.host.name + " - List des offres",
        action: "list",
        user: req.user[0],
        plans,
        app: app,
        system,
      });
    });
  },

  /* Méthode Get pour la page admin/plans/create */
  createPlan: (req, res) => {
    db.query(`SELECT * FROM categories ORDER BY id`, function (err, data) {
      if (err) req.flash("error-message", err);
      console.log(JSON.parse(JSON.stringify(data)));
      res.render("admin/plans/create", {
        title: config.host.name + " - Créé une offre",
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
                title: config.host.name + " - Modification d'une offre",
                action: "edit",
                plan: plan[0],
                user: req.user[0],
                app: app,
                system,
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
            config.host.name +
            " - Configuration d'une offre pterodactyl",
          action: "edit",
          user: req.user[0],
          plan: plan[0],
          nodes,
          eggs,
          app: app,
          system,
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
        title: config.host.name + " - Liste des catégories",
        action: "list",
        category: categorys,
        user: req.user[0],
        app: app,
        system,
      });
    });
  },

  /* Méthode Get pour la page admin/categories/create */
  createCategory: (req, res) => {
    db.query(`SELECT * FROM servers ORDER BY id`, function (err, data) {
      if (err) req.flash("error-message", err);
      else
        res.render("admin/categories/create", {
          title: config.host.name + " - Créé une offre",
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
              title: config.host.name + " Plans Edit",
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
          title: config.host.name + " - Serveurs",
          action: "list",
          server: data,
          user: req.user[0],
          app: app,
          system,
        });
    });
  },

  getSettings: (req, res) => {
    GetConfigVariables(function (config) {
      res.render("admin/settings/index", {
        title: config.host.name + " - Paramètres",
        action: "config",
        user: req.user[0],
        config,
        system,
      });
    })
  },

  postSettings: (req, res) => {
    setEnvValue('APP_TIMEZONE', req.body.timezone)
    setEnvValue('APP_LOCALE', req.body.locale)
    setEnvValue('APP_URL', req.body.hostname)
    setEnvValue('APP_PORT', req.body.port)
    setEnvValue('APP_LICENSE_KEY', req.body.license)
    setEnvValue('HOST_NAME', req.body.name)
    setEnvValue('HOST_HOSTNAME', req.body.host_hostname)
    setEnvValue('HOST_LOGO', req.body.logo)
    setEnvValue('HOST_DESCRIPTION', req.body.description)
    setEnvValue('HOST_ADDRESS', req.body.address)
    setEnvValue('HOST_CITY', req.body.city)
    setEnvValue('HOST_ZIP', req.body.zip)
    setEnvValue('HOST_COUNTRY', req.body.country)
    setEnvValue('HOST_CITY', req.body.city)
    setEnvValue('HOST_LEGALS', req.body.legals)
    setEnvValue('HOST_PRIVACY', req.body.privacy)

    res.redirect(302, "/admin/settings");
  },

  getDBSettings: (req, res) => {
    GetConfigVariables(function (config) {
      res.render("admin/settings/database", {
        title: config.host.name + " - Paramètres de la base de données",
        action: "config",
        config,
      });
    })
  },

  postDBSettings: (req, res) => {
    setEnvValue('DB_HOST', req.body.hostname)
    setEnvValue('DB_PORT', req.body.port)
    setEnvValue('DB_DATABASE', req.body.database)
    setEnvValue('DB_USERNAME', req.body.username)
    setEnvValue('DB_PASSWORD', req.body.password)
    res.redirect(302, "/admin/settings");
  },

  getMailSettings: (req, res) => {
    GetConfigVariables(function (config) {
      res.render("admin/settings/e-mail", {
        title: config.host.name + " - Paramètres du serveur mail",
        action: "config",
        config,
      });
    })
  },

  postMailSettings: (req, res) => {
    setEnvValue('MAIL_HOST', req.body.hostname)
    setEnvValue('MAIL_PORT', req.body.port)
    setEnvValue('MAIL_USERNAME', req.body.username)
    setEnvValue('MAIL_PASSWORD', req.body.password)
    setEnvValue('MAIL_SECURE', req.body.secure)

    res.redirect(302, "/admin/settings");
  },

  getPaymentsSettings: (req, res) => {
    GetConfigVariables(function (config) {
      res.render("admin/settings/payments-gateways", {
        title: config.host.name + " - Paramètres du serveur mail",
        action: "config",
        config,
      });
    })
  },

  postPaymentsSettings: (req, res) => {
    if (req.body.paypal) setEnvValue('PAYPAL', "true");
    else setEnvValue('PAYPAL', "false");
    setEnvValue('PAYPAL_PUBLIC', req.body.paypalPublic);
    setEnvValue('PAYPAL_SECRET', req.body.paypalSecret);

    if (req.body.stripe) setEnvValue('STRIPE', "true");
    else setEnvValue('STRIPE', "false");
    setEnvValue('STRIPE_PUBLIC', req.body.stripePublic);
    setEnvValue('STRIPE_SECRET', req.body.stripeSecret);

    if (req.body.wallet) setEnvValue('WALLET', "true");

    res.redirect(302, "/admin/settings");
  },
}
