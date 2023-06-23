/* Importation des modules nodeJS */
const bcrypt = require('bcrypt');
const db = require('../config/database');
const nodemailer = require('nodemailer');
const { MailServer } = require('../config/mailservice');
const app = require('../config/app.json');
const social = require('../config/social.json');
const system = require('../package.json');
const { getCounts } = require('../functions/defaultFunctions');

/* Configuration passport par email */

module.exports = {
	/* Méthode Get pour la page index */
	loginGet: (req, res) => {
		getCounts((counts) => {
			res.render('default/index', {
				title: app.config.company.name + ' - Connectez vous',
				action: 'info',
        counts,
				app,
				social,
				system,
			}); 
		});
	},

	/* Méthode Post pour la page index */
	loginPost: async function (req, res) {
		let info = await MailServer.sendMail({
			from: `"${config.get('TxCMS.company.name')}" ${config.get(
				'TxCMS.mail.auth.user',
			)}`,
			to: req.user[0].email,
			subject: 'Nouvelle connection',
			html: `
            Pour des raisons de sécurité, nous devons vérifier votre identité pour confirmer la vérification de votre adresse email, veuillez cliquer sur le bouton ci-dessous
            <br>
            <strong>Adresse E-mail</strong> : ${req.user[0].email}
            <br>
            <strong>Date d'inscription</strong> : ${new Date()}`,
		});

		console.log('Message sent: %s', info.messageId);
	},

	/* Méthode Get pour la page /register */
	registerGet: (req, res) => {
		res.render('default/register', { title: 'TxCMS - Créé votre compte' });
	},

	/* Méthode Post pour la page index */
	registerPost: (req, res) => {
		db.query(
			`SELECT * FROM users WHERE email = ${req.body.email}`,
			function (err, data) {
				if (data) req.flash('error-message', 'Email déja utiliser');
				else {
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(req.body.password, 10, (err, hash) => {
							db.query(
								`INSERT INTO users ( name, lastname, email, password, sex, birthday) VALUES ('${req.body.name}', '${req.body.lastname}', '${req.body.email}', '${hash}', '${req.body.sex}', '${req.body.birthday}')`,
								async function (success, err) {
									req.flash('success-message', 'Votre compte a était creé'),
										res.redirect('/');

									adminLogs.setLevel('debug');
									adminLogs.debug(
										` : l'utilisateur : ${userData.email}, vien de crée son compte !`,
									);

									const mail = req.body.email;
									const mailMsg =
										`\n Bienvenu, ${req.body.name} sur TxCMS ✔ ` +
										`\n Votre Email : ${req.body.email} ` +
										`\n Votre Mot De Passe : ${req.body.password} `;

									let info = await mailserver.sendMail({
										from: '"TxCMS 👻" <txcms@ma3lich.fr>',
										to: mail,
										subject: 'TxCMS',
										text: mailMsg,
									});

									console.log('Message sent: %s', info.messageId);
									console.log(
										'Preview URL: %s',
										nodemailer.getTestMessageUrl(info),
									);
								},
							);
						});
					});
				}
			},
		);
	},
};
