const express = require("express");
const adminLogs = require('logger').createLogger('./logs/admin_logs.log');

const {
  loginGet,
  registerGet,
  registerPost,
} = require("../controllers/defaultController");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../config/database");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "default";
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    function verify(req, email, password, done) {
      db.query(
        `SELECT * FROM users WHERE email = "${email}"`,
        async function (error, user, fields) {
          if (error) return done(error); 
          if (!user) return done(null, false, { message: 'Incorrect username or password.' });

          const userData = JSON.parse(JSON.stringify(user))[0];

          bcrypt.compare(
            password,
            userData.password,
            (err, passwordMatched) => {
              if (err) return err;
              if (!passwordMatched) return done(null, false, { message: 'Incorrect username or password.' });;

              adminLogs.setLevel('debug');
              adminLogs.debug(` : l'utilisateur : ${userData.email}, vien de se connecter !`);
              return done(null, user);
            }
          );
        }
      );
    }
  )
);

passport.serializeUser(function (userData, done) {
  done(null, userData.id);
});

passport.deserializeUser(function (userData, done) {
  done(null, userData.id);
});

router
  .route("/")
  .get(loginGet)
  .post(
    passport.authenticate("local", {
      successRedirect: "/client",
      failureRedirect: "/error",
      failureFlash: true,
      successFlash: true,
    })
  );

router.route("/register").get(registerGet).post(registerPost);

module.exports = router;