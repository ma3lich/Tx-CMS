const {createTransport} = require('nodemailer');
const smtp = require('./smtp.json').config;

const mailserver = createTransport(smtp);

module.exports = mailserver;