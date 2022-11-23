const Nodeactyl = require('nodeactyl');
const db = require('../config/database');
let pterodactyl = [];

module.exports = {
    pterodactylClient : new Nodeactyl.NodeactylClient(`${pterodactyl.fqdn}`, `${pterodactyl.clientapikey}`),
}