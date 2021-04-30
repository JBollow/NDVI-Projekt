function capture() {
  swal({
    // position: "bottom-end",
    type: "info",
    title: "Working!",
    showConfirmButton: false,
    timer: 1500,
  });

  $(".processing").css("visibility", "visible");

  $.ajax({
    url: "/capture",
    type: "GET",
    dataType: "xml",
    data: null,
    success: function (res) {
      var pic_name = res.getElementsByTagName("NAME")[0].firstChild.nodeValue;
      var swaltext = "Done: " + pic_name;
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
      reload();
    },
    error: function () {
      swal({
        text: "Error",
        type: "error",
        customClass: "swalCc",
        buttonsStyling: false,
      });
      $(".processing").css("visibility", "hidden");
    },
    timeout: 0,
  });
}

function reload() {
  var url = $("#image").attr("src");
  $("#image").attr("src", url + `?v=${new Date().getTime()}`);
}
