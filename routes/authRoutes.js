const express = require("express");
const router = express.Router();
// const { register, login, logout } = require("../controllers/authController");
const { register, login, logout } = require("../controllers/2-authController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
