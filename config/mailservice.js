const { createTransport } = require('nodemailer');
const { getEnVvalue } = require("./config");



const MailServer = createTransport({
  host: getEnVvalue('MAIL_HOST'),
  port: getEnVvalue('MAIL_PORT'),
  secure: false,
  auth: {
    user: getEnVvalue('MAIL_USERNAME'),
    pass: getEnVvalue('MAIL_PASSWORD'),
  }
});

module.exports = MailServer;