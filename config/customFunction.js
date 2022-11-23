const fs = require("fs");
var ip = require("ip");
const mailserver = require("./mail.js");
const app = require("./app.json");
const smtp = require("./smtp.json");
const nodemailer = require("nodemailer");
const db = require("./database");

const Nodeactyl = require("nodeactyl");
const application = new Nodeactyl.NodeactylApplication(
  "https://panel.txhost.fr",
  "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
);

module.exports = {
  isUserAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/");
  },

  isUserAdmin: (req, res, next) => {
    if (req.user[0].role === "admin") next();
    else res.redirect("/client");
  },

  sendMail: async (to, subject, text, html) => {
    let info = await mailserver.sendMail({
      from: `"${app.config.company.name}" <${smtp.config.auth.user}>`,
      to: to,
      subject: subject,
      text,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log(`Email sent from ${smtp.config.auth.user} to ${to}`);
  },

  getUserStats: (user, callback) => {
    let stats = [];
    db.query(
      `SELECT COUNT(*) AS transactionsCount FROM transactions`,
      function (err, data) {
        console.log(JSON.parse(JSON.stringify(data))[0].transactionsCount);
        stats.push({
          wallet: user.wallet.toLocaleString("fr-FR", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
          services: "",
          transactions: JSON.parse(
            JSON.stringify(data)
          )[0].transactionsCount.toLocaleString("fr-FR", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
          tickets: "",
        });
        console.log(stats[0]);
        return callback(stats[0]);
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
                "SELECT COUNT(*) AS serversCount FROM servers",
                (err, serversCount) => {
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
                    servers: JSON.parse(
                      JSON.stringify(serversCount)
                    )[0].serversCount.toLocaleString("fr-FR", {
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

  getPterodactylNodes: (callback) => {
    let nodes = [];
    application.getNodePage().then((response) => {
      response.forEach((node) => {
        nodes.push({
          id: node.attributes.id,
          name: node.attributes.name,
          fqdn: node.attributes.fqdn,
          memory: node.attributes.memory,
          disk: node.attributes.disk,
        });
      });
      return callback(nodes);
    });
  },

  getPterodactylEggs: (callback) => {
    let eggs = [];

    application.getAllEggs().then((result) => {
      for (const egg of result) {
        eggs.push({
          id: egg.attributes.id,
          name: egg.attributes.name,
        });
      }

      return callback(eggs);
    });
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
};
