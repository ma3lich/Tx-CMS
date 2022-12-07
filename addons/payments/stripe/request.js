const db = require("../../../config/database");
const { getEnVvalue } = require("../../../config/config");

const Stripe = require("stripe")(getEnVvalue('STRIPE_SECRET'));

let day = new Date().getDate();
let month = new Date().getMonth() + 1;
let year = new Date().getFullYear();

module.exports = {
    StripeTaxeFR: async () => {
        const taxe = await Stripe.taxRates.create({
            display_name: "TVA",
            description: "impôt indirect sur la consommation",
            jurisdiction: "FR",
            percentage: getEnVvalue('TVA_RATE'),
            inclusive: false,
        })
        return taxe;
    },

    StripeCreatePayment: async (options, callback) => {
        const session = await Stripe.checkout.sessions.create(options)
        db.query(
            `INSERT INTO transactions ( owner, date, products, total, state) VALUES ('${user.id}', '${year}-${month}-${day}', '${cart}', '${params.total}', 'pending' )`,
            function (success, err) {
                if (err) console.log(err);
                return callback(session.url)
            }
        );
    },
}