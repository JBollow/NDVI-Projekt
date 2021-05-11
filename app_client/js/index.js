const express = require("express");
const cors = require("cors");
const axios = require("axios");
const parseString = require("xml2js").parseString;
const Jimp = require("jimp");
const schedule = require("node-schedule");
const router = express.Router();
const os = require("os");
const checkDiskSpace = require("check-disk-space");
const fs = require("fs");

router.use(cors());
router.use(express.json());
router.use(
  express.urlencoded({
    extended: false,
  })
);

let rawdata = fs.readFileSync("./settings.json");
let savedata = JSON.parse(rawdata);
console.log(savedata);

var capturecounter = savedata.capturecounter;
var hour = savedata.hour;
var min = savedata.min;
var mapirIP = savedata.mapirIP;
var timer = min + " " + hour + " * * *";

function settime() {
  let d = new Date();
  let today = new Date().toISOString().slice(0, 10);

  var time =
    "http://" +
    mapirIP +
    "/?custom=1&cmd=3006&str=" +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();

  var day = "http://" + mapirIP + "/?custom=1&cmd=3005&str=" + today;
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
  var format = "http://" + mapirIP + "/?custom=1&cmd=3010&par=1";
  axios
    .get(format)
    .then(function (response) {})
    .catch(function (error) {});
}

if (capturecounter > 1000) {
  format();
  settime();
}

router.get("/diskspace", function (req, res) {
  space = { space: "0" };
  if (os.platform() === "win32") {
    console.log("Diskspace Windows");
    checkDiskSpace("C:/").then((diskSpace) => {
      space.space = Math.floor(
        ((Math.floor(diskSpace.free / 1024 / 1024 / 1024) - 10) /
          Math.floor(diskSpace.size / 1024 / 1024 / 1024)) *
          100
      );
      res.send(space);
    });
  } else {
    console.log("Diskspace Linux");
    checkDiskSpace("/").then((diskSpace) => {
      space.space = Math.floor(
        ((Math.floor(diskSpace.free / 1024 / 1024 / 1024) - 10) /
          Math.floor(diskSpace.size / 1024 / 1024 / 1024)) *
          100
      );
      console.log(Math.floor(
        ((Math.floor(diskSpace.free / 1024 / 1024 / 1024) - 10) /
          Math.floor(diskSpace.size / 1024 / 1024 / 1024)) *
          100
      ));
      res.send(space);
    });
  }
});

const job = schedule.scheduleJob(timer, function () {
  capturecounter++;
  if (capturecounter > 100) {
    format();
    settime();
  }
  axios
    .get("http://" + mapirIP + "/?custom=1&cmd=1001")
    .then((result) => {
      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://" + mapirIP + "/DCIM/PHOTO/" + pic_name;
        var postjson = {
          filename: pic_name,
        };
        Jimp.read(pic_path)
          .then((img) => {
            return img.write("./app_client/CIR_Temp/" + pic_name + ".png");
          })
          .then((value) => {
            axios
              .post("http://localhost:8088/ndvi", postjson)
              .then(function (response) {})
              .catch(function (error) {});
          })
          .catch((err) => {});
      });
    })
    .catch((error) => {});
});

router.post("/settimer", function (req, res) {
  var data = req.body;
  if (data.time.substring(0, 1) == 0) {
    hour = data.time.substring(1, 2);
    savedata.hour = data.time.substring(1, 2);
  } else {
    hour = data.time.substring(0, 2);
    savedata.hour = data.time.substring(0, 2);
  }
  if (data.time.substring(3, 4) == 0) {
    min = data.time.substring(4, 5);
    savedata.min = data.time.substring(4, 5);
  } else {
    min = data.time.substring(3, 5);
    savedata.min = data.time.substring(3, 5);
  }
  res.send();

  var timedata = JSON.stringify(savedata);
  fs.writeFileSync("./settings.json", timedata);
});

router.get("/gettimer", function (req, res) {
  var tempHour = hour.toString();
  var tempMin = min.toString();
  if (hour < 10) {
    tempHour = "0" + tempHour;
  }
  if (min < 10) {
    tempMin = "0" + tempMin;
  }
  var timeJSON = {
    hour: tempHour,
    min: tempMin,
  };
  res.send(JSON.stringify(timeJSON));
});

router.get("/capture", function (req, res) {
  capturecounter++;
  if (capturecounter > 1000) {
    format();
    settime();
  }

  axios
    .get("http://" + mapirIP + "/?custom=1&cmd=1001")
    .then((result) => {
      parseString(result.data, function (err, result1) {
        var pic_name = result1.Function.File[0].NAME[0];
        var pic_path = "http://" + mapirIP + "/DCIM/PHOTO/" + pic_name;
        var postjson = {
          filename: pic_name,
        };

        // console.log("Start Jimp");
        Jimp.read(pic_path)
          .then((img) => {
            return img.write("./app_client/CIR_Temp/" + pic_name + ".png");
          })
          .then((value) => {
            // console.log("Image written");
            // console.log("Axios POST");
            axios
              .post("http://localhost:8088/ndvi", postjson)
              .then(function (response) {
                // console.log("Axios POST done");
                res.send(result.data);
                savedata.capturecounter = capturecounter;
                var capturedata = JSON.stringify(savedata);
                fs.writeFileSync("./settings.json", capturedata);  
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
