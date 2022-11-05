const express = require("express");
const { isUserAuthenticated } = require("../config/customFunction.js");
const router = express.Router();
const {
  index,
  logout,
  getProfile,
  submitProfile,
  getShop,
  getShopByCategorie,
  checkout,
} = require("../controllers/clientController.js");

router.all("/*", isUserAuthenticated, (req, res, next) => {
  req.app.locals.layout = "client";
  next();
});

router.route("/").get(index);

router.route("/logout").post(logout);

router.route("/profile").get(getProfile).post(submitProfile);

router.route("/shop").get(getShop);

router.route("/shop/products/:name").get(getShopByCategorie);

router.route("/shop/cart/checkout").get(checkout);

module.exports = router;
