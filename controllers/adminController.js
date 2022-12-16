/* Importation des modules nodeJS */
const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const system = require("../package.json");
const { setEnvValue, getEnVvalue } = require("../config/config");

const {
  //Functions de la partie gestion utilisateurs
  getAllUsers,
  getUserByID,
  editUserByID,
  createNewUser,
  deleteUserByID,
  sendEmailToUser,
  //Functions de la partie gestion offres
  getAllPlans,
  createNewPlan,
  //Functions de la partie gestion catégories
  getAllCategories,
  editPlanByID,
  getPlanByID,
  getCategoryByID,
  updateConfigPlanByID,
  deletePlanByID,
  getServerById,
  getAllServers,
  createNewCategory, 
  updateCategoryByID,
  deleteCategoryByID} = require("../functions/adminFunctions");

const {
  sendEmail,
  getHostStats,
  GetConfigVariables,
  getBestSelledProducts,
} = require("../config/customFunction");
const { Login } = require("../templates/emails/templates_emails");
const Nodeactyl = require("nodeactyl");
const { getPterodactylNodes, getPterodactylEggsByNestID, getPterodactylNests } = require("../addons/servers/pterodactyl/requests");

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
    editUserByID(req.body, function (response) {
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

  // Routes de la partie gestion offres

  getPlansListePage: (req, res) => {
    GetConfigVariables(function (config) {
      getAllPlans(function (plans) {
        res.render("admin/plans/index", {
          title: config.host.name + " - List des offres",
          action: "list",
          user: req.user[0],
          plans,
          config,
          system,
        });
      })
    })

  },

  getCreatePlanPage: (req, res) => {
    GetConfigVariables(function (config) {
      getAllCategories(function (categories) {
        res.render("admin/plans/create", {
          title: config.host.name + " - Créé une offre",
          action: "list",
          categories,
        });
      })
    })
  },

  postCreatePlan: (req, res) => {
    createNewPlan(req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans")
      }
    })
  },

  getEditPlanPage: (req, res) => {
    GetConfigVariables(function (config) {
      getPlanByID(req.params.id, function (item) {
        getCategoryByID(item.category, function (category) {
          let plan = {
            id: item.id,
            name: item.name,
            category: category[0].name,
            price: item.price,
            stock: item.stock,
            state: item.state,
          }
          res.render("admin/plans/edit", {
            title: config.host.name + " - Modification d'une offre",
            action: "edit",
            plan,
            user: req.user[0],
            config,
            system,
          });
        })
      })
    })
  },

  postEditPlan: (req, res) => {
    GetConfigVariables(function (config) {
      editPlanByID(req.body, function (response) {
        if (response.type == "success") {
          req.flash("success-message", response.message)
          res.redirect("/admin/plans")
        }

        if (response.type == "error") {
          req.flash("error-message", response.message)
          res.redirect("/admin/plans")
        }
      })
    })
  },


  getConfigPterodactylPlanPage: function (req, res) {
    GetConfigVariables(function (config) {
      getPlanByID(req.params.id, function (plan) {
        getPterodactylNodes(function (nodes) {
          let martin = [];
          getPterodactylNests(function (nests) {
            for (const nest of nests) {
              getPterodactylEggsByNestID(nest.attributes.id, function (eggs) {
                for (const egg of eggs) {
                  martin.push({
                    id: egg.attributes.id,
                    name: egg.attributes.name
                  })
                }
              })
            }
            console.log(martin)
          })
          res.render(`admin/plans/config/1/index`, {
            title:
              config.host.name +
              " - Configuration d'une offre pterodactyl",
            action: "edit",
            user: req.user[0],
            plan,
            nodes,
            eggs: martin,
            config,
            system,
          });
        })
      })
    })
  },

  postPterodactylConfigPlan: (req, res) => {
    updateConfigPlanByID(req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans")
      }
    })
  },

  deletePlan: (req, res) => {
    deletePlanByID(req.params.id, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans")
      }
    })
  },


  /* Méthode Get pour la page admin/categories */
  getCategoriesListePage: (req, res) => {
    let categories = []
    GetConfigVariables(function (config) {
      getAllCategories(function (items) {
        items.forEach(categorie => {
          getServerById(categorie.server, function (server) {
            categories.push({
              id: categorie.id,
              name: categorie.name,
              auto: categorie.auto,
              server: server.name,
            })
          })
        });
        res.render("admin/plans/categories/index", {
          title: config.host.name + " - Liste des catégories",
          action: "list",
          user: req.user[0],
          categories,
          config,
          system,
        });
      })
    })
  },

  getCreateCategoriesPage: (req, res) => {
    GetConfigVariables(function (config) {
      getAllServers(function (servers) {
        res.render("admin/plans/categories/create", {
          title: config.host.name + " - Créé une catégorie",
          action: "list",
          servers,
        });
      })
    })
  },

  /* Méthode Post pour la page admin/categories/create */
  postCreateCategories: (req, res) => {
    createNewCategory(req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans/categories")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans/categories")
      }
    })
  },

  /* Méthode Get pour la page admin/categories/edit */
  getEditCategoriesPage: (req, res) => {
    GetConfigVariables(function (config) {
      getCategoryByID(req.params.id, function (category) {
        getAllServers(function (servers) {
          res.render("admin/plans/categories/edit", {
            title: config.host.name + " Plans Edit",
            action: "edit",
            config,
            servers,
            category
          });
        })
      })
    })
  },

  postEditCategories:(req, res) => {
    updateCategoryByID(req.body, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans/categories")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans/categories")
      }
    })
  },


  /* Méthode Post pour la page admin/categories/ */
  deleteCategory: (req, res) => {
    deleteCategoryByID(req.params.id, function (response) {
      if (response.type == "success") {
        req.flash("success-message", response.message)
        res.redirect("/admin/plans/categories")
      }

      if (response.type == "error") {
        req.flash("error-message", response.message)
        res.redirect("/admin/plans/categories")
      }
    })

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

  getThemesSettings: (req, res) => {
    const { getSassVariablesAsync, getSassVariablesStringAsync } = require('node-sass-variables');
    getSassVariablesAsync('./public/css/theme.scss').then((response) => {
      const colors = JSON.parse(JSON.stringify(response));
      GetConfigVariables(function (config) {
        res.render("admin/settings/themes", {
          title: config.host.name + " - Paramètres du serveur mail",
          action: "config",
          colors,
          config,
        });
      })
    })
  },

  postThemesSettings: (req, res) => {
    const { compileSassAndSave } = require('compile-sass'); // CommonJS    
    const fs = require("fs");
    const colors = req.body;
    let theme = `
      $colored_back_1: ${colors.colored_back_1};
      $colored_back_2: ${colors.colored_back_2};
      $light_back: ${colors.light_back};
      $mid_text_color: ${colors.mid_text_color};
      $light_text_color: ${colors.light_text_color};
      $dark_text_color: ${colors.dark_text_color};
      $light_border_color: ${colors.light_border_color};
      $dark_border_color: ${colors.dark_border_color};

      $blue: ${colors.blue};
      $dark_blue: ${colors.dark_blue};
      $green: ${colors.green};
      $dark_green: ${colors.dark_green};
      $red: ${colors.red};
      $dark_red: ${colors.dark_red};
      $orange: ${colors.orange};
      $dark_orange: ${colors.dark_orange};
    `
    fs.writeFile("./public/css/theme.scss", theme, async function (err) {
      if (err) {
        req.flash("error-message", "le thème n'a pas été modfié")
        res.redirect("/admin/settings")
        throw err
      } else {
        await compileSassAndSave('./public/css/theme.scss', './public/css/theme.css');
        await compileSassAndSave('./public/css/style.scss', './public/css/style.css');
        req.flash("success-message", "le thème a été modfié")
        res.redirect("/admin/settings")
      }
    });

  },
}

