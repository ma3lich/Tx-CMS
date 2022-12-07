const { createConnection } = require("mysql");
const ora = require('ora');
const chalk = require('chalk');
const { getEnVvalue } = require("./config");


const spinner = ora();
spinner.start(`${chalk.yellow("Connexion à la base de données...")}`);

const db = createConnection({
  host: getEnVvalue('DB_HOST'),
  port: getEnVvalue('DB_PORT'),
  user: getEnVvalue('DB_USERNAME'),
  password: getEnVvalue('DB_PASSWORD'),
  database: getEnVvalue('DB_DATABASE'),
});

/*Test de connexion a la base de donné*/
db.connect(err => {
  if (err) {
    console.debug(err);
    spinner.fail(`${chalk.red("La connexion à la base de données a échoué !")}`)
  } else {
    spinner.succeed(`${chalk.green("La connexion à la base de données a réussi !")}`);
  }
});

module.exports = db;
