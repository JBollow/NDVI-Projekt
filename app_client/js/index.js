const express = require("express");
const cors = require("cors");
const axios = require("axios");
const parseString = require("xml2js").parseString;
// const path = require("path");
// const fs = require("fs");
const Jimp = require("jimp");


const router = express.Router();

router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/capture", function (req, res) {
  axios
    .get("http://192.168.1.254/?custom=1&cmd=1001")
    .then((result) => {
      res.send(result.data);

      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://192.168.1.254/DCIM/PHOTO/" + pic_name;
        console.dir(pic_path);

        console.log("Jimp");
        Jimp.read(pic_path, (err, img) => {
          if (err) throw err;
          img
            .normalize(function (err) {
              if (err) throw err;
            })
            .write("./CIR/" + pic_name);            
        });

      });
    })
    .catch((error) => {
      console.log("error");
      res.send(error.data);
    });
});

module.exports = router;
