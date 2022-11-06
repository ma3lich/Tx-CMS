/* Importation des modules nodeJS */
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../config/database");
const nodemailer = require("nodemailer");
const config = require("config");
const mailserver = require("../config/mail");
const app = require("../config/app.json");
const social = require("../config/social.json");
const package_json = require("../package.json");
const adminLogs = require('logger').createLogger('./logs/admin_logs.log');


/* Configuration passport par email */

passport.serializeUser(function (email, done) {
  done(null, email);
});

passport.deserializeUser(function (email, done) {
  done(null, email);
});

module.exports = {
  /* Méthode Get pour la page index */
  loginGet: (req, res) => {
    db.query("SELECT COUNT(*) AS userCount FROM users", (err, usersCount) => {
      if (err) throw err;
      db.query(
        "SELECT COUNT(*) AS clientsCount FROM users WHERE id = 11",
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
                  res.render("default/index", {
                    title: app.config.company.name + " - Connectez vous",
                    action: "info",
                    usersCount: JSON.parse(JSON.stringify(usersCount))[0]
                      .userCount,
                    clientsCount: JSON.parse(JSON.stringify(clientsCount))[0]
                      .clientsCount,
                    servicesCount: JSON.parse(JSON.stringify(servicesCount))[0]
                      .servicesCount,
                    serversCount: JSON.parse(JSON.stringify(serversCount))[0]
                      .serversCount,
                    app: app,
                    social: social,
                    system: package_json,
                  });
                }
              );
            }
          );
        }
      );
    });
  },

  /* Méthode Post pour la page index */
  loginPost: async function (req, res) {
    let info = await mailserver.sendMail({
      from: `"${config.get("TxCMS.company.name")}" ${config.get(
        "TxCMS.mail.auth.user"
      )}`,
      to: req.user[0].email,
      subject: "Nouvelle connection",
      html: `
            Pour des raisons de sécurité, nous devons vérifier votre identité pour confirmer la vérification de votre adresse email, veuillez cliquer sur le bouton ci-dessous
            <br>
            <strong>Adresse E-mail</strong> : ${req.user[0].email}
            <br>
            <strong>Date d'inscription</strong> : ${new Date()}`,
    });

    console.log("Message sent: %s", info.messageId);
  },

  /* Méthode Get pour la page /register */
  registerGet: (req, res) => {
    res.render("default/register", { title: "TxCMS - Créé votre compte" });
  },

  /* Méthode Post pour la page index */
  registerPost: (req, res) => {
    db.query(
      `SELECT * FROM users WHERE email = ${req.body.email}`,
      function (err, data) {
        if (data) req.flash("error-message", "Email déja utiliser");
        else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
              db.query(
                `INSERT INTO users ( name, lastname, email, password, sexe, birthday) VALUES ('${req.body.name}', '${req.body.lastname}', '${req.body.email}', '${hash}', '${req.body.sexe}', '${req.body.birthday}')`,
                async function (success, err) {
                  req.flash("success-message", "Votre compte a était creé"),
                  res.redirect("/");

                  adminLogs.setLevel('debug');
                  adminLogs.debug(` : l'utilisateur : ${userData.email}, vien de crée son compte !`);

                  const mail = req.body.email;
                  const mailMsg =
                    `\n Bienvenu, ${req.body.name} sur TxCMS ✔ ` +
                    `\n Votre Email : ${req.body.email} ` +
                    `\n Votre Mot De Passe : ${req.body.password} `;

                  let info = await mailserver.sendMail({
                    from: '"TxCMS 👻" <txcms@ma3lich.fr>',
                    to: mail,
                    subject: "TxCMS",
                    text: mailMsg,
                  });

                  console.log("Message sent: %s", info.messageId);
                  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                }
              );
            });
          });
        }
      }
    );
  },
};
