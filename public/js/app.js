let prices = document.querySelectorAll("#price");
if (prices !== undefined && prices !== []) {
  let subTotal = 0;
  for (let i = 0; i < prices.length; i++)  subTotal += Number(prices[i].innerHTML);
  console.log(subTotal);
}