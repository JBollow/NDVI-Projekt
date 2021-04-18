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
    url: "http://192.168.1.254/?custom=1&cmd=1001",
    type: "GET",
    dataType: "xml",
    data: null,
    success: function (res) {
      var pic_name = res.getElementsByTagName("NAME")[0].firstChild.nodeValue;
      console.log(pic_name);
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
      console.log("error");
      swal({
        text: "error",
        type: "error",
        customClass: "swalCc",
        buttonsStyling: false,
      });
      $(".processing").css("visibility", "hidden");
    },
    timeout: 0,
  });
}
