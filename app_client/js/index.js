const express = require("express");
const cors = require("cors");
const axios = require("axios");
const parseString = require("xml2js").parseString;
const Jimp = require("jimp");
const schedule = require("node-schedule");
const router = express.Router();

router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

var capturecounter = 0;

function settime() {
  let d = new Date();
  let today = new Date().toISOString().slice(0, 10);

  var time =
    "http://192.168.1.254/?custom=1&cmd=3006&str=" +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();

  var day = "http://192.168.1.254/?custom=1&cmd=3005&str=" + today;

  axios
    .get(day)
    .then(function (response) {})
    .catch(function (error) {});

  axios
    .get(time)
    .then(function (response) {})
    .catch(function (error) {});
}

function format() {
  var format = "http://192.168.1.254/?custom=1&cmd=3010&par=1";

  axios
    .get(format)
    .then(function (response) {})
    .catch(function (error) {});
}

format();
settime();

const job = schedule.scheduleJob("* * 12 * * *", function () {
  capturecounter++;
  if (capturecounter > 100) {
    format();
    settime();
  }
  axios
    .get("http://192.168.1.254/?custom=1&cmd=1001")
    .then((result) => {
      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://192.168.1.254/DCIM/PHOTO/" + pic_name;
        var postjson = { filename: pic_name };
        Jimp.read(pic_path)
          .then((img) => {
            return img.write("./app_client/CIR_Temp/" + pic_name + ".png");
          })
          .then((value) => {
            axios
              .post("http://0.0.0.0:8088/ndvi", postjson)
              .then(function (response) {})
              .catch(function (error) {});
          })
          .catch((err) => {});
      });
    })
    .catch((error) => {});
});

router.get("/capture", function (req, res) {
  capturecounter++;

  if (capturecounter > 100) {
    format();
    settime();
  }

  axios
    .get("http://192.168.1.254/?custom=1&cmd=1001")
    .then((result) => {
      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://192.168.1.254/DCIM/PHOTO/" + pic_name;
        var postjson = { filename: pic_name };

        // console.log("Start Jimp");
        Jimp.read(pic_path)
          .then((img) => {
            return img.write("./app_client/CIR_Temp/" + pic_name + ".png");
          })
          .then((value) => {
            // console.log("Image written");
            // console.log("Axios POST");
            axios
              .post("http://0.0.0.0:8088/ndvi", postjson)
              .then(function (response) {
                // console.log("Axios POST done");
                res.send(result.data);
              })
              .catch(function (error) {
                // console.log("Axios POST error");
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
      // console.log("Axios GET error");
      res.send(error.data);
    });
});

module.exports = router;
