const express = require("express");
const { isUserAuthenticated } = require("../config/customFunction.js");
const router = express.Router();
const {
  index,
  logout,
  getProfile,
  submitProfile,
  getShop,
  getShopByCategory,
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
  successCheckout,
  cancelCheckout
} = require("../controllers/clientController.js");

router.all("/*", isUserAuthenticated, (req, res, next) => {
  req.app.locals.layout = "client";
  next();
});

router.route("/").get(index);

router.route("/logout").post(logout);

router.route("/profile").get(getProfile).post(submitProfile);

router.route("/shop").get(getShop);

router.route("/shop/categories/:id").get(getShopByCategory);

router.route("/shop/cart/add/:id").post(addToCart)
router.route("/shop/cart/remove/:id").get(removeFromCart)

router.route("/shop/cart").get(getCart);

router.route("/shop/cart/checkout").post(checkoutCart)

router.route("/shop/cart/checkout/success").get(successCheckout);
router.route("/shop/cart/checkout/cancel").get(cancelCheckout);


module.exports = router;
