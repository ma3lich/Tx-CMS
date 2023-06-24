const express = require("express");
const { isUserAuthenticated } = require("../config/customFunction.js");
const router = express.Router();
const {
  index,
  logout,
  getProfilePage,
  submitProfile,
  getWalletPage,
  getShop,
  getShopByCategory,
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
  SuccesCheckoutPage,
  CancelCheckoutPage,
  PterodactylPanel,
  PterodactylWebSocket,
  PteroFilesByDirectory,
  PterodactylFileManager,
  PterodactylFileEditor,
  generateInvocePage
} = require("../controllers/clientController.js");

router.all("/*", isUserAuthenticated, (req, res, next) => {
  req.app.locals.layout = "client";
  next();
});

router.route("/").get(index);

router.route("/logout").post(logout);

router.route("/profile").get(getProfilePage).post(submitProfile);
router.route("/profile/wallet").get(getWalletPage)
router.route("/transactions").get(getWalletPage)

router.route("/shop").get(getShop);

router.route("/shop/categories/:name").get(getShopByCategory);

router.route("/shop/cart/add/:id").post(addToCart)
router.route("/shop/cart/remove/:id").get(removeFromCart)

router.route("/shop/cart").get(getCart);

router.route("/shop/cart/checkout").post(checkoutCart)

router.route("/shop/cart/checkout/success").get(SuccesCheckoutPage);
router.route("/shop/cart/checkout/cancel").get(CancelCheckoutPage);

// Gestion d'un service Pterodactyl 
router.route("/services/:id").get(PterodactylPanel)
router.route("/services/:id/websocket").post(PterodactylWebSocket)
router.route("/services/:id/files").get(PterodactylFileManager).post(PteroFilesByDirectory)
router.route("/services/:id/files/edit").get(PterodactylFileEditor)

router.route("/transactions/:id").get(generateInvocePage)


module.exports = router;
