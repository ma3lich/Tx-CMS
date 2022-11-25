/* Importation des modules nodeJS */

const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const package_json = require("../package.json");
const adminLogs = require("logger").createLogger("./logs/admin_logs.log");
const paymentsSettings = require("../config/payments-gateways.json");
const paypal = require("paypal-rest-sdk");
const stripe = require("stripe")(paymentsSettings.config.stripe.secretKey);
const easyinvoice = require("easyinvoice");
const {
  getUserStats,
  getPterodactylServerInfo,
  timeSince,
  getFileExtension,
} = require("../config/customFunction");
const { pterodactylApp, pterodactylClient } = require("../private/servers");
const { response } = require("express");

var productsInTheCart = [];
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: paymentsSettings.config.paypal.client_id,
  client_secret: paymentsSettings.config.paypal.client_secret,
});

module.exports = {
  /* Méthode Get pour la page client/index */
  index: (req, res) => {
    getUserStats(req.user[0], function (userStats) {
      res.render("client/index", {
        title: app.config.company.name + " - Espace Client",
        action: "info",
        user: req.user[0],
        userStats,
        app: app,
        system: package_json,
      });
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
          app: app,
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
                  app: app,
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
              app: app,
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
            app: app,
            system: package_json,
            tva: paymentsSettings.config.tva,
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
    console.log(req.query);
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    var fs = require("fs");
    let items = [];
    let line_items = [];
    let itemsInvoice = [];

    const taxRate = await stripe.taxRates.create({
      display_name: "TVA",
      description: "impôt indirect sur la consommation",
      jurisdiction: "FR",
      percentage: 20,
      inclusive: false,
    });

    for (let item of productsInTheCart) {
      items.push({
        name: item.name,
        sku: `${item.id}`,
        price: item.price,
        currency: "EUR",
        quantity: item.amount,
      });
      itemsInvoice.push({
        quantity: item.amount,
        description: item.name,
        "tax-rate": paymentsSettings.config.tva,
        price: Number(Number(item.price) + Number(item.fee)),
      });
      line_items.push({
        quantity: item.amount,
        tax_rates: [taxRate.id],
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

    console.log(itemsInvoice);

    var create_inovice_json = {
      images: {
        logo: app.config.company.logo,
        background: fs.readFileSync(
          "./public/images/invocie-background.pdf",
          "base64"
        ),
      },
      sender: {
        company: app.config.company.name,
        address: app.config.company.adresse.adresse,
        zip: app.config.company.adresse.zip,
        city: app.config.company.adresse.city,
        country: app.config.company.country,
      },
      client: {
        company: req.user[0].lastname + " " + req.user[0].name,
        address: req.body.addresse1,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
      },
      information: {
        number: "Tx-01-0001",
        date: `${day}-${month}-${year}`,
        "due-date": `${day}-${month + 1}-${year}`,
      },
      products: itemsInvoice,
      "bottom-notice": "Merci d'avoir choisi " + app.config.company.name + " !",
      settings: {
        currency: "EUR",
        locale: "fr-FR",
        "tax-notation": "TVA",
      },
      translate: {
        invoice: "Facture",
        number: "Numéro",
        date: "Date",
        "due-date": "Date d'échéance",
        subtotal: "Sous total",
        products: "Produits",
        quantity: "Quantité",
        price: "Prix (+ frais)",
        "product-total": "Total",
        total: "Total",
      },
    };

    const paypal_json = {
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

    console.log(taxRate);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      submit_type: "pay",
      line_items: line_items,
      locale: "fr",
      mode: "payment",
      success_url: `http://localhost:2004/client/shop/cart/checkout/success`,
      cancel_url: `http://localhost:2004/client/shop/cart/checkout/cancel`,
    });

    if (req.query.getway == "paypal") {
      if (itemsInvoice.length > 0 && items.length > 0) {
        paypal.payment.create(paypal_json, function (error, payment) {
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                db.query(
                  `INSERT INTO transactions ( owner, date, products, total, state) VALUES ('${req.user[0].id}', '${year}-${month}-${day}', '${productsInTheCart}', '${req.query.total}', 'pending' )`,
                  function (success, err) {
                    if (err) console.log(err);

                    res.redirect(303, payment.links[i].href);

                    easyinvoice.createInvoice(
                      create_inovice_json,
                      function (result) {
                        fs.writeFileSync(
                          `tx-${req.user[0].id}-${year}-${month}-${day}-.pdf`,
                          result.pdf,
                          "base64"
                        );
                      }
                    );
                  }
                );
              }
            }
          }
        });
      } else {
        res.redirect("/client/shop/cart");
      }
    }

    if (req.query.getway == "stripe") {
      if (session) {
        db.query(
          `INSERT INTO transactions ( owner, date, products, total, state) VALUES ('${req.user[0].id}', '${year}-${month}-${day}', '${productsInTheCart}', '${req.query.total}', 'pending' )`,
          function (results, err) {
            if (err) console.debug(err);
            res.redirect(303, session.url);

            easyinvoice.createInvoice(create_inovice_json, function (result) {
              fs.writeFileSync(
                `tx-${req.user[0].id}-${year}-${month}-${day}-.pdf`,
                result.pdf,
                "base64"
              );
            });
          }
        );
      } else {
        res.redirect("/client/shop/cart");
      }
    }
  },

  cancelCheckout: (req, res) => {
    res.render("client/shop/cart/checkout/cancel", {
      title: app.config.company.name + " - success",
      user: req.user[0],
      app: app,
      system: package_json,
    });
  },

  successCheckout: (req, res) => {
    db.query(
      `SELECT * FROM transactions WHERE owner = ${req.user[0].id} ORDER BY id desc LIMIT 1`,
      (err, data) => {
        if (err) console.debug(err);
        db.query(
          `DELETE FROM carts WHERE owner = ${req.user[0].id}`,
          function (success, err) {
            if (err) console.debug(err);
            db.query(
              `UPDATE transactions SET state = 'success' WHERE id = ${
                JSON.parse(JSON.stringify(data))[0].id
              }`,
              function (success, err) {
                if (err) console.debug(err);
                res.render("client/shop/cart/checkout/success", {
                  title: app.config.company.name + " - success",
                  user: req.user[0],
                  app: app,
                  system: package_json,
                });
              }
            );
          }
        );
      }
    );
  },

  getServiceByID: (req, res) => {
    getPterodactylServerInfo("de76cb37", function (server) {
      res.render("client/services", {
        title:
          app.config.company.name + " - Gestion du service : " + server.name,
        user: req.user[0],
        app: app,
        params: req.params,
        server: server,
        system: package_json,
      });
    });
  },

  PteroActions: (req, res) => {
    const Nodeactyl = require("Nodeactyl");
    let client = new Nodeactyl.NodeactylClient(
      "https://panel.txhost.fr",
      "ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB"
    );

    switch (req.query.action) {
      case "start":
        client.startServer("de76cb37").then((response) => {
          res.redirect(`/client/services/${req.params.id}`);
        });
        break;

      case "restart":
        client.restartServer("de76cb37").then((response) => {
          res.redirect(`/client/services/${req.params.id}`);
        });
        break;

      case "stop":
        client.stopServer("de76cb37").then((response) => {
          res.redirect(`/client/services/${req.params.id}`);
        });
        break;

      case "kill":
        client.killServer("de76cb37").then((response) => {
          res.redirect(`/client/services/${req.params.id}`);
        });
        break;

      default:
        res.redirect(`/client/services/${req.params.id}`);
        break;
    }
  },

  PteroFiles: (req, res) => {
    const Nodeactyl = require("Nodeactyl");
    let client = new Nodeactyl.NodeactylClient(
      "https://panel.txhost.fr",
      "ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB"
    );

    let files = [];
    let directorys = [];

    getPterodactylServerInfo("de76cb37", function (server) {
      client.getServerFiles("de76cb37", "").then((response) => {
        response.forEach((file) => {
          console.log(file)
          if (file.attributes.mimetype == "inode/directory") {
            directorys.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: "Dossier",
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          } else {
            files.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: getFileExtension(file.attributes.name),
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          }
        });


        res.render("client/services/files", {
          title: app.config.company.name + " - Gestionaire de fichiers ",
          user: req.user[0],
          app: app,
          params: req.params,
          server,
          files,
          directorys,
          system: package_json,
        });
      });
    });
  },

  PteroFilesByDirectory : (req, res) => {
    const Nodeactyl = require("Nodeactyl");
    let client = new Nodeactyl.NodeactylClient(
      "https://panel.txhost.fr",
      "ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB"
    );

    let files = [];
    let directorys = [];

    getPterodactylServerInfo("de76cb37", function (server) {
      client.getServerFiles("de76cb37", req.params.directory).then((response) => {
        response.forEach((file) => {
          console.log(file)
          if (file.attributes.mimetype == "inode/directory") {
            directorys.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: "Dossier",
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          } else {
            files.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: getFileExtension(file.attributes.name),
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          }
        });


        res.render("client/services/files", {
          title: app.config.company.name + " - Gestionaire de fichiers ",
          user: req.user[0],
          app: app,
          params: req.params,
          server,
          files,
          directorys,
          system: package_json,
        });
      });
    });
  },
};
