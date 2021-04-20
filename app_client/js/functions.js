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
    url: "http://localhost:5000/capture",
    type: "GET",
    dataType: "xml",
    data: null,
    success: function (res) {
      var pic_name = res.getElementsByTagName("NAME")[0].firstChild.nodeValue;
      $("#image")
        .attr("src", "http://192.168.1.254/DCIM/PHOTO/" + pic_name)
        .load(function () {
          this.width;
        });
      swal({
        text: pic_name,
        type: "success",
        customClass: "swalCc",
        buttonsStyling: false,
      });
      $(".processing").css("visibility", "hidden");      
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
