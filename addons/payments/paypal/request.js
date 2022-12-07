const db = require("../../../config/database");
const { getEnVvalue } = require("../../../config/config");

const Payapl = require("paypal-rest-sdk");

let day = new Date().getDate();
let month = new Date().getMonth() + 1;
let year = new Date().getFullYear();

Payapl.configure({
    mode: "sandbox", //sandbox or live
    client_id: getEnVvalue('PAYPAL_PUBLIC'),
    client_secret: getEnVvalue('PAYPAL_SECRET'),
});


module.exports = {
    PayaplCreatePayment: (options, user, cart, params, callback) => {
        Payapl.payment.create(options, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === "approval_url") {
                        db.query(
                            `INSERT INTO transactions ( owner, date, products, total, state) VALUES ('${user.id}', '${year}-${month}-${day}', '${cart}', '${params.total}', 'pending' )`,
                            function (success, err) {
                                if (err) console.log(err);
                                return callback(payment.links[i].href)
                            }
                        );
                    }
                }
            }
        });
    },
}