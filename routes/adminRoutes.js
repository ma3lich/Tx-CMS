const express = require("express");
const { isUserAuthenticated } = require("../config/customFunction.js");
const router = express.Router();
const {
  index,
  getUsers,
  createUser,
  submitCreatedUser,
  editUser,
  submitEditedUser,
  mailUser,
  SendMailUser,
  deleteUser,
  getPlans,
  createPlan,
  submitCreatedPlan,
  editPlan,
  submitEditedPlan,
  deletePlan,
  getCategories,
  createCategorie,
  submitCreatedCategorie,
  editCategorie,
  submitEditedCategorie,
  deleteCategorie,
  getServers,
  getSettings,
  postSettings,
  getDBSettings,
  postDBSettings,
  getMailSettings,
  postMailSettings,
  getPaymentsSettings,
  postPaymentsSettings,
} = require("../controllers/adminController.js");

router.all("/*", isUserAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.route("/").get(index);

router.route("/users").get(getUsers);

router.route("/users/create").get(createUser).post(submitCreatedUser);

router.route("/users/edit/:id").get(editUser).post(submitEditedUser);

router.route("/users/mail/:email").get(mailUser).post(SendMailUser);

router.route("/users/delete/:id").post(deleteUser);

router.route("/plans").get(getPlans);

router.route("/plans/create").get(createPlan).post(submitCreatedPlan);

router.route("/plans/edit/:id").get(editPlan).post(submitEditedPlan);

router.route("/plans/delete/:id").post(deletePlan);

router.route("/categories").get(getCategories);

router
  .route("/categories/create")
  .get(createCategorie)
  .post(submitCreatedCategorie);

router
  .route("/categories/edit/:id")
  .get(editCategorie)
  .post(submitEditedCategorie);

router.route("/categories/delete/:id").post(deleteCategorie);

router.route("/servers").get(getServers);

router.route("/settings").get(getSettings).post(postSettings);

router.route("/settings/database").get(getDBSettings).post(postDBSettings);

router.route("/settings/e-mail").get(getMailSettings).post(postMailSettings);

router
  .route("/settings/payments-gateways")
  .get(getPaymentsSettings)
  .post(postPaymentsSettings);

module.exports = router;
