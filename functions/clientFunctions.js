const { getEnVvalue } = require('../config/config');
const { calcDate, config } = require('../config/customFunction');
const db = require('../config/database');
const { getPlanByID } = require('./adminFunctions');
const fs = require('fs');

const PDFDocument = require('pdfkit');

module.exports = {
	getLiveUserInfo: (id, callback) => {
		db.query(`SELECT * FROM users WHERE id = ${id}`, function (err, data) {
			if (err) {
				return callback({
					type: 'error',
					message: err,
				});
			} else {
				return callback(data[0]);
			}
		});
	},

	getUserStats: (user, callback) => {
		db.query(
			`SELECT COUNT(*) AS transactionsCount FROM transactions WHERE user_id = ${user.id}`,
			(err, transactionData) => {
				if (err) throw err;

				db.query(
					`SELECT COUNT(*) AS servicesCount FROM services WHERE user_id = ${user.id}`,
					(err, serviceData) => {
						if (err) throw err;

						db.query(
							`SELECT COUNT(*) AS ticketsCount FROM tickets WHERE user_id = ${user.id}`,
							(err, ticketsData) => {
								if (err) throw err;

								db.query(
									`SELECT wallet AS walletCount FROM users WHERE id = ${user.id}`,
									(err, walletData) => {
										if (err) throw err;

										const wallet = walletData[0].walletCount.toLocaleString(
											config.system.locale,
											{
												minimumIntegerDigits: 2,
												useGrouping: false,
											},
										);

										const transactions =
											transactionData[0].transactionsCount.toLocaleString(
												config.system.locale,
												{
													minimumIntegerDigits: 2,
													useGrouping: false,
												},
											);

										const services =
											serviceData[0].servicesCount.toLocaleString(
												config.system.locale,
												{
													minimumIntegerDigits: 2,
													useGrouping: false,
												},
											);

										const tickets = ticketsData[0].ticketsCount.toLocaleString(
											config.system.locale,
											{
												minimumIntegerDigits: 2,
												useGrouping: false,
											},
										);

										const stats = {
											wallet,
											services,
											transactions,
											tickets,
										};

										callback(stats);
									},
								);
							},
						);
					},
				);
			},
		);
	},

	getUserServices: (id, callback) => {
		db.query(
			`SELECT id, name, created_at, finish_at, status FROM services WHERE user_id = ${id}`,
			function (err, servicesJson) {
				if (err) throw err;
				const services = servicesJson.map((service) => ({
					id: service.id,
					name: service.name,
					state: service.status,
					time: calcDate(service.created_at, service.finish_at),
				}));

				callback(services);
			},
		);
	},

	getUserTransactions: (id, callback) => {
		db.query(
			`SELECT id, amount, created_at, status FROM transactions WHERE user_id = ${id}`,
			function (err, transactionJson) {
				if (err) throw err;
				const transactions = transactionJson.map((transactions) => ({
					id: transactions.id,
					amount: transactions.amount,
					state: transactions.status,
					time: transactions.created_at.toLocaleString(undefined, {
						dateStyle: 'medium',
						timeStyle: 'short',
					}),
				}));

				callback(transactions);
			},
		);
	},

	getUserTransactionById: (user, transaction, callback) => {
		db.query(
			`SELECT service FROM transactions WHERE user_id = ${user} AND id = ${transaction}`,
			function (err, transactionJson) {
				if (err) throw err;
				db.query(
					`SELECT name FROM services WHERE id = ${transactionJson[0].service}`,
					function (err, servicesJson) {
						if (err) throw err;
						const services = servicesJson.map((services) => ({
							quantity: 1,
							description: services.name,
							'tax-rate': 0,
							price: 9.99,
						}));
						callback(services);
					},
				);
			},
		);
	},

	updateUserByID: (options, user, callback) => {
		if (options.newPassword) {
			bcrypt.hash(options.newPassword, 10, (err, hash) => {
				db.query(
					`UPDATE users SET name = '${options.name}', lastname = '${options.lastname}', password = '${hash}', usernote = '${options.userNote}' , logo = '${options.logo}' WHERE id = ${user.id}`,
					function (err, success) {
						if (err) {
							return callback({
								type: 'error',
								message: "Vote profile n'a pas été mise a jour !",
							});
						}
						if (success) {
							return callback({
								type: 'success',
								message: 'Vote profile a été mise a jour !',
							});
						}
					},
				);
			});
		} else {
			db.query(
				`UPDATE users SET name = '${options.name}', lastname = '${options.lastname}', usernote = '${options.userNote}' , logo = '${options.logo}' WHERE id = ${user.id}`,
				function (err, success) {
					if (err) {
						return callback({
							type: 'error',
							message: "Vote profile n'a pas été mise a jour !",
						});
					}
					if (success) {
						return callback({
							type: 'success',
							message: 'Vote profile a été mise a jour !',
						});
					}
				},
			);
		}
	},

	getCatalogue: (callback) => {
		db.query(
			`SELECT * FROM plans WHERE state = "public" ORDER BY sold DESC LIMIT 6`,
			function (err, data) {
				if (err) {
					console.debug(err);
					return callback({}); // Return an empty object or handle the error case as per your application's needs
				}

				db.query(
					`SELECT * FROM categories ORDER BY id`,
					function (error, results) {
						if (error) {
							throw error;
						}

						const catalogueData = {
							categories: JSON.parse(JSON.stringify(results)),
							plans: data,
						};

						return callback(catalogueData);
					},
				);
			},
		);
	},

	getCatalogueByType: (params, callback) => {
		db.query(
			`SELECT * FROM plans WHERE category = "${params.name}" AND state = "public"`,
			[params.id],
			function (err, data) {
				if (err) {
					console.debug(err);
					return callback({}); // Return an empty object or handle the error case as per your application's needs
				}

				db.query(
					`SELECT * FROM categories ORDER BY id`,
					function (error, results) {
						if (error) {
							throw error;
						}

						const catalogueData = {
							categories: JSON.parse(JSON.stringify(results)),
							plans: data,
						};

						console.log(catalogueData);

						return callback(catalogueData);
					},
				);
			},
		);
	},
};
