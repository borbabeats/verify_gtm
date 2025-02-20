const express = require("express");
const { getGTMStatus } = require("../controllers/gtmController");

const router = express.Router();

router.get("/status", getGTMStatus);

module.exports = router;
