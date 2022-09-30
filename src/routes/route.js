const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

router.get("/test", function (req, res) {
  return res.send("this api working");
});

router.post("/url/shorten", controller.url);
router.get("/:urlCode", controller.getUrl);

module.exports = router;
