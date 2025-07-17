// Global variables
if (typeof isOrderPageInitialized === 'undefined') {
  var isOrderPageInitialized = false;
}

if (typeof cart === 'undefined') {
  var cart = [];
}

$(document).ready(function () {
  loadUser();
  initializeOrderPage();
  showContainer("coffee");
  handleButtonSelection("coffee-btn");
});

function loadUser() {
  $.ajax({
    url: getHost() + "/user/me",
    method: "GET",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
    success: function (myself) {
      myUser = myself;

      // Load cart here after we have the correct user
      const savedCart = localStorage.getItem(`cart_${myUser.id}`);
      if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart(); // refresh the UI with loaded cart
      }
    },
  });
}

function initializeOrderPage() {
  if (isOrderPageInitialized) return;
  isOrderPageInitialized = true;

  // Change between products in the navbar
  $(document).on("click", ".parent-navbar", function (e) {
    if (e.target.matches("#coffee-btn")) {
      showContainer("coffee");
      handleButtonSelection("coffee-btn");
    }

    if (e.target.matches("#sandwich-btn")) {
      showContainer("sandwich");
      showProducts("sandwich");
      handleButtonSelection("sandwich-btn");
    }

    if (e.target.matches("#klägg-btn")) {
      showContainer("klägg");
      showProducts("klägg");
      handleButtonSelection("klägg-btn");
    }

    if (e.target.matches("#salad-btn")) {
      showContainer("salad");
      showProducts("salad");
      handleButtonSelection("salad-btn");
    }

    if (e.target.matches("#drink-btn")) {
      showContainer("drink");
      showProducts("drink");
      handleButtonSelection("drink-btn");
    }
  });

  // Add product, no milk or other not coffee product
  document.addEventListener("click", function (e) {
    if (e.target.matches(".choise-button")) {
      const productOption = e.target.closest(".product-option");
      const name = productOption.getAttribute("data-name");
      const price = parseInt(productOption.getAttribute("data-price"));
      const id = e.target.getAttribute("data-id");

      // If button is a no milk or a milk button take the text otherwise not
      const milk = e.target.classList.contains("add")
        ? null
        : e.target.textContent;

      cart.push({ id, name, price, milk });
      updateCart();
    }

    if (e.target.matches(".remove-button")) {
      const key = e.target.getAttribute("data-key");
      const index = cart.findIndex(
        (item) => `${item.name}_${item.milk || "no-milk"}` === key,
      );
      if (index > -1) {
        cart.splice(index, 1);
        updateCart();
      }
    }
  });

  // When pay button is clicked
  // Check if cart is empty and if user is logged in
  // If not logged in, show modal
  // If logged in, show modal with cart summary
  $(document).on("click", ".pay-button", function () {
    if (cart.length === 0) {
      //YOUR CART IS EMPTY
      $("#empty-cart-modal").removeClass("hidden");
      $("#empty-cart-modal .close-modal")
        .off("click")
        .on("click", function () {
          $("#empty-cart-modal").addClass("hidden");
        });
      return;

      //If NOT logged in
    } else if (!user || Object.keys(user).length === 0) {
      document.body.classList.add("modal-active");
      document
        .getElementById("login-required-modal")
        .classList.remove("hidden");
    } else if (user.balance < getCost(cart)) {
      //YOU DONT HAVE ENOUGH MONEY
      $("#no-money-modal").removeClass("hidden");

      $("#no-money-modal .close-modal")
        .off("click")
        .on("click", function () {
          $("#no-money-modal").addClass("hidden");

          $(".container").load("pages/profile.html", function () {
            setActiveNav("profile");
            sessionStorage.setItem("lastPage", "pages/profile.html");
            sessionStorage.setItem("lastView", "balance");
          });
        });
      return;

      // If logged in
      // Open modal and print all products
    } else {
      updateCheckoutSummary();
      $("#checkout-modal").removeClass("hidden");
    }
  });

  $(document).on("click", "#modal-balance-close", function () {
    $("#add-money-modal").addClass("hidden");
  });

  $(document).on("click", "#modal-balance", function () {
    $("#add-money-modal").addClass("hidden");
    $(".container")
      .hide()
      .load("pages/profile.html", function () {
        const wait = setInterval(function () {
          if ($("#balance-button").length) {
            clearInterval(wait);
            $("#balance-button").trigger("click");
            $(".container").show();
          }
        }, 10);
        sessionStorage.setItem("lastPage", "pages/profile.html");
      });
  });

  // Close modal
  $(document).on("click", "#close-modal", function () {
    $("#checkout-modal").addClass("hidden");
  });

  // If klicked on the blurry go back
  $(document).on("click", ".modal-overlay", function (e) {
    $("#checkout-modal").addClass("hidden");
  });

  // Confirm order and close modal
  $(document).on("submit", "#checkout-form", function (e) {
    e.preventDefault();
    const house = $("#house-input").val();
    const room = $("#room-input").val();
    const time = $("#time-input").val();
    const comment = $("#comment-input").val();

    if (time) {
      const now = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      const inputTime = new Date();
      inputTime.setHours(hours, minutes, 0, 0);

      if (inputTime < now) {
        $("#invalid-time-modal").removeClass("hidden");
        $("#checkout-modal").addClass("hidden");

        $("#invalid-time-modal .close-modal")
          .off("click")
          .on("click", function () {
            $("#checkout-modal").removeClass("hidden");

            $("#invalid-time-modal").addClass("hidden");
          });
        return;
      }
    }


    if (!house) {
      $("#house-missing-modal").removeClass("hidden");
      $("#checkout-modal").addClass("hidden");
      $("#house-missing-modal .close-modal")
        .off("click")
        .on("click", function () {
          $("#checkout-modal").removeClass("hidden");
          $("#house-missing-modal").addClass("hidden");
        });
      return;
    }

    if (!room) {
      $("#room-missing-modal").removeClass("hidden");
      $("#checkout-modal").addClass("hidden");
      $("#room-missing-modal .close-modal")
        .off("click")
        .on("click", function () {
          $("#checkout-modal").removeClass("hidden");
          $("#room-missing-modal").addClass("hidden");
        });
      return;
    }

    if (!time) {
      $("#time-missing-modal").removeClass("hidden");
      $("#checkout-modal").addClass("hidden");
      $("#time-missing-modal .close-modal")
        .off("click")
        .on("click", function () {
          $("#checkout-modal").removeClass("hidden");
          $("#time-missing-modal").addClass("hidden");
        });
      return;
    }


  let confirmationText = `
    <div style="font-size: 24px; color: #e847a5; font-weight: bold; margin-bottom: 20px;">
      ORDER CONFIRMED!
    </div>
    <div style="display: flex; flex-direction: column; text-align: left; gap: 10px; font-size: 16px; margin-left: 110px">
      <div style="display: flex;">
        <div style="width: 160px; font-weight: bold; text-transform: uppercase;">Building:</div>
        <div>${house}</div>
      </div>
      <div style="display: flex;">
        <div style="width: 160px; font-weight: bold; text-transform: uppercase;">Room:</div>
        <div>${room}</div>
      </div>
      <div style="display: flex;">
        <div style="width: 160px; font-weight: bold; text-transform: uppercase;">Last pickup:</div>
        <div>${time}</div>
      </div>
      <div style="display: flex;">
        <div style="width: 160px; font-weight: bold; text-transform: uppercase;">Comment:</div>
        <div>${comment}</div>
      </div>
    </div>
  `;

  $("#order-confirmed-text").html(confirmationText);


    $('#order-confirmed-modal').removeClass('hidden');
    $('#order-confirmed-modal .close-modal').off('click').on('click', function () {
      $('#order-confirmed-modal').addClass('hidden');
      goToMyOrdersPage();
    });

    launchFireworks();

    $("#checkout-modal").addClass("hidden");
    startOrder(
      user.id,
      house,
      room,
      getIDList(cart),
      getCost(cart),
      comment,
      time,
    );
    $("#checkout-form")[0].reset();
    cart.length = 0;
    if (myUser && myUser.id) {
      localStorage.removeItem(`cart_${myUser.id}`);
    }

    updateCart();
  });
};


function goToMyOrdersPage() {
  $(".container").load("pages/myOrders.html", function () {
    setActiveNav("my-orders");
    sessionStorage.setItem("lastPage", "pages/myOrders.html");
  });
}


document.getElementById("modal-login").addEventListener("click", () => {
  goBackToPage = "order";
  $(".container").load("pages/login.html", function () {
    sessionStorage.setItem("lastPage", "pages/login.html");
  });

  closeModal("login-required-modal");
});

document.getElementById("modal-close").addEventListener("click", () => {
  closeModal("login-required-modal");
});

// Show the container from the navbar
function showContainer(idToShow) {
  document.querySelectorAll(".product-container").forEach((container) => {
    container.classList.add("hidden");
  });
  document.getElementById(idToShow).classList.remove("hidden");
}

document.querySelectorAll(".milk-select").forEach((select) => {
  select.addEventListener("change", handleMilkSelection);
});

function showProducts(category) {
  getProducts(function (products) {
    const otherThanCoffee = products.filter(
      (p) => p.category.toLowerCase() === category,
    );
    renderProducts(otherThanCoffee, category);
  });
}

// Updates the shoppingcart
function updateCart() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = "";
  let total = 0;
  const grouped = {};

  cart.forEach((item) => {
    const key = `${item.name}_${item.milk || "no-milk"}`;
    if (!grouped[key]) {
      grouped[key] = { ...item, quantity: 1 };
    } else {
      grouped[key].quantity += 1;
    }
  });

  Object.values(grouped).forEach((item) => {
    const li = document.createElement("li");
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    // Only show milk if it exists
    const milkText = item.milk ? ` (${item.milk})` : "";
    li.textContent = `${item.name}${milkText} x${item.quantity} – ${itemTotal} kr`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.classList.add("remove-button");
    removeBtn.setAttribute(
      "data-key",
      `${item.name}_${item.milk || "no-milk"}`,
    );

    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });

  if (cart.length > 0) {
    const serviceFee = 1; // Serviceavgift
    total += serviceFee;

    const serviceFeeItem = document.createElement("li");
    serviceFeeItem.textContent = `Service fee – ${serviceFee} kr`;
    serviceFeeItem.style.fontStyle = "italic"; // Gör texten kursiv för att markera att det är en avgift
    serviceFeeItem.style.fontWeight = "normal";
    cartList.appendChild(serviceFeeItem);
  }

  document.getElementById("total-amount").textContent = `TOTAL: ${total} kr`;
  if (myUser && myUser.id) {
    localStorage.setItem(`cart_${myUser.id}`, JSON.stringify(cart));
  }
}

// Add coffee with milk
function handleMilkSelection(e) {
  const milk = e.target.value;
  const productOption = e.target.closest(".product-option");
  const name = productOption.getAttribute("data-name");
  const price = parseInt(productOption.getAttribute("data-price"));
  const id = e.target.selectedOptions[0].dataset.id;
  cart.push({ id, name, price, milk });
  updateCart();
  e.target.selectedIndex = 0;
}

//Takes the cart and makes a list with only the id numbers
function getIDList(cart) {
  let idList = [];

  for (let item of cart) {
    idList.push(parseInt(item.id));
  }
  return idList;
}

//Calculates total cost for cart
function getCost(cart) {
  let serviceFee = 1; 
  let total = 0;

  for (let item of cart) {
    total += item.price;
  }
  return total + serviceFee;
}

//Get all products added in backend
function getProducts(callback) {
  $.ajax({
    url: getHost() + "/product/",
    type: "GET",
    contentType: "application/json",
    success: function (data) {
      callback(data);
    },
    error: function (xhr, status, error) {
      console.error("Fel vid hämtning av produkter:", error);
    },
  });
}

// Sends the order to the database
function startOrder(user_id, house, room, products, cost, comment, time) {
  $.ajax({
    url: getHost() + "/customer_order/",
    type: "POST",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
    contentType: "application/json",
    data: JSON.stringify({
      recipient_user_id: user_id,
      building: house,
      room: room,
      products: products,
      cost: cost,
      comment: comment,
      time_limit: time,
    }),
    success: function (data) {
      $.ajax({
        //update user balance in frontend
        url: getHost() + "/user/me",
        method: "GET",
        headers: {
          Authorization: "Bearer " + getAuthToken(),
        },
        success: function (updatedUser) {
          $("#balance-navbar").text(updatedUser.balance + " SEK");
          user = updatedUser; // Optional: update global user variable
        },
      });
    },
    error: function (xhr, status, error) {
      console.error("Fel vid hämtning av produkter:", error);
    },
  });
}

// Printing all products (for that category)
function renderProducts(products, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  products.forEach((product) => {
    product.price = product.price + 7;
    const productDiv = document.createElement("div");
    productDiv.classList.add("product-option");
    productDiv.setAttribute("data-name", product.name);
    productDiv.setAttribute("data-price", product.price);
    productDiv.setAttribute("data-id", product.id);

    productDiv.innerHTML = `
      <div class="product-inner">
        <div class="product-text">
          <sizetitle>${product.name} – ${product.price} kr</sizetitle>
          <p>${product.description}</p>
        </div>
        <button class="choise-button add" data-id="${product.id}">ADD</button>
      </div>
    `;
    container.appendChild(productDiv);
  });
}

function closeModal(modalName) {
  document.body.classList.remove("modal-active");
  document.getElementById(modalName).classList.add("hidden");
}

// Function that launches fireworks on the whole page
function launchFireworks() {
  const duration = 1.5 * 1000; // 1.5 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 200, zIndex: 1000 };
  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);

    // Launch fireworks from 2 different spots on the screen
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: {
        x: 0.3 + Math.random() * 0.4, // 10% to 90% of width
        y: 0.1 + Math.random() * 0.3  // 5% to 70% of height
      },
      scalar: 2
    }));
  }, 250);
}

flatpickr("#time-input", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true
});

function removeFromCart(key) {
  // Find product in cart
  const index = cart.findIndex(item => `${item.name}_${item.milk || 'no-milk'}` === key);
  cart.splice(index, 0); // Remove product if quantity is 1
  // Update the interface and sessionStorage
  updateCart();
}

// Function that handles the selection of buttons white
// It unselects all buttons and select the one which id is sent in as a parameter
function handleButtonSelection(buttonId) {
  document.querySelectorAll(".button-white").forEach((elem) => {
    elem.classList.remove("active");
  });
  document.getElementById(buttonId).classList.toggle("active");
}

function updateCheckoutSummary() {
  const checkoutSummary = document.getElementById("checkout-cart-summary");
  checkoutSummary.innerHTML = ""; 
  let total = 0;

  const grouped = {};

  cart.forEach((item) => {
    const key = `${item.name}_${item.milk || "no-milk"}`;
    if (!grouped[key]) {
      grouped[key] = { ...item, quantity: 1 };
    } else {
      grouped[key].quantity += 1;
    }
  });

  Object.values(grouped).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const milkText = item.milk ? ` (${item.milk})` : " (No milk)";
    const listItem = document.createElement("li");
    listItem.textContent = `${item.name}${milkText} x${item.quantity} – ${itemTotal} kr`;

    checkoutSummary.appendChild(listItem);
  });

  if (cart.length > 0) {
    const serviceFee = 1; // Serviceavgift
    total += serviceFee;

    const serviceFeeItem = document.createElement("li");
    serviceFeeItem.textContent = `Service fee – ${serviceFee} kr`;
    serviceFeeItem.style.fontStyle = "italic"; // Gör texten kursiv för att markera att det är en avgift
    serviceFeeItem.style.fontWeight = "normal";
    checkoutSummary.appendChild(serviceFeeItem);
  }

  const totalElement = document.createElement("h4");
  totalElement.textContent = `TOTAL: ${total} kr`;
  totalElement.style.marginTop = "20px";
  totalElement.style.marginBottom = "20px";
  totalElement.style.fontWeight = "bold";
  totalElement.style.fontSize = "23px";
  checkoutSummary.appendChild(totalElement);
}
