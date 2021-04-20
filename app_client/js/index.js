const express = require("express");
const cors = require("cors");
const axios = require("axios");
var parseString = require("xml2js").parseString;
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/capture", function (req, res) {
  console.log("/capture");

  axios
    .get("http://192.168.1.254/?custom=1&cmd=1001")
    .then((result) => {
      console.log("result");
      res.send(result.data);
      parseString(result.data, function (err, result1) {
        console.dir(result1.Function.File[0].NAME[0]);
      });
    })
    .catch((error) => {
      console.log("error");
      res.send(error.data);
    });
});

module.exports = router;
