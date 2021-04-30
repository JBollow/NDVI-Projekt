const express = require("express");
const cors = require("cors");
const axios = require("axios");
const parseString = require("xml2js").parseString;
const Jimp = require("jimp");
const router = express.Router();

router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.get("/capture", function (req, res) {
  axios
    .get("http://192.168.1.254/?custom=1&cmd=1001")
    .then((result) => {
      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://192.168.1.254/DCIM/PHOTO/" + pic_name;
        var postjson = { filename: pic_name };

        Jimp.read(pic_path)
          .then((img) => {
            return img.write("./app_client/CIR_Temp/cir.jpg");
          })
          .then((value) => {
            console.log("Image written");
            console.log("Axios POST");
            axios
              .post("http://0.0.0.0:8088/ndvi", postjson)
              .then(function (response) {
                console.log("Axios POST done");
                res.send(result.data);
              })
              .catch(function (error) {
                console.log("Axios POST error");
                res.send(result.data);
              });
          })
          .catch((err) => {
            console.error(err);
            res.send(result.data);
          });
      });
    })
    .catch((error) => {
      console.log("Axios GET error");
      res.send(error.data);
    });
});

module.exports = router;
