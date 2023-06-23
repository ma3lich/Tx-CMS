const { calcDate } = require('../config/customFunction');
const db = require('../config/database');

module.exports = {
	getCounts: (callback) => {
		const results = {};

		const getUserCount = (callback) => {
			db.query('SELECT COUNT(*) AS userCount FROM users', (err, usersCount) => {
				if (err) throw err;
				callback(usersCount[0].userCount);
			});
		};

		const getClientsCount = (callback) => {
			db.query(
				'SELECT COUNT(*) AS clientsCount FROM transactions',
				(err, clientsCount) => {
					if (err) throw err;
					callback(clientsCount[0].clientsCount);
				},
			);
		};

		const getServicesCount = (callback) => {
			db.query(
				'SELECT COUNT(*) AS servicesCount FROM services',
				(err, servicesCount) => {
					if (err) throw err;
					callback(servicesCount[0].servicesCount);
				},
			);
		};

		const getServersCount = (callback) => {
			db.query(
				'SELECT COUNT(*) AS serversCount FROM servers',
				(err, serversCount) => {
					if (err) throw err;
					callback(serversCount[0].serversCount);
				},
			);
		};

		getUserCount((userCount) => {
			results.users = userCount;

			getClientsCount((clientsCount) => {
				results.clients = clientsCount;

				getServicesCount((servicesCount) => {
					results.services = servicesCount;

					getServersCount((serversCount) => {
						results.servers = serversCount;

						callback(results);
					});
				});
			});
		});
	},
};
