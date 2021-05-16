function capture() {
  swal({
    // position: "bottom-end",
    type: "info",
    title: "Working!",
    showConfirmButton: false,
    timer: 1500,
  });

  $(".processing").css("visibility", "visible");
  $("#ndvi_button").prop("disabled", true);
  $("#ndvi_button").removeClass("buttonwhite").addClass("buttonwhitedis");

  $.ajax({
    url: "/capture",
    type: "GET",
    dataType: "xml",
    data: null,
    success: function (res) {
      var pic_name = res.getElementsByTagName("NAME")[0].firstChild.nodeValue;
      var swaltext = "NDVI saved!";
      $("#image")
        .attr("src", "NDVI_Temp/ndvi.jpg")
        .load(function () {
          this.width;
        });
      swal({
        text: swaltext,
        type: "success",
        customClass: "swalCc",
        buttonsStyling: false,
      });
      $(".processing").css("visibility", "hidden");
      $("#ndvi_button").prop("disabled", false);
      $("#ndvi_button").removeClass("buttonwhitedis").addClass("buttonwhite");
      location.reload();     
    },
    error: function () {
      swal({
        text: "Error",
        type: "error",
        customClass: "swalCc",
        buttonsStyling: false,
      });
      $(".processing").css("visibility", "hidden");
      $("#ndvi_button").prop("disabled", false);
      $("#ndvi_button").removeClass("buttonwhitedis").addClass("buttonwhite");
    },
    timeout: 0,
  });  
}

function archiv() {
  window.location.href = "/archiv";
}

function ftp() {
  window.location.href = "ftp://192.168.0.36";
}

function latest() {
  window.location.href = "/latest";
}

function settings() {
  if ($(".settings").css("visibility") == "hidden")
    $(".settings").css("visibility", "visible");
  else $(".settings").css("visibility", "hidden");
}

function setTimer() {
  var time = {
    time: $("#inputpath").val(),
  };

  $.ajax({
    url: "/settimer",
    type: "POST",
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(time),
    traditional: true,
    cache: false,
    processData: false,
    success: function () {
      swal({
        text: "Timer changed",
        type: "success",
        customClass: "swalCc",
        buttonsStyling: false,
      });
    },
    error: function () {
      swal({
        text: "Error",
        type: "error",
        customClass: "swalCc",
        buttonsStyling: false,
      });
    },
    timeout: 0,
  });
}

function getTimer() {
  $.ajax({
    url: "/gettimer",
    type: "GET",
    dataType: "JSON",
    data: null,
    success: function (res) {
      $("#inputpath").val( res.hour+":"+res.min+":00" );
    },
    error: function () { console.log("error")},
    timeout: 0,
  });
  
  settings();
}

function diskspace() {
  $.ajax({
    url: "/diskspace",
    type: "GET",
    dataType: "JSON",
    data: null,
    success: function (res) {
      $("#diskspacetext").text(res.space + "%");
    },
    error: function () {},
    timeout: 0,
  });
}
