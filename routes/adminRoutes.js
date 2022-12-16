const express = require("express");
const {
  isUserAuthenticated,
  isUserAdmin,
} = require("../config/customFunction.js");
const router = express.Router();
const {
  index,
  getUsersListePage,
  getCreateUserPage,
  postCreateUser,
  getEditUserPage,
  postEditUser,
  getMailUserPage,
  postMailUser,
  deleteUser,
  getPlansListePage,
  getCreatePlanPage,
  postCreatePlan,
  getEditPlanPage,
  postEditPlan,
  getConfigPterodactylPlanPage,
  postPterodactylConfigPlan,
  deletePlan,
  getCategoriesListePage,
  getCreateCategoriesPage,
  postCreateCategories,
  getEditCategoriesPage,
  postEditCategories,
  deleteCategory,
  getServers,
  getSettings,
  postSettings,
  getDBSettings,
  postDBSettings,
  getMailSettings,
  postMailSettings,
  getPaymentsSettings,
  postPaymentsSettings,
  getThemesSettings,
  postThemesSettings,
} = require("../controllers/adminController.js");

router.all("/*", isUserAuthenticated, isUserAdmin, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.route("/").get(index);

router.route("/users").get(getUsersListePage);

router.route("/users/create").get(getCreateUserPage).post(postCreateUser);

router.route("/users/edit/:id").get(getEditUserPage).post(postEditUser);

router.route("/users/mail/:id").get(getMailUserPage).post(postMailUser);

router.route("/users/delete/:id").post(deleteUser);

router.route("/plans").get(getPlansListePage);

router.route("/plans/create").get(getCreatePlanPage).post(postCreatePlan);

router.route("/plans/edit/:id").get(getEditPlanPage).post(postEditPlan);
router.route("/plans/config/1/:id").get(getConfigPterodactylPlanPage).post(postPterodactylConfigPlan)
router.route("/plans/delete/:id").post(deletePlan);

router.route("/plans/categories").get(getCategoriesListePage);
router
  .route("/plans/categories/create")
  .get(getCreateCategoriesPage)
  .post(postCreateCategories);
router
  .route("/plans/categories/edit/:id")
  .get(getEditCategoriesPage)
  .post(postEditCategories);
router.route("/plans/categories/delete/:id").post(deleteCategory);

router.route("/servers").get(getServers);

router.route("/settings").get(getSettings).post(postSettings);

router.route("/settings/database").get(getDBSettings).post(postDBSettings);

router.route("/settings/e-mail").get(getMailSettings).post(postMailSettings);
router.route("/settings/themes").get(getThemesSettings).post(postThemesSettings);


router
  .route("/settings/payments-gateways")
  .get(getPaymentsSettings)
  .post(postPaymentsSettings);

module.exports = router;
