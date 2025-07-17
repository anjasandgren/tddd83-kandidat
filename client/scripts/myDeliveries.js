$(document).ready(function () {
  displayOrders();
  //showLatest();
  if (typeof selectedOrder === "undefined") {
    var selectedOrder = null;
  }

  if (typeof selectedCustomerRating === "undefined") {
    var selectedCustomerRating = 0;
  }
  if (typeof popup === "undefined") {
    var popup = null;
  }

  function updateCustomerInfo(info, order) {
    $.ajax({
      url: `/user/${info}`,
      method: "GET",
      dataType: "json",
      success: function (user) {
        // Update each cell in the customer info table.
        $("#customer-name").text(user.first_name);
        $("#customer-phone").text(user.phone_number);
        $("#customer-email").text(user.email);
        $("#customer-building").text(order.building);
        $("#customer-room").html(order.room + ` <span id="deliverer-room" style="margin-right: 10px"></span>
          <div style="height: 32px; width: 150px;">
            <button id="view-map-btn" class="button-smaller">
              📍 View on Map
            </button>
          </div>`);
        $("#customer-rating").text(user.recipient_rating);
        $('#profile-picture-delivery img').attr('src', user.image_url);


        // Build product list: each product on its own line.
        const productList = order.products
          .map((item) => `${item.quantity} x ${item.product.name}`)
          .join("<br>");
        $("#product").html(productList);
        $("#time-limit").text(order.time_limit);
        $("#comment").text(order.comment);

          // Logic for mazemap button and mazemap modal
        $("#view-map-btn").on("click", function () {
          const iframeUrl = `https://use.mazemap.com/#v=1&campusid=742&search=${order.room}`;

          $("#mazemap-iframe").attr("src", iframeUrl);
          $("#mazemap-modal").removeClass("hidden");
        });

        $("#mazemap-close").on("click", function () {
          $("#mazemap-modal").addClass("hidden");
          $("#mazemap-iframe").attr("src", ""); // unload to reset iframe
        });
      },
      error: function (xhr, status, error) {
        console.error("Error fetching customer info:", error);
        showPopupMessage(
          "Failed to fetch customer info. Please try again later.",
        );
        $("#profile-picture-delivery img").attr("src", "images/default.png");
      },
    });

    showHideRateButton(selectedOrder.order_status);
    showHideMapButton(selectedOrder.order_status);
  }

  // Show/hide the "Rate Customer" button based on order status
  function showHideRateButton(status) {
    if (status === "delivered") {
      $("#rate-customer-btn").removeClass("d-none");
    } else {
      $("#rate-customer-btn").addClass("d-none");
    }
  }
// show/hide the view map button based on order status
  function showHideMapButton(status) {
    if (status === "accepted") {
      $("#view-map-btn").removeClass("d-none");
    } else {
      $("#view-map-btn").addClass("d-none");
    }
  }

  function updateDeliveryProgress(status) {
    const labels = $(".progress-label");
    const checks = $(".check-icon");

    const bar1 = $("#progress-fill-pending-accepted");
    const bar2 = $("#progress-fill-accepted-delivered");

    labels.removeClass("active");
    checks.removeClass("active");
    bar1.css("width", "0%");
    bar2.css("width", "0%");

    if (status === "pending") {
      labels.eq(0).addClass("active");
      checks.eq(0).addClass("active");
    }

    if (status === "accepted") {
      bar1.css("width", "100%");
      labels.eq(0).addClass("active");
      labels.eq(1).addClass("active");
      checks.eq(0).addClass("active");
      checks.eq(1).addClass("active");
    }

    if (status === "delivered") {
      bar1.css("width", "100%");
      bar2.css("width", "100%");
      labels.eq(0).addClass("active");
      labels.eq(1).addClass("active");
      labels.eq(2).addClass("active");
      checks.eq(0).addClass("active");
      checks.eq(1).addClass("active");
      checks.eq(2).addClass("active");
    }
  }

  function populateOrderSelect(orders, selectedOrderId = null) {
    const select = $("#order-select");
    select.empty();
    select.append("<option disabled selected>Choose an order</option>");

    orders.forEach((order, index) => {
      select.append(`<option value="${index}">Order #${index + 1}</option>`);
    });

    if (orders.length > 0) {
      let selectedIndex = 0;

      if (selectedOrderId) {
        const matchIndex = orders.findIndex(
          (order) => order.id === selectedOrderId,
        );
        if (matchIndex !== -1) {
          selectedIndex = matchIndex;
        }
      } else {
        selectedIndex = orders.length - 1;
      }

      select.val(selectedIndex);
      selectedOrder = orders[selectedIndex];
      updateCustomerInfo(selectedOrder.recipient_user_id, selectedOrder);
      updateDeliveryProgress(selectedOrder.order_status);
    }

    select.off("change").on("change", function () {
      const selectedIndex = $(this).val();
      selectedOrder = orders[selectedIndex];
      updateCustomerInfo(selectedOrder.recipient_user_id, selectedOrder);
      updateDeliveryProgress(selectedOrder.order_status);
    });
  }

  function displayOrders(keepSelected = false) {
    $.ajax({
      headers: {
        Authorization: "Bearer " + getAuthToken(), // Set the Bearer token for authorization
      },
      url: `/user/current_deliveries`,
      method: "GET",
      dataType: "json",
      success: function (orders) {
        if (orders.length === 0) {
          selectedOrder = null;
          selectedCustomerRating = 0;

          // Clear UI
          $("#order-select")
            .empty()
            .append("<option disabled selected>No current deliveries</option>");
          $(
            "#profile-picture-delivery, #customer-name, #customer-phone, #customer-email, #customer-building, #customer-room, #product, #time-limit, #comment",
          ).text("");
          $("#rate-customer-btn").addClass("d-none");
          $("#view-map-btn").addClass("d-none");

          // Reset progress bar
          $(
            "#progress-fill-pending-accepted, #progress-fill-accepted-delivered",
          ).css("width", "0%");
          $(".progress-label, .check-icon").removeClass("active");

          return;
        }
        populateOrderSelect(orders, keepSelected ? selectedOrder?.id : null);
      },
    });
  }

  // Tar bort edit knappen om man ordern inte är delivered
  // if (selectedOrder.order_status !== "delivered") {
  //     document.getElementById("rate-customer-btn").style.display = "block";
  // } else {
  //     document.getElementById("rate-customer-btn").style.display = "none";
  // }

  // let selectedCustomerRating = 0;

  $(document).on("click", "#rate-customer-btn", function () {
    $("#rate-customer-popup").removeClass("hidden");
    const stars = document.querySelectorAll("#customer-rating-stars .star");

    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        selectedCustomerRating = index + 1;
        updateStarDisplay(selectedCustomerRating);
      });

      star.addEventListener("mouseover", () => {
        updateStarDisplay(index + 1);
      });

      star.addEventListener("mouseout", () => {
        updateStarDisplay(selectedCustomerRating);
      });
    });

    function updateStarDisplay(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add("selected");
        } else {
          star.classList.remove("selected");
        }
      });
    }
  });

  $(document).on("click", "#submit-customer-rating", function () {
    if (selectedCustomerRating === 0) {
      showPopupMessage("Please select a rating before submitting!");
    } else {
      $.ajax({
        headers: {
          Authorization: "Bearer " + getAuthToken(),
        },
        url: `/customer_order/rate_recipient/${selectedOrder.id}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
          recipient_rating: selectedCustomerRating,
        }),
        success: function (response) {
          showPopupMessage("Thanks for your rating!");
          $("#rate-customer-popup").addClass("hidden");
          displayOrders(true); // Will now hide the order once rated
        },
        error: function (xhr, status, error) {
          console.error("Error rating recipient:", error);
          showPopupMessage("Failed to submit rating. Try again.");
        },
      });
    }
  });

  // Close popup when clicking outside of it
  $(document).on("click", function (event) {
    const popup = document.getElementById("rate-customer-popup");
    const button = document.getElementById("rate-customer-btn");

    if (
      popup &&
      !popup.classList.contains("hidden") &&
      !popup.contains(event.target) &&
      !button.contains(event.target)
    ) {
      popup.classList.add("hidden");
    }
  });

  function showPopupMessage(message) {
    $("#custom-popup-message").text(message);
    $("#custom-popup").removeClass("hidden");
  }

  $("#custom-popup-close").on("click", function () {
    $("#custom-popup").addClass("hidden");
  });

  $("#delivery-history-button").on("click", function () {
    $(".container").load("pages/profile.html", function () {
      // Manually load and execute profile.js
      $.getScript("scripts/profile.js", function () {
        const wait = setInterval(function () {
          // Ensure everything is ready
          if (
            typeof deliveryHistoryViewHtml !== "undefined" &&
            deliveryHistoryViewHtml !== "" &&
            typeof user !== "undefined" &&
            user.delivery_history
          ) {
            clearInterval(wait);
            $(".main-container").html(deliveryHistoryViewHtml);

            // Wait for HTML to render
            setTimeout(() => {
              getDeliveryHistory();
            }, 10);
          }
        }, 10);
      });
      sessionStorage.setItem("lastPage", "pages/profile.html");
    });
  });
});
