const { createConnection } = require("mysql");
const database = require("./database.json");

const db = createConnection({
  /* It's a property of the database.json file. */ host: database.config.host,
  port: database.config.port,
  user: database.config.user,
  password: database.config.password,
  database: database.config.dbname,
});

/*Test de connexion a la base de donné*/
db.connect(err => {
  if (err) throw err;
  console.log("La base de donneés est connecté");
});

module.exports = db;
