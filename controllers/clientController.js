/* Importation des modules nodeJS */

const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const package_json = require("../package.json");


const { getUserStats, calcDate, setEnvValue, getEnVvalue } = require("../config/customFunction");
/* A function that is being called from the `adminController.js` file. */

const { GetPterodactylServerInfo, GetFilesAndDirectorys, GetFileContent } = require("../addons/servers/pterodactyl/requests");
const { GetWebSocket } = require("../addons/servers/pterodactyl/websocket");
const { PayaplCreatePayment } = require("../addons/payments/paypal/request");
const { StripeTaxeFR, StripeCreatePayment } = require("../addons/payments/stripe/request");

var productsInTheCart = [];

module.exports = {
  /* Méthode Get pour la page client/index */
  index: (req, res) => {
    getUserStats(req.user[0], function (userStats) {
      db.query(
        `SELECT * FROM services WHERE owner = ${req.user[0].id}`,
        function (err, servicesJson) {
          let servicesRow = JSON.parse(JSON.stringify(servicesJson));
          let services = [];
          for (let i = 0; i < servicesRow.length; i++) {
            db.query(
              `SELECT * FROM plans WHERE id = ${servicesRow[i].plan}`,
              function (err, planJson) {
                let planRow = JSON.parse(JSON.stringify(planJson));
                let dateC = new Date(
                  servicesRow[i].created_at.split("/")[2],
                  servicesRow[i].created_at.split("/")[1] - 1,
                  +servicesRow[i].created_at.split("/")[0]
                );
                let dateF = new Date(
                  servicesRow[i].finish_at.split("/")[2],
                  servicesRow[i].finish_at.split("/")[1] - 1,
                  +servicesRow[i].finish_at.split("/")[0]
                );
                services.push({
                  id: servicesRow[i].id,
                  name: planRow[0].name,
                  time: calcDate(dateC, dateF),
                });
              }
            );
          }
          res.render("client/index", {
            title: app.config.company.name + " - Espace Client",
            action: "info",
            user: req.user[0],
            userStats,
            services,
            app,
            system: package_json,
          });
        }
      );
    });
  },

  /* Méthode Post pour la page client/index */
  logout: (req, res, next) => {
    console.log("logging out");
    console.log(req.user[0]);
    req.logOut((err) => {
      if (err) return next(err);
      req.session.destroy();
      res.redirect("/");
    });
  },

  /* Méthode Get pour la page client/profile */
  getProfile: (req, res) => {
    db.query(
      `SELECT * FROM users WHERE id = ${req.user[0].id}`,
      function (err, data) {
        user = JSON.parse(JSON.stringify(data))[0];

        res.render("client/profile", {
          title: app.config.company.name + " - Home",
          action: "info",
          user: user,
          app,
          system: package_json,
        });
      }
    );
  },

  /* Méthode Post pour la page client/profile */
  submitProfile: (req, res) => {
    if (req.body.newPassword) {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
          db.query(
            `UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', password = '${hash}', usernote = '${req.body.userNote}' , logo = '${req.body.logo}' WHERE id = ${req.user[0].id}`,
            function (success, err) {
              req.flash("success-message", "Utilisateur Créé !"),
                res.redirect("/client/profile");
            }
          );
        });
      });
    } else {
      db.query(
        `UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', usernote = '${req.body.userNote}' , logo = '${req.body.logo}' WHERE id = ${req.user[0].id}`,
        function (success, err) {
          req.flash("success-message", "Utilisateur Créé !"),
            res.redirect("/client/profile");
        }
      );
    }
  },

  /* Méthode Get pour la page client/shop */
  getShop: (req, res) => {
    db.query(
      `SELECT * FROM plans WHERE state = "public" ORDER BY sold DESC LIMIT 6`,
      function (err, data) {
        if (err) console.debug(err);
        else {
          db.query(
            `SELECT * FROM categories ORDER BY id`,
            function (error, results) {
              if (error) throw error;
              else
                res.render("client/shop", {
                  title: app.config.company.name + " - Boutique",
                  action: "info",
                  user: req.user[0],
                  categories: JSON.parse(JSON.stringify(results)),
                  plans: data,
                  app,
                  system: package_json,
                });
            }
          );
        }
      }
    );
  },

  /* Méthode Get pour la page client/shop/name */
  getShopByCategory: (req, res) => {
    db.query(
      `SELECT * FROM plans WHERE category = "${req.params.id}" AND state = "public"`,
      function (err, data) {
        console.log(data);
        if (err) console.debug(err);
        db.query(
          `SELECT * FROM categories ORDER BY id`,
          function (error, results) {
            if (error) throw error;
            res.render("client/shop/categories/", {
              title: app.config.company.name + " - Boutique",
              action: "info",
              user: req.user[0],
              categories: JSON.parse(JSON.stringify(results)),
              plans: data,
              categoriesName: req.params.name,
              app,
              system: package_json,
            });
          }
        );
      }
    );
  },

  getCart: (req, res) => {
    let products = [];

    db.query(
      `SELECT * FROM carts WHERE owner = ${req.user[0].id}`,
      function (err, results) {
        if (err) console.trace(err);
        else {
          results.forEach((plans) => {
            if (plans.amount > 0) {
              db.query(
                `SELECT * FROM plans WHERE id = ${plans.planID}`,
                function (error, data) {
                  if (error) throw error;
                  else {
                    for (let plan of data) {
                      products.push({
                        id: plan.id,
                        name: plan.name,
                        categorie: plan.categorie,
                        price: plan.price,
                        fee: plan.fee,
                        amount: plans.amount,
                        id: plans.id,
                      });
                    }
                  }
                }
              );
            }
          });

          productsInTheCart = products;

          res.render("client/shop/cart/", {
            title: app.config.company.name + " - Panier",
            user: req.user[0],
            app,
            system: package_json,
            tva: getEnVvalue('TVA_RATE'),
            userCart: results,
            cartPlans: products,
          });
        }
      }
    );
  },

  addToCart: (req, res) => {
    db.query(
      `SELECT * FROM carts WHERE planID = ${req.params.id} AND owner = ${req.user[0].id}`,
      (err, data) => {
        if (err) console.trace(err);
        if (data.length > 0) {
          console.log("update");

          let newAmount = data[0].amount + Number(req.body.amount);
          db.query(
            `UPDATE carts SET amount = ${newAmount} WHERE planID = ${req.params.id}`,
            function (err) {
              if (err) console.trace(err);
              res.redirect("/client/shop/cart");
            }
          );
        } else {
          console.log("new");
          db.query(
            `INSERT INTO carts (owner, planID, amount) VALUES ('${req.user[0].id}', '${req.params.id}', '${req.body.amount}')`,
            function (err, sucess) {
              if (err) console.trace(err);
              res.redirect("/client/shop/cart");
            }
          );
        }
      }
    );
  },

  removeFromCart: (req, res) => {
    db.query(
      `DELETE FROM carts WHERE owner = ${req.user[0].id} AND id = ${req.params.id}`,
      (data, err) => {
        res.redirect("/client/shop/cart");
      }
    );
  },

  checkoutCart: async (req, res) => {
    let items = [];
    let line_items = [];

    for (let item of productsInTheCart) {
      items.push({ // Paypal array of products
        name: item.name,
        sku: `${item.id}`,
        price: item.price,
        currency: "EUR",
        quantity: item.amount,
      });
      line_items.push({ // Stripe array of products
        quantity: item.amount,
        tax_rates: [StripeTaxeFR().id],
        price_data: {
          currency: "EUR",
          unit_amount: item.price * 100 + item.fee * 100,
          tax_behavior: "exclusive",
          product_data: {
            name: item.name,
          },
        },
      });
    }

    let paypalOptions = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:2004/client/shop/cart/checkout/success",
        cancel_url: "http://localhost:2004/client/shop/cart/checkout/cancel",
      },
      transactions: [
        {
          item_list: {
            shipping_address: {
              line1: req.body.adresse1,
              line2: req.body.adresse2,
              city: req.body.city,
              country_code: req.body.country,
              postal_code: req.body.zip,
              state: req.body.state,
              phone: req.body.tel,
            },
            shipping_phone_number: req.body.tel,
          },
          amount: {
            currency: "EUR",
            details: {
              subtotal: req.query.subtotal,
              tax: req.query.tva,
              shipping: req.query.fees,

              //"shipping_discout": req.query.promo
            },
            total: req.query.total,
          },
          description: app.config.company.name,
        },
      ],
    };

    let StripeOptions = {
      payment_method_types: ["card"],
      submit_type: "pay",
      line_items: line_items,
      locale: "fr",
      mode: "payment",
      success_url: `http://localhost:2004/client/shop/cart/checkout/success`,
      cancel_url: `http://localhost:2004/client/shop/cart/checkout/cancel`,
    };

    if (req.query.getway == "paypal") {
      if (items.length > 0) {
        PayaplCreatePayment(paypalOptions, req.user[0], productsInTheCart, req.query, function (paymentLink) {
          db.query(
            `DELETE FROM carts WHERE owner = ${req.user[0].id}`,
            (data, err) => {
              res.redirect(303, paymentLink)
            }
          );
        })
        // Créé une facture ici 
      } else {
        res.redirect("/client/shop/cart");
      }
    }

    if (req.query.getway == "stripe") {
      if (line_items.length > 0) {
        StripeCreatePayment(StripeOptions, req.user[0], productsInTheCart, req.query, function (paymentLink) {
          db.query(
            `DELETE FROM carts WHERE owner = ${req.user[0].id}`,
            (data, err) => {
              res.redirect(303, paymentLink)
            }
          );
        })
      } else {
        res.redirect("/client/shop/cart");
      }
    }
  },

  CancelCheckoutPage: (req, res) => {
    res.render("client/shop/cart/checkout/cancel", {
      title: app.config.company.name + " - success",
      user: req.user[0],
      app,
      system: package_json,
    });
  },

  SuccesCheckoutPage: (req, res) => {
    db.query(
      `SELECT * FROM transactions WHERE owner = ${req.user[0].id} ORDER BY id desc LIMIT 1`,
      (err, data) => {
        if (err) console.debug(err);
        db.query(
          `DELETE FROM carts WHERE owner = ${req.user[0].id}`,
          function (success, err) {
            if (err) console.debug(err);
            db.query(
              `UPDATE transactions SET state = 'success' WHERE id = ${JSON.parse(JSON.stringify(data))[0].id
              }`,
              function (success, err) {
                if (err) console.debug(err);
                res.render("client/shop/cart/checkout/success", {
                  title: app.config.company.name + " - success",
                  user: req.user[0],
                  app,
                  system: package_json,
                });
              }
            );
          }
        );
      }
    );
  },


  // Gestion d'un service Pterodactyl 

  PterodactylPanel: (req, res) => {
    GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
      if (server) {
        res.render("client/services", {
          title:
            app.config.company.name + " - Gestion du service : " + server.name,
          user: req.user[0],
          app,
          params: req.params,
          server,
          system: package_json,
        });
      } else {
        res.redirect("/client/")
      }
    });
  },

  PterodactylWebSocket: (req, res, next) => {
    GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
      GetWebSocket(server)
      res.json({
        success: true,
      });
    });
  },

  PteroFilesByDirectory: (req, res) => {
    GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
      GetFilesAndDirectorys(server, req.query.directory, function (directorys, files, route) {
        res.json({
          directorys,
          files,
          route,
        })
      })
    })
  },

  PterodactylFileManager: (req, res) => {
    GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
      res.render("client/services/files", {
        title: app.config.company.name + " - Gestionaire de fichiers ",
        user: req.user[0],
        app,
        params: req.params,
        server,
        system: package_json,
      });
    });
  },

  PterodactylFileEditor: (req, res) => {
    GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
      GetFileContent(server, req.query.file, function (code) {
        res.render("client/services/files/edit", {
          title: app.config.company.name + " - Editeur de code ",
          user: req.user[0],
          app,
          params: req.params,
          code,
          route: req.query.file,
          server,
          system: package_json,
        });
      });
    })
  },


};
