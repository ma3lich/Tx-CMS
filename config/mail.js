const {createTransport} = require('nodemailer');
const smtp = require('./smtp.json').config;

const mailserver = createTransport({
    host: "mail52.lwspanel.com",
    port: 587,
    secure: false,
    auth: {
      user: "txcms@ma3lich.fr",
      pass: "bZ9-_aUhSk1NywE"
    }
});

module.exports = mailserver;