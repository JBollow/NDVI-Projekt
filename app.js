const express = require("express");
const cors = require("cors");
const path = require("path");
const index = require("./app_client/js/index");
const favicon = require("serve-favicon");
const Gallery = require("express-photo-gallery");

const app = express();

var optionsArchive = {
  title: "NDVI Archive",
};

var optionsNDVI = {
  title: "NDVI",
};

var port = 5000;
app.listen(port, function (err, res) {
  if (err) {
    console.log("backend error");
  } else {
    console.log("backend started on port: " + port);
  }
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(favicon(path.join(__dirname, "./app_client/img", "favicon.ico")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "app_client")));

app.use("/", index);
app.use("/archive", Gallery("./app_client/NDVI_Archive", optionsArchive));
app.use("/latest", Gallery("./app_client/NDVI_Temp", optionsNDVI));

app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
