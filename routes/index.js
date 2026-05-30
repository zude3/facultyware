var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const { isAuthenticated } = require("../middlewares/auth");

/* GET home page. */
router.get("/", indexController.index);

router.get("/home", isAuthenticated, indexController.home);

router.get("/register", indexController.registerPage);

router.get("/login", indexController.loginPage);

router.post("/login", indexController.login);

router.post("/register", indexController.register);

router.get("/dashboard", isAuthenticated, indexController.dashboard);

router.get("/logout", indexController.logout);

module.exports = router;
