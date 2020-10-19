var express = require("express");
var router = express.Router();
const { check } = require('express-validator');
const{ signout,signup,signin } = require("../controllers/auth");

router.get("/signout",signout);

router.post("/signup", [
    check("name", "Name must be 3 char long").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password","Password should be 5 char long").isLength({ min: 5 })
],signup);

router.post("/signin", [
    check("email", "Email is required").isEmail(),
    check("password","Password is required").isLength({ min: 1 })
],signin);

module.exports = router;