const fs = require("fs");
var ip = require("ip");
const mailserver = require("./mail.js");
const app = require("./app.json");
const smtp = require("./smtp.json");
const nodemailer = require("nodemailer");
const db = require("./database");

const Nodeactyl = require("nodeactyl");
const { pterodactylApp, pterodactylClient } = require("../private/servers");
const { json } = require("body-parser");
const application = new Nodeactyl.NodeactylApplication(
  "https://panel.txhost.fr",
  "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
);

let client = new Nodeactyl.NodeactylClient(
  "https://panel.txhost.fr",
  "ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB"
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
      return callback(eggs);
    });
  },

  getPterodactylServerInfo: (serviceID, userID, callback) => {
    db.query(
      `SELECT * FROM services WHERE owner = ${userID} AND id = ${serviceID} `,
      function (err, data) {
        if(data.length > 0){
          var service = JSON.parse(JSON.stringify(data))[0];
          let server = [];
  
          client.getServerDetails(service.serverID).then((details) => {
            client.getConsoleWebSocket(service.serverID).then((socket) => {
              server.push({
                name: details.name,
                id: details.identifier,
                uuid: details.uuid,
                node: details.node,
                ip: details.sftp_details.ip,
                port: details.sftp_details.port,
                console: socket,
              });
  
              return callback(server[0]);
            });
          });
        }else{
          return callback(false);
        }
      }
    );
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
};
