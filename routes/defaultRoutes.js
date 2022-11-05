const express = require("express");
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
    (req, email, password, done) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async function (error, user, fields) {
          if (!user) return done(null, false);

          const userData = JSON.parse(JSON.stringify(user))[0];

          bcrypt.compare(
            password,
            userData.password,
            (err, passwordMatched) => {
              if (err) return err;

              if (!passwordMatched) return done(null, false);

              return done(null, user);
            }
          );
        }
      );
    }
  )
);

passport.serializeUser(function (userData, done) {
  done(null, userData.email);
});

passport.deserializeUser(function (userData, cb) {
  done(null, userData.email);
});

router
  .route("/")
  .get(loginGet)
  .post(
    passport.authenticate("local", {
      successRedirect: "/client",
      failureRedirect: "/",
      failureFlash: true,
      successFlash: true,
    })
  );

router.route("/register").get(registerGet).post(registerPost);

module.exports = router;