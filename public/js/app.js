/*Cart calcul*/
let amounts = document.querySelectorAll("#amount")

/*Sum all fees and post the total fees */

let fees = document.querySelectorAll("#fee");
let $totalfees = document.getElementById("totalfees")
let totalFees = 0;

if(fees !== undefined && fees !== []){

    for (let i = 0; i < fees.length; i++) {
      totalFees += Number(fees[i].innerHTML) * Number(amounts[i].innerHTML)
    };
    $totalfees.innerHTML = totalFees.toFixed(2) + " €"
}

/*Sum all prices and post the sub total */

let prices = document.querySelectorAll("#price")
let $subtotal = document.getElementById("subtotal")
let subTotal = 0;


if (prices !== undefined && prices !== []) {

  for (let i = 0; i < prices.length; i++) {
    subTotal += Number(prices[i].innerHTML) * Number(amounts[i].innerHTML);
  }
  $subtotal.innerHTML = subTotal.toFixed(2) + " €"
}

/*Sum all fees and prices and post the total */

let total = document.getElementById('total')

if(subTotal + totalFees >= 0){
  let totalAll = (subTotal + totalFees);
  console.log(totalAll)
  total.innerHTML = (subTotal + totalFees) + " €"
}
