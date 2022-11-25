const ora = require("ora");
const chalk = require("chalk");

const spinner = ora();
spinner.start(`${chalk.yellow("Vérification de la clé de license...")}`);

/* Importation de la clé dans le fichier config*/
const app = require("../config/app.json");

/* Importation des modules nodeJS */
const key = require("cryptolens").Key;
const Helpers = require("cryptolens").Helpers;

/* Configuration de cryptolens */
var RSAPubKey =
  "<RSAKeyValue><Modulus>nQwdWvCh7VtkF/0Wd4Xe2FSCvZH05QMOCrbdvI9K9iy1tniMkip4/CPiS7UgfhCpNOpU7LkrUY/Di7VGvDF05ouUFly70n3SiKOvEK/JsQufP/tQaTrQiaSn4jnR7BEjcHGErStwDeA10UHfIME4Tpq/t1DybT2GmnhUd/456nYJetlRjNckZHfwhansFR4g0pwB3hcUHnb7Du7NWgN6yk1vCwhcrHHoMtW0kICB/AO8owWEzrGUERGqcRZzrN7W3dCqpYMoXpyZX+qgjbir+2YCIl6PgJKifGyNcOzFGhfS/FPxPwqdHzIJqSFbhEQ7sL0Me1F1eTS07dpvlH1alQ==</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>";
var result = key.Activate(
  (token =
    "WyIyODA3NjI4MiIsIlFjVkZMdFdHdFZtTHAzM0I4U2VaejY0K01WeXRHMVVmdFJtUDFjVTkiXQ=="),
  RSAPubKey,
  (ProductId = 17312),
  (Key = app.config.system.license),
  (MachineCode = Helpers.GetMachineCode())
);

/* Vérification de la clé */
result
  .then((license) => {
    spinner.succeed(
      `${chalk.green(
        "La vérification de la clé de license a réussi !"
      )} ${chalk.dim("(" + license.Key + ")")}`
    );
    console.log;
  })
  .catch((error) => {
    console.log(error.message);
    spinner.fail(
      `${chalk.red("La vérification de la clé de license a échoué !")}`
    );
  });

/* Exportation du résultats*/
module.exports = result;
