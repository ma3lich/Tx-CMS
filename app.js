console.clear();
const ora = require("ora");
const chalk = require("chalk");

const spinner = ora();
spinner.start(`${chalk.yellow("Lancement de TxCMS sur le serveur")}`);

const db = require("./config/database.js");
const txcms = require("./config/app.json");
const { getEnVvalue } = require("./config/config.js");



main();


function main() {
  /*Importation des modules nodeJS*/
  const express = require("express");
  const path = require("path");
  const session = require("express-session");
  const passport = require("passport");
  const bodyParser = require("body-parser"); // parser middleware
  const MySQLStore = require("express-mysql-session")(session);
  const hbs = require("express-handlebars");
  const flash = require("connect-flash");
  const { serverIP } = require("./config/customFunction.js");

  const sessionStore = new MySQLStore({} /* session store options */, db);

  const app = express();

  /* Configure Express*/

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));

  /*Flash And Session*/

  app.use(
    session({
      key: "txcms-session",
      secret: "txcms>clientxcms",
      store: sessionStore,
      saveUninitialized: false,
      resave: false,
    })
  );
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());

  app.use(
    (req, res, next) => {
      res.locals.success_messages = req.flash("success-message");
      res.locals.error_messages = req.flash("error-message");
      next();
    }
  );

  /* Gestion des view (handlebars)*/

  app.engine(
    "handlebars",
    hbs.engine({
      defaultLayout: "default.handlebars",
      layoutsDir: "views/layouts",
      partialsDir: "views/partials",
    })
  );
  app.set("view engine", "handlebars");

  /* Gestion des routes */

  const defaultRoutes = require("./routes/defaultRoutes.js");
  const adminRoutes = require("./routes/adminRoutes.js");
  const clientRoutes = require("./routes/clientRoutes.js");

  app.use("/", defaultRoutes);
  app.use("/admin", adminRoutes);
  app.use("/client", clientRoutes);

  /*Lancement de l'application web */
  app.listen(getEnVvalue('APP_PORT'), () => {
    spinner.succeed(
      `${chalk.green(
        "Lancement de TxCMS réussi sur : " +
        chalk.dim.white(
          "\n\n" +
          "   http://" +
          serverIP +
          ":" +
          getEnVvalue('APP_PORT') +
          "\n" +
          "   https://" +
          getEnVvalue('APP_URL') +
          ":" +
          getEnVvalue('APP_PORT') +
          "\n"
        )
      )}`
    );
  });
}
