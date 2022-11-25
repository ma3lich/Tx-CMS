const { createConnection } = require("mysql");
const database = require("./database.json");
const ora = require('ora');
const chalk = require('chalk');

const spinner = ora();
spinner.start(`${chalk.yellow("Connexion à la base de données...")}`);

const db = createConnection({
  host: database.config.host,
  port: database.config.port,
  user: database.config.user,
  password: database.config.password,
  database: database.config.dbname,
});

/*Test de connexion a la base de donné*/
db.connect(err => {
  if (err) {
    console.debug(err);
    spinner.fail(`${chalk.red("La connexion à la base de données a échoué !")}`)
  }else{
    spinner.succeed(`${chalk.green("La connexion à la base de données a réussi !")}`);
  }
});

module.exports = db;
