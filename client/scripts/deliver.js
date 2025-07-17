// Global variables
var selectedOrder = false;
var orders = {};
var selectedBuildings = [];
var selectedOrderID = null;

//calculates how much time is left until the orders specific annulation time
function calcTimeLeft(inputTime) {
  if (inputTime) {
    const [inputHours, inputMinutes] = inputTime.split(":").map(Number);
    const now = new Date();

    const target = new Date();
    target.setHours(inputHours, inputMinutes, 0, 0);

    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target - now;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return hours * 60 + minutes;
  }
}

// Converts the products of an order to the total amount of products in the order
function getReward(products) {
  let nrProd = 0;
  products.forEach((item) => {
    nrProd = nrProd + item.quantity;
  });
  return nrProd;
}

// Returns html string based on the price of the products that are ordered
function generateRewardIcons(order) {
  let reward = getReward(order.products);
  let html = "";
  const coffeeIcon = '<i class="fa-solid fa-mug-hot"></i> ';

  html += reward + " ";

  // Tooltip content: just the numeric price/reward
  const tooltipText = `${reward * 7} kr`;

  // Wrap in tooltip HTML structure
  // Tooltip = the text box that shows up when you hover over certain things
  html += `
        <div class="custom-tooltip-wrapper">
            ${coffeeIcon}
            <div class="custom-tooltip">${tooltipText}</div>
        </div>
    `;

  return html.trim();
}

// Return HTML strings based on the number of items
// Tooltip is when you hover over the table cell and an information box shows
function generateProductIcons(products) {
  let html = "";

  const icons = {
    Coffee: '<i class="fa-solid fa-mug-hot"></i> ',
    Sandwich: '<i class="fa-solid fa-bread-slice"></i> ',
    Klägg: '<i class="fa-solid fa-cookie-bite"></i> ',
    Salad: '<i class="fa-solid fa-bowl-food"></i> ',
    Drink: '<i class="fa-solid fa-bottle-water"></i> ',
  };

  products.forEach((orderProduct) => {
    const category = orderProduct.product.category;
    const quantity = orderProduct.quantity;

    // Icon (repeated visually or shown once with quantity if preferred)
    const icon = icons[category] || "❓";
    html += icon.repeat(quantity);
  });

  return html.trim();
}

// Function to show the rating as a number + a star
function generateRatingIcons(ratingValue) {
  let html = "";
  html += ratingValue + "  ";
  html += `<i class="fa-solid fa-star"></i> `;
  return html.trim();
}

// Function to create text box with information about different orders when you hover over the "Order" icons
function generateProductTooltip(products) {
  return products
    .map((p) => `<div>${p.quantity} × ${p.product.name}</div>`)
    .join("");
}

// Function to print all information about an order one row in the table at a time
function printOrder(order, tableBody, user) {
  const orderHTML = generateProductIcons(order.products);
  const productTooltip = generateProductTooltip(order.products);
  const rewardHTML = generateRewardIcons(order);
  const ratingHTML = generateRatingIcons(user.recipient_rating);
  const timeLeft = calcTimeLeft(order.time_limit);

  tableBody.append(`
                <tr class="order-row" data-building="${order.building}" data-order-id="${order.id}">
                    <td>
                    <div class="custom-tooltip-wrapper">
                        ${orderHTML}
                        <div class="custom-tooltip"> ${productTooltip} </div>
                    </div>
                    </td>
                    
                    <td class="time-cell">${timeLeft} min</td>
                    <td>${order.building}</td>
                    <td>${order.room}</td>
                    <td>${ratingHTML}</td>
                    <td>${rewardHTML}</td>
                    <td style="display:none;">${order.id}</td>
                </tr>
            // `);
}

// Returns only the orders from the selected buildings
// Used in updateTable()
function filterOrdersByBuilding(orders) {
  return orders.filter((order) => {
    return (
      selectedBuildings.length === 0 ||
      selectedBuildings.includes("ALL") ||
      selectedBuildings.includes(order.building)
    );
  });
}

// Used to update the map when an order is selected
function createNewMapIframe() {
  const iframe = document.createElement("iframe");
  iframe.id = "map";
  iframe.className = "map-box";
  return iframe;
}

// Updates the table and buttons according to filtration of buildings and orders selected/unselected
function updateTable(orders) {
  // empty earlier table content before making new table content
  let tableBody = $("#order-content");
  tableBody.empty();

  // Filter orders by the selected buildings
  // If there are no orders in the selected building(s), a text shows in the table instead
  const filteredOrders = filterOrdersByBuilding(orders);
  if (filteredOrders.length === 0) {
    tableBody.append(`<tr><td colspan="6">No orders available</td></tr>`);
    return;
  }

  //match order with user who placed order based on the user id in the order
  //.then: waits for the ajax call to be done before it returns the object containing both the order and corresponding user
  const userRequests = filteredOrders.map((order) => {
    return $.ajax({
      url: getHost() + `/user/${order.recipient_user_id}`,
      method: "GET",
    }).then((user) => ({ order, user }));
  });

  //Promise.all: waits until all ajax calls are finished
  //once all data is fetched, loops through the array of order, user and prints them in the table
  Promise.all(userRequests).then((results) => {
    results.forEach(({ order, user }) => {
      printOrder(order, tableBody, user);
    });
  });

  // A row in the table is clicked
  tableBody.off("click", ".order-row").on("click", ".order-row", function () {
    // Save reference to the clicked row
    const $row = $(this);

    // Update the iframe map search to the room in the selected order
    const oldIframe = document.getElementById("map");
    const iframeWrapper = document.querySelector(".right-panel");
    const newIframe = createNewMapIframe();

    // If a selected order is pressed again it gets deselected and the confirm-button and about order-button disappear
    if ($row.hasClass("selected-order")) {
      $row.removeClass("selected-order");
      selectedOrder = false;
      selectedOrderID = null;
      $("#confirm-button").fadeOut();
      $("#about-order-button").fadeOut();

      // Go back to original map of the entire campus
      newIframe.src = ` https://use.mazemap.com/#v=1&campusid=742&zlevel=2&center=15.577423,58.399568&zoom=14.5`;
      iframeWrapper.replaceChild(newIframe, oldIframe);

      // An order was selected (a row clicked) in the table
    } else {
      // check if another order already is selected
      // if so: remove the earlier selected row
      if (selectedOrder) {
        $(".order-row").removeClass("selected-order");
      } else {
        selectedOrder = true;
      }

      // mark the chosen row as a selected order
      $row.addClass("selected-order");

      // Extract order id from the row (the id is in a hidden 7th column)
      selectedOrderID = $row.find("td:nth-child(7)").text().trim();
      var selectedRoom = $row.find("td:nth-child(4)").text().trim();

      // Insert the selected room in the search bar of the map
      newIframe.src = `https://use.mazemap.com/#v=1&campusid=742&search=${selectedRoom}`;
      iframeWrapper.replaceChild(newIframe, oldIframe);

      // Confirm button and information buttonreveals themselves
      $("#confirm-button").removeClass("hidden").fadeIn();
      $("#about-order-button").removeClass("hidden").fadeIn();

      // If you confirm the order, it is then changed to accepted in backend
      document.getElementById("modal-yes").addEventListener("click", () => {
        $("#confirm-button").fadeOut();
        $.ajax({
          url: getHost() + "/customer_order/order_accepted/" + selectedOrderID,
          type: "POST",
          headers: {
            Authorization: "Bearer " + getAuthToken(), // Set the Bearer token for authorization
          },
          success: function () {
            closeModal("confirm-modal");
            $(".container").empty();
            $(".container").load("pages/myDeliveries.html", function () {
              sessionStorage.setItem("lastPage", "pages/myDeliveries.html");
            });
          },
          error: function () {
            closeModal("confirm-modal");
            document
              .getElementById("went-wrong-modal")
              .classList.remove("hidden");
          },
        });
        //closeModal("confirm-modal");
        // $(".container").empty();
        // $(".container").load("pages/myDeliveries.html", function () {
        //   sessionStorage.setItem("lastPage", "pages/myDeliveries.html");
        // });
      });

      // If you press the confirm button without being loged in you have to log in first
      document.getElementById("modal-login").addEventListener("click", () => {
        $("#confirm-button").fadeOut();
        $("#about-order-button").fadeOut();

        goBackToPage = "deliver";
        $(".container").empty();
        $(".container").load("pages/login.html", function () {});

        closeModal("login-required-modal");
      });
    }
  });
}

// Happens after you press the confim button for an order
// The function activates the modal where you have to confirm again or the login modal
function confirmOrder() {
  document.body.classList.add("modal-active");

  if (!user || Object.keys(user).length === 0) {
    document.getElementById("login-required-modal").classList.remove("hidden");
  } else {
    document.getElementById("confirm-modal").classList.remove("hidden");
  }
}

//Happens when you press "About Order" when an order is selected (row is clicked)
function showOrderInfo() {
  //Opens a modal
  document.body.classList.add("modal-active");
  document.getElementById("about-order-modal").classList.remove("hidden");
  let orderToShow = null;

  //Finds the selected order that we want to show information about
  orders.forEach((order) => {
    if (order.id == selectedOrderID) {
      orderToShow = order;
    }
  });

  // If an order is found, generate the order details
  if (!orderToShow) {
    document.getElementById("about-order-text").textContent =
      "Could not find order information.";
    return;
  } else {
    //finds the products ordered and the quantity of them
    const productDetails = orderToShow.products
      .map((product) => `${product.quantity} × ${product.product.name}`)
      .join(" and ");

    // Add the product details to the modal
    const building = orderToShow.building || "a building";
    const room = orderToShow.room || "unspecified room";
    const time = orderToShow.time_limit || "sometime today";
    const reward = getReward(orderToShow.products) * 7 || 0;
    const comment = orderToShow.comment || "";
    const messagePart = comment ? ` Message from customer: "${comment}".` : "";

    // would be good to add information about the user later on

    // Put the text together
    const fullText = `Bring ${productDetails} to room ${room} in the ${building}-building before ${time}. You will earn ${reward} kr. ${messagePart}`;

    //Show text in modal
    document.getElementById("about-order-text").textContent = fullText;
  }
}

// Logic for the modals after pressing the confirm button or about order button
document.getElementById("modal-no").addEventListener("click", () => {
  closeModal("confirm-modal");
});

document.getElementById("modal-close").addEventListener("click", () => {
  closeModal("login-required-modal");
});

document.getElementById("modal-close-info").addEventListener("click", () => {
  closeModal("about-order-modal");
});

document
  .getElementById("modal-close-wrong-info")
  .addEventListener("click", () => {
    closeModal("went-wrong-modal");
    getOrders();
  });

//when pressing close/no on a modal
function closeModal(modalName) {
  const modal = document.getElementById(modalName);
  if (modal) {
    modal.classList.add("hidden");
  }

  document.body.classList.remove("modal-active");
}

// Match orders with information from database
// Catches all orders that are "pending", i.e. only orders that haven't been accepted by a deliverer yet
function getOrders() {
  // Visa loading-symbolen
  $("#loading-spinner").removeClass("hidden");

  if (sessionStorage.getItem("auth")) {
    var id = JSON.parse(sessionStorage.getItem("auth")).user.id;
    $.ajax({
      url: getHost() + `/customer_order/pending/${id}`,
      type: "GET",
      headers: {
        Authorization: "Bearer " + getAuthToken(), // Set the Bearer token for authorization
      },
      success: function (order_list) {
        orders = order_list;
        updateTable(orders);
        // Dölj loading-symbolen
        $("#loading-spinner").addClass("hidden");
      },
      error: function (xhr, status, error) {
        console.error("Fel vid hämtning av orders:", error);
        // Dölj loading-symbolen även vid fel
        $("#loading-spinner").addClass("hidden");
      },
    });
  } else {
    $.ajax({
      url: getHost() + `/customer_order/pending`,
      type: "GET",
      headers: {
        Authorization: "Bearer " + getAuthToken(), // Set the Bearer token for authorization
      },
      success: function (order_list) {
        orders = order_list;
        updateTable(orders);
        // Dölj loading-symbolen
        $("#loading-spinner").addClass("hidden");
      },
      error: function (xhr, status, error) {
        console.error("Fel vid hämtning av orders:", error);
        // Dölj loading-symbolen även vid fel
        $("#loading-spinner").addClass("hidden");
      },
    });
  }
}

// Happens when the page first loads
// Includes logic for selecting buildings in the dropdown menu
$(document).ready(function () {
  getOrders();
  let changeTimeout;
  let lastSelection = [];

  // Watches the dropdown menu for chosing buildings for filtration of orders
  $("#building-select")
    .off("change")
    .on("change", function (e) {
      //the buildings currently selected are either none, or recieved from the menu
      let currentSelection = $(this).val() || [];
      e.preventDefault();
      e.stopPropagation();

      //prevents unnecessary updates
      if (JSON.stringify(currentSelection) === JSON.stringify(lastSelection)) {
        return; 
      }

      //updates last selection
      lastSelection = currentSelection;

      clearTimeout(changeTimeout); // removes earlier timeout

      //schedules an update with a tiny delay
      //solves a bug where the update function might run multiple times if users click quickly
      changeTimeout = setTimeout(() => {
        //update selected buildings to show correct orders in the table
        if (currentSelection.includes("ALL") || currentSelection.length === 0) {
          selectedBuildings = [];
          $("#building-select").val(null).trigger("change.select2");
        } else {
          selectedBuildings = currentSelection;
        }

        updateTable(orders);
      }, 1); // wait 1ms to only run once, solves the problem that orders are written multiple times
    });

  //Initialize the confirm button
  $("#confirm-button")
    .off("click")
    .on("click", function () {
      confirmOrder();
    });

  //Initialize the info about order button
  $("#about-order-button")
    .off("click")
    .on("click", function () {
      showOrderInfo();
    });

  //Intitialize the dropdown menu
  $("#building-select").select2({
    placeholder: "Select Buildings",
    allowClear: true,
    closeOnSelect: false,
  });
});
