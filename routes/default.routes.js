const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../config/database");
const { sendMail } = require("../config/customFunction");
const { Login } = require("../templates/emails/templates_emails");

const {
  loginGet,
  registerGet,
  registerPost,
} = require("../controllers/defaultController");

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
          if (error) {return done(error, {message: "404"})}; 
          if (!user) return done(null, false, { message: 'Incorrect username or password.' });

          const userData = JSON.parse(JSON.stringify(user))[0];

          bcrypt.compare(
            password,
            userData.password,
            (err, passwordMatched) => {
              if (err) return err;
              if (!passwordMatched) return done(null, false, { message: 'Incorrect username or password.' });;

              //sendMail(userData.email, "Nouvelle connexion", "", Login);
              return done(null, user);
            }
          );
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
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
router.route("/error").get(
  (req, res, next) =>{
    res.status(500).json({
      message: "Internal Server Error",
  })}
  
)
module.exports = router;