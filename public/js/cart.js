/*Cart calcul*/
let amounts = document.querySelectorAll("#amount")
let tvaPourcentage = document.getElementById("tva")



/*Sum all fees and post the total fees */

let fees = document.querySelectorAll("#fee");
let $totalfees = document.getElementById("totalfees")
let totalFees = 0;

if(fees !== undefined && fees !== []){

    for (let i = 0; i < fees.length; i++) {
      totalFees += Number(fees[i].innerHTML) * Number(amounts[i].innerHTML)
    };
    totalFees = totalFees.toFixed(2) 
    $totalfees.innerHTML = totalFees + " €"
}

/*Sum all prices and post the sub total */

let prices = document.querySelectorAll("#price")
let $subtotal = document.getElementById("subtotal")
let subTotal = 0;


if (prices !== undefined && prices !== []) {

  for (let i = 0; i < prices.length; i++) {
    subTotal += Number(prices[i].innerHTML.replace(" €", "")) * Number(amounts[i].innerHTML);
  }
  $subtotal.innerHTML = subTotal.toFixed(2) + " €"
}

/*Sum all tva and prices and tva the total */

let $totaltva = document.getElementById("totaltva")
let totaltva =  ( Number(tvaPourcentage.innerHTML.replace("%","")) * (subTotal + Number(totalFees)) / 100).toFixed(2);

if(tvaPourcentage !== undefined && tvaPourcentage !== []){
    $totaltva.innerHTML = totaltva + " €"
}


/*Sum all fees and prices and post the total */

let total = document.getElementById('total')
console.log(subTotal + " | " + totalFees +  " | " + totaltva)
let totalAll = (Number(subTotal) + Number(totalFees) + Number(totaltva)).toFixed(2);
console.log(totalAll)
if(totalAll){
  total.innerHTML = totalAll + " €"
}

document.getElementById("paypal").addEventListener('click', () => {
  document.getElementById("form_id").action = (`/client/shop/cart/checkout?getway=paypal&fees=${totalFees}&tva=${totaltva}&promo=0&subtotal=${subTotal}&total=${totalAll}`);
})

document.getElementById("stripe").addEventListener('click', () => {
  document.getElementById("form_id").action = (`/client/shop/cart/checkout?getway=stripe&fees=${totalFees}&tva=${totaltva}&promo=0&subtotal=${subTotal}&total=${totalAll}`);
})

document.getElementById("wallet").addEventListener('click', () => {
  document.getElementById("form_id").action = (`/client/shop/cart/checkout?getway=wallet&fees=${totalFees}&tva=${totaltva}&promo=0&subtotal=${subTotal}&total=${totalAll}`);
})
