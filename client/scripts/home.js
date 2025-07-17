$(document).ready(function () {
  $.ajax({
    url: getHost() + "/user/me", // Replace with your user info endpoint
    method: "GET",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
    success: function (user) {
      $("#balance-navbar").text(user.balance + " SEK");
    },
  });
});

// Click on order button
$("#order-button").click(function (e) {
  e.preventDefault();
  $(".container").empty();
  $(".container").load("pages/order.html", function () {
    sessionStorage.setItem("lastPage", "pages/order.html");
    setActiveNav("order");
  });
});

// Click on deliver button
$("#deliver-button").click(function (e) {
  e.preventDefault();
  $(".container").empty();
  $(".container").load("pages/deliver.html", function () {
    sessionStorage.setItem("lastPage", "pages/deliver.html");
    setActiveNav("deliver");
  });
});
