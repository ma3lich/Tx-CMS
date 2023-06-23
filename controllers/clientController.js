/* Importation des modules nodeJS */

const system = require('../package.json');
const fs = require('fs');
const path = require('path');

const { calcDate, config } = require('../config/customFunction');
const {
	GetPterodactylServerInfo,
	GetFilesAndDirectorys,
	GetFileContent,
} = require('../addons/servers/pterodactyl/requests');
const { GetWebSocket } = require('../addons/servers/pterodactyl/websocket');
const { PayaplCreatePayment } = require('../addons/payments/paypal/request');
const {
	StripeTaxeFR,
	StripeCreatePayment,
} = require('../addons/payments/stripe/request');
const {
	getUserStats,
	getUserServices,
	getLiveUserInfo,
	updateUserByID,
	getCatalogue,
	getCatalogueByType,
	getUserTransactions,
	generateInvoce,
	getUserTransactionById,
} = require('../functions/clientFunctions');
const { createInvoice } = require('../addons/invoice/create');

var productsInTheCart = [];

module.exports = {
	index: (req, res) => {
		getUserStats(req.user[0], function (stats) {
			getUserServices(req.user[0].id, function (services) {
				res.render('client/index', {
					title: config.host.name + ' - Espace Client',
					action: 'info',
					user: req.user[0],
					stats,
					services,
					config,
					system,
				});
			});
		});
	},

	/* Méthode Post pour la page client/index */
	logout: (req, res, next) => {
		console.log('logging out');
		console.log(req.user[0]);
		req.logOut((err) => {
			if (err) return next(err);
			req.session.destroy();
			res.redirect('/');
		});
	},

	getProfilePage: (req, res) => {
		getLiveUserInfo(req.user[0].id, function (user) {
			res.render('client/profile', {
				title: config.host.name + ' - Home',
				action: 'info',
				user,
				config,
				system,
			});
		});
	},

	submitProfile: (req, res) => {
		updateUserByID(req.body, req.user[0], function (response) {
			if (response.type == 'success') {
				req.flash('success-message', response.message);
				res.redirect('/client/profile');
			}

			if (response.type == 'error') {
				req.flash('error-message', response.message);
				res.redirect('/client/profile');
			}
		});
	},

	getWalletPage: (req, res) => {
		getUserStats(req.user[0], function (stats) {
			getUserTransactions(req.user[0].id, (transactions) => {
				res.render('client/profile/wallet', {
					title: config.host.name + ' - Wallet',
					action: 'info',
					user: req.user[0],
					transactions,
					config,
					system,
				});
			});
		});
	},

	generateInvocePage: async (req, res) => {
		const invoice = {
			shipping: {
				name: 'John Doe',
				address: '1234 Main Street',
				city: 'San Francisco',
				state: 'CA',
				country: 'US',
				postal_code: 94111,
			},
			items: [
				{
					item: 'TC 100',
					description: 'Toner Cartridge',
					quantity: 2,
					amount: 6000,
				},
				{
					item: 'USB_EXT',
					description: 'USB Cable Extender',
					quantity: 1,
					amount: 2000,
				},
			],
			subtotal: 8000,
			paid: 0,
			invoice_nr: `tx-${new Date().getFullYear()}-1234`,
		};
		const invoicePath = `./logs/invoices/${invoice.invoice_nr}.pdf`;

		if (fs.existsSync(invoicePath)) {
			const absolutePath = path.resolve(invoicePath);
			res.contentType('application/pdf');
			res.sendFile(absolutePath);
		} else {
			await createInvoice(invoice, invoicePath);
			const absolutePath = path.resolve(invoicePath);
			await res.contentType('application/pdf');
			await res.sendFile(absolutePath);
		}
	},

	/* Méthode Get pour la page client/shop */
	getShop: (req, res) => {
		getCatalogue((catalogueData) => {
			res.render('client/shop', {
				title: config.host.name + ' - Boutique',
				action: 'info',
				user: req.user[0],
				categories: catalogueData.categories,
				plans: catalogueData.plans,
				system,
			});
		});
	},

	/* Méthode Get pour la page client/shop/name */
	getShopByCategory: (req, res) => {
		getCatalogueByType(req.params, (catalogueData) => {
			res.render('client/shop/categories/', {
				title: config.host.name + ' - Offres ' + req.params.name.toUpperCase(),
				action: 'info',
				user: req.user[0],
				categories: catalogueData.categories,
				plans: catalogueData.plans,
				categoriesName: req.params.name.toUpperCase(),
				system,
			});
		});
	},

	getCart: (req, res) => {
		let products = [];

		db.query(
			`SELECT * FROM carts WHERE owner = ${req.user[0].id}`,
			function (err, results) {
				if (err) console.trace(err);
				else {
					results.forEach((plans) => {
						if (plans.amount > 0) {
							db.query(
								`SELECT * FROM plans WHERE id = ${plans.planID}`,
								function (error, data) {
									if (error) throw error;
									else {
										for (let plan of data) {
											products.push({
												id: plan.id,
												name: plan.name,
												categorie: plan.categorie,
												price: plan.price,
												fee: plan.fee,
												amount: plans.amount,
												id: plans.id,
											});
										}
									}
								},
							);
						}
					});

					productsInTheCart = products;

					res.render('client/shop/cart/', {
						title: app.config.company.name + ' - Panier',
						user: req.user[0],

						system,
						tva: getEnVvalue('TVA_RATE'),
						userCart: results,
						cartPlans: products,
					});
				}
			},
		);
	},

	addToCart: (req, res) => {
		db.query(
			`SELECT * FROM carts WHERE planID = ${req.params.id} AND owner = ${req.user[0].id}`,
			(err, data) => {
				if (err) console.trace(err);
				if (data.length > 0) {
					console.log('update');

					let newAmount = data[0].amount + Number(req.body.amount);
					db.query(
						`UPDATE carts SET amount = ${newAmount} WHERE planID = ${req.params.id}`,
						function (err) {
							if (err) console.trace(err);
							res.redirect('/client/shop/cart');
						},
					);
				} else {
					console.log('new');
					db.query(
						`INSERT INTO carts (owner, planID, amount) VALUES ('${req.user[0].id}', '${req.params.id}', '${req.body.amount}')`,
						function (err, sucess) {
							if (err) console.trace(err);
							res.redirect('/client/shop/cart');
						},
					);
				}
			},
		);
	},

	removeFromCart: (req, res) => {
		db.query(
			`DELETE FROM carts WHERE owner = ${req.user[0].id} AND id = ${req.params.id}`,
			(data, err) => {
				res.redirect('/client/shop/cart');
			},
		);
	},

	checkoutCart: async (req, res) => {
		let items = [];
		let line_items = [];

		for (let item of productsInTheCart) {
			items.push({
				// Paypal array of products
				name: item.name,
				sku: `${item.id}`,
				price: item.price,
				currency: 'EUR',
				quantity: item.amount,
			});
			line_items.push({
				// Stripe array of products
				quantity: item.amount,
				tax_rates: [StripeTaxeFR().id],
				price_data: {
					currency: 'EUR',
					unit_amount: item.price * 100 + item.fee * 100,
					tax_behavior: 'exclusive',
					product_data: {
						name: item.name,
					},
				},
			});
		}

		let paypalOptions = {
			intent: 'sale',
			payer: {
				payment_method: 'paypal',
			},
			redirect_urls: {
				return_url: 'http://localhost:2004/client/shop/cart/checkout/success',
				cancel_url: 'http://localhost:2004/client/shop/cart/checkout/cancel',
			},
			transactions: [
				{
					item_list: {
						shipping_address: {
							line1: req.body.adresse1,
							line2: req.body.adresse2,
							city: req.body.city,
							country_code: req.body.country,
							postal_code: req.body.zip,
							state: req.body.state,
							phone: req.body.tel,
						},
						shipping_phone_number: req.body.tel,
					},
					amount: {
						currency: 'EUR',
						details: {
							subtotal: req.query.subtotal,
							tax: req.query.tva,
							shipping: req.query.fees,

							//"shipping_discout": req.query.promo
						},
						total: req.query.total,
					},
					description: app.config.company.name,
				},
			],
		};

		let StripeOptions = {
			payment_method_types: ['card'],
			submit_type: 'pay',
			line_items: line_items,
			locale: 'fr',
			mode: 'payment',
			success_url: `http://localhost:2004/client/shop/cart/checkout/success`,
			cancel_url: `http://localhost:2004/client/shop/cart/checkout/cancel`,
		};

		if (req.query.getway == 'paypal') {
			if (items.length > 0) {
				PayaplCreatePayment(
					paypalOptions,
					req.user[0],
					productsInTheCart,
					req.query,
					function (paymentLink) {
						db.query(
							`DELETE FROM carts WHERE owner = ${req.user[0].id}`,
							(data, err) => {
								res.redirect(303, paymentLink);
							},
						);
					},
				);
				// Créé une facture ici
			} else {
				res.redirect('/client/shop/cart');
			}
		}

		if (req.query.getway == 'stripe') {
			if (line_items.length > 0) {
				StripeCreatePayment(
					StripeOptions,
					req.user[0],
					productsInTheCart,
					req.query,
					function (paymentLink) {
						db.query(
							`DELETE FROM carts WHERE owner = ${req.user[0].id}`,
							(data, err) => {
								res.redirect(303, paymentLink);
							},
						);
					},
				);
			} else {
				res.redirect('/client/shop/cart');
			}
		}
	},

	CancelCheckoutPage: (req, res) => {
		res.render('client/shop/cart/checkout/cancel', {
			title: app.config.company.name + ' - success',
			user: req.user[0],

			system: package_json,
		});
	},

	SuccesCheckoutPage: (req, res) => {
		db.query(
			`SELECT * FROM transactions WHERE owner = ${req.user[0].id} ORDER BY id desc LIMIT 1`,
			(err, data) => {
				if (err) console.debug(err);
				db.query(
					`DELETE FROM carts WHERE owner = ${req.user[0].id}`,
					function (success, err) {
						if (err) console.debug(err);
						db.query(
							`UPDATE transactions SET state = 'success' WHERE id = ${
								JSON.parse(JSON.stringify(data))[0].id
							}`,
							function (success, err) {
								if (err) console.debug(err);
								res.render('client/shop/cart/checkout/success', {
									title: app.config.company.name + ' - success',
									user: req.user[0],

									system,
								});
							},
						);
					},
				);
			},
		);
	},

	// Gestion d'un service Pterodactyl

	PterodactylPanel: (req, res) => {
		GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
			if (server) {
				res.render('client/services', {
					title: config.host.name + ' - Gestion du service : ' + server.name,
					user: req.user[0],
					config,
					params: req.params,
					server,
					system,
				});
			} else {
				res.redirect('/client/');
			}
		});
	},

	PterodactylWebSocket: (req, res, next) => {
		GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
			GetWebSocket(server);
			res.json({
				success: true,
			});
		});
	},

	PteroFilesByDirectory: (req, res) => {
		GetPterodactylServerInfo(req.params.id, req.user[0].id, function (server) {
			GetFilesAndDirectorys(
				server,
				req.query.directory,
				function (directorys, files, route) {
					res.json({
						directorys,
						files,
						route,
					});
				},
			);
		});
	},

	PterodactylFileManager: (req, res) => {
		GetConfigVariables(function (config) {
			GetPterodactylServerInfo(
				req.params.id,
				req.user[0].id,
				function (server) {
					res.render('client/services/files', {
						title: config.host.name + ' - Gestionaire de fichiers ',
						user: req.user[0],
						config,
						params: req.params,
						server,
						system,
					});
				},
			);
		});
	},

	PterodactylFileEditor: (req, res) => {
		GetConfigVariables(function (config) {
			GetPterodactylServerInfo(
				req.params.id,
				req.user[0].id,
				function (server) {
					GetFileContent(server, req.query.file, function (code) {
						res.render('client/services/files/edit', {
							title: config.host.name + ' - Editeur de code ',
							user: req.user[0],
							config,
							params: req.params,
							code,
							route: req.query.file,
							server,
							system,
						});
					});
				},
			);
		});
	},
};
