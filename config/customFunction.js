const ip = require("ip");
const app = require("./app.json");
const db = require("./database");
const bcrypt = require("bcrypt");


const fs = require("fs");

const Nodeactyl = require("nodeactyl");
const { getEnVvalue } = require("./config");
const MailServer = require("./mailservice");

const application = new Nodeactyl.NodeactylApplication(
  "https://panel.txhost.fr",
  "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
);

module.exports = {
  GetConfigVariables: (callback) => {
    let config = {
      system: {
        hostname: getEnVvalue("APP_URL"),
        port: getEnVvalue("APP_PORT"),
        license: getEnVvalue("APP_LICENSE_KEY"),
        locale: getEnVvalue("APP_LOCALE"),
        timezone: getEnVvalue("APP_TIMEZONE"),
      },
      database: {
        hostname: getEnVvalue("DB_HOST"),
        port: getEnVvalue("DB_PORT"),
        database: getEnVvalue("DB_DATABASE"),
        username: getEnVvalue("DB_USERNAME"),
        password: getEnVvalue("DB_PASSWORD"),
      },
      mail: {
        hostname: getEnVvalue("MAIL_HOST"),
        port: getEnVvalue("MAIL_PORT"),
        secure: getEnVvalue("MAIL_SECURE"),
        username: getEnVvalue("MAIL_USERNAME"),
        password: getEnVvalue("MAIL_PASSWORD"),
      },
      host: {
        name: getEnVvalue("HOST_NAME"),
        description: getEnVvalue("HOST_DESCRIPTION"),
        logo: getEnVvalue("HOST_LOGO"),
        hostname: getEnVvalue("HOST_HOSTNAME"),
        address: getEnVvalue("HOST_ADDRESS"),
        zip: getEnVvalue("HOST_ZIP"),
        city: getEnVvalue("HOST_CITY"),
        country: getEnVvalue("HOST_COUNTRY"),
        legals: getEnVvalue("HOST_LEGALS"),
        privacy: getEnVvalue("HOST_PRIVACY")
      },
      addons: {
        paypal: {
          enable: getEnVvalue("PAYPAL"),
          public: getEnVvalue("PAYPAL_PUBLIC"),
          secret: getEnVvalue("PAYPAL_SECRET"),
        },
        stripe: {
          enable: getEnVvalue("STRIPE"),
          public: getEnVvalue("STRIPE_PUBLIC"),
          secret: getEnVvalue("STRIPE_SECRET"),
        },

        wallet: {
          enable: getEnVvalue("WALLET"),
        }
      }
    };

    return callback(config);
  },

  isUserAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/");
  },

  isUserAdmin: (req, res, next) => {
    if (req.user[0].role === "admin") next();
    else res.redirect("/client");
  },

  sendEmail: (to, subject, text, html, callback) => {
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

  getUserStats: (user, callback) => {
    let stats = [];
    db.query(
      `SELECT COUNT(*) AS transactionsCount FROM transactions`,
      function (err, data) {
        db.query(
          `SELECT COUNT(*) AS servicesCount FROM services`,
          function (err, res) {
            stats.push({
              wallet: user.wallet.toLocaleString("fr-FR", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }),
              services: JSON.parse(
                JSON.stringify(res)
              )[0].servicesCount.toLocaleString("fr-FR", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }),
              transactions: JSON.parse(
                JSON.stringify(data)
              )[0].transactionsCount.toLocaleString("fr-FR", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }),
              tickets: "",
            });
            return callback(stats[0]);
          }
        );
      }
    );
  },

  getHostStats: (callback) => {
    let stats = [];
    db.query("SELECT COUNT(*) AS userCount FROM users", (err, usersCount) => {
      if (err) throw err;
      db.query(
        "SELECT COUNT(*) AS clientsCount FROM transactions",
        (err, clientsCount) => {
          if (err) throw err;
          db.query(
            "SELECT COUNT(*) AS servicesCount FROM services",
            (err, servicesCount) => {
              if (err) throw err;
              db.query(
                "SELECT COUNT(*) AS ticketsCount FROM tickets",
                (err, ticketsCount) => {
                  if (err) throw err;
                  stats.push({
                    users: JSON.parse(
                      JSON.stringify(usersCount)
                    )[0].userCount.toLocaleString("fr-FR", {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    }),
                    clients: JSON.parse(
                      JSON.stringify(clientsCount)
                    )[0].clientsCount.toLocaleString("fr-FR", {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    }),
                    services: JSON.parse(
                      JSON.stringify(servicesCount)
                    )[0].servicesCount.toLocaleString("fr-FR", {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    }),
                    tickets: JSON.parse(
                      JSON.stringify(ticketsCount)
                    )[0].ticketsCount.toLocaleString("fr-FR", {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    }),
                  });

                  return callback(stats[0]);
                }
              );
            }
          );
        }
      );
    });
  },

  getBestSelledProducts: (callback) => {
    let plans = [];
    db.query("SELECT * FROM plans ORDER BY sold DESC LIMIT 3", (err, data) => {
      if (err) req.flash("error-message", err);
      else
        data.forEach(plan => {
          db.query(`SELECT * FROM categories WHERE id = ${plan.category}`, (err, result) => {
            if (err) req.flash("error-message", err);
            else
              result.forEach(category => {
                plans.push({
                  name: plan.name,
                  category: category.name,
                  sold: plan.sold,
                  stock: plan.stock,
                  price: plan.price,
                  incomme: Number(Number(plan.price) * Number(plan.sold)).toFixed(2).toString()
                })
              })
          })
          return callback(plans)
        });
    })
  },


  serverIP: ip.address(),

  jsonReader: (filePath, cb) => {
    fs.readFile(filePath, (err, fileData) => {
      if (err) return cb && cb(err);
      try {
        return cb && cb(null, object);
      } catch (err) {
        return cb && cb(err);
      }
    });
  },

  timeSince: (date) => {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " ans";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " mois";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " jours";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " heures";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " secondes";
  },

  calcDate: (startDate, endDate) => {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return dates.length;
  },

  getFileExtension: (filename) => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  },

  getDirectories: (path) => {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path + '/' + file).isDirectory();
    });
  }
};
