/* Importation des modules nodeJS */
const bcrypt = require("bcrypt");
const db = require("../config/database");
const app = require("../config/app.json");
const package_json = require("../package.json");
const adminLogs = require('logger').createLogger('./logs/admin_logs.log');
// const stripe = require('stripe')('sk_test_51LaQfvH8EjxIHb36wkTV1HpLCKgWqbjff1oTa3QUvGGtltNEd1mEMhXcY4bowjGVbGbowstzLdT1cT2eEXiiArv000Y6m07ixd');

module.exports = {
  /* Méthode Get pour la page client/index */
  index: (req, res) => {
    res.render("client/index", {
      title: app.config.company.name + " - Espace Client",
      action: "info",
      user: req.user[0],
      app: app,
      system: package_json,
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
    res.render("client/profile", {
      title: app.config.company.name + " - Home",
      action: "info",
      user: req.user[0],
      app: app,
      system: package_json,
    });
  },

  /* Méthode Post pour la page client/profile */
  submitProfile: (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        db.query(
          `UPDATE users SET name = '${req.body.name}', lastname = '${req.body.lastname}', password = '${hash}', sexe = '${req.body.sexe}', usernote = '${req.body.userNote}' , logo = '${req.body.logo}' WHERE id = ${req.user[0].id}`,
          function (success, err) {
            req.flash("success-message", "Utilisateur Créé !"),
              res.redirect("/client");
          }
        );
      });
    });
  },

  /* Méthode Get pour la page client/shop */
  getShop: (req, res) => {
    db.query(
      `SELECT * FROM plans WHERE state = "public" ORDER BY selled DESC LIMIT 6`,
      function (err, data) {
        if (err) throw err;
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
  getShopByCategorie: (req, res) => {
    const name = req.params.name;

    db.query(
      `SELECT * FROM plans WHERE categorie = "${name}" AND state = "public"`,
      function (err, data) {
        if (err) throw err;
        else {
          db.query(
            `SELECT * FROM categories ORDER BY id`,
            function (error, results) {
              if (error) throw error;
              else
                res.render("client/shop/products/", {
                  title: app.config.company.name + " - Boutique",
                  action: "info",
                  user: req.user[0],
                  categories: JSON.parse(JSON.stringify(results)),
                  plans: data,
                  categoriesName: name,
                  app: app,
                  system: package_json,
                });
            }
          );
        }
      }
    );
  },

  getCart: (req, res) => {
    let id = req.user[0].id;
    let products = [];

    db.query(
      `SELECT * FROM carts WHERE owner = ${id}`,
      function (err, results) {
        if (err) throw err;
        else {
          results.forEach((plans) => {
            if (plans.amount > 0) {
              db.query(
                `SELECT * FROM plans WHERE id = ${plans.planID}`,
                function (error, data) {
                  if (error) throw error;
                  else {
                    data.forEach((plan) => {
                      products.push({
                        id: plan.id,
                        name: plan.name,
                        categorie: plan.categorie,
                        price: plan.price,
                        fee: plan.fee,
                        amount: plans.amount,
                      });

                    });
                  }
                  res.render("client/shop/cart/", {
                    title: app.config.company.name + " - Panier",
                    user: req.user[0],
                    app: app,
                    system: package_json,
                    userCart: results,
                    cartPlans: products,
                  });
                }
              );
            }
          });
        }
      }
    );
  },

  addToCart:(req, res) => {
    id = req.params.id
    db.query(`SELECT * FROM carts WHERE planID = ${id}`, function(err, results) {
      if(results !== []){
        console.log("new")
        db.query(
          `INSERT INTO carts (owner, planID, amount) VALUES ('${req.user[0].id}', '${id}', '${req.body.amount}')`, function(err, sucess) {
            res.redirect("/client/shop/cart");
          }
        );
      } else{
        console.log("update")
        let newAmount = JSON.parse(JSON.stringify(results))[0].amount + Number(req.body.amount)
        console.log(newAmount)
        db.query(`UPDATE carts SET amount = ${newAmount}`, function(err) {
          res.redirect("/client/shop/cart");
        })
      }
    })
  },

  checkoutCart:(req, res) => {
    console.log(req.body)
  },
};
