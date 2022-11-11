var easyinvoice = require('easyinvoice');
const app = require("../config/app.json");


module.exports = {
    CreateInvoice: () => {

        
        //Create your invoice! Easy!
        easyinvoice.createInvoice(data, function (result) {
            //The response will contain a base64 encoded PDF file
            console.log('PDF base64 string: ', result.pdf);
        });
    }
}