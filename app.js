const LicenseKey = require("./private/license.js");
const txcms = require("./config/app.json");

// Lancer l'application en cas de validité de la license
LicenseKey.then((license) => {
  main();
}).catch(function (error) {
  // Return une erreur en cas d'invalidité de la license
  console.log(error.message);
});

function main() {
  /*Importation des modules nodeJS*/
  const express = require("express");
  const db = require("./config/database.js");
  const path = require("path");
  const session = require("express-session");
  const passport = require("passport");
  const cookieParser = require("cookie-parser");
  const MySQLStore = require("express-mysql-session")(session);
  const hbs = require("express-handlebars");
  const flash = require("express-flash");
  const { serverIP } = require("./config/customFunction.js");

  const sessionStore = new MySQLStore({} /* session store options */, db);

  const app = express();

  /* Configure Express*/

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "public")));

  /*Flash And Session*/

  app.use(cookieParser());
  app.use(
    session({
      key: "txcms-cookie",
      secret: "txcmsbytxhost",
      store: sessionStore,
      saveUninitialized: true,
      resave: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash());

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
  app.listen(txcms.config.system.port, () => {
    console.log(
      "TxCMS est lancer !" +
        "\n\n" +
        "https://" +
        serverIP +
        ":" +
        txcms.config.system.port +
        "\n" +
        "https://" +
        txcms.config.system.hostname +
        ":" +
        txcms.config.system.port
    );
  });
}
