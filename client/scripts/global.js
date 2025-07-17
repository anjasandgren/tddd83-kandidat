var user = {};
var goBackToPage = "";

function getHost() {
   return window.location.protocol + "//" + location.host;
}

$(document).ready(function () {
  // Get user info if logged in
  (async function () {
    const token = await refreshAuthToken();
    if (token) {
      getUser();
      $(
        "#login-button-navbar, #log-out-button-navbar, #profile-button, .balance-navbar, #my-orders-navbar, #my-deliveries-navbar"
      ).toggleClass("d-none");
    }
  })();

  // Open the last visit page when pages is refreshed.
  // If it is first time used, home page is opened
  const lastPage = sessionStorage.getItem("lastPage"); // is on format "pages/home.html"

  if (lastPage) {
    $(".container").load(lastPage);

    const pageName = lastPage.split("/")[1].split(".")[0]; // pages/home.html -> home

    if (pageName === "myOrders") {
      setActiveNav("my-orders");
    } else if (pageName === "myDeliveries") {
      setActiveNav("my-deliveries");
    } else {
      setActiveNav(pageName);
    }
  } else {
    $(".container").load("pages/home.html", function () {
      sessionStorage.setItem("lastPage", "pages/home.html");
      setActiveNav("home");
    });
  }
});

// Function to update active navbar link
function setActiveNav(viewName) {
  $(".nav-link").removeClass("active"); //Remove 'active' class from all links
  $(".footer .footer-link").removeClass("active"); //Remove 'active' from all links
  $(`.nav-link[data-view="${viewName}"]`).addClass("active"); //Add 'active' class to the selected link
}

// Function to set active class on footer
function setActiveFooter(viewName) {
  $(".footer .footer-link").removeClass("active"); //Remove 'active' from all links
  $(".nav-link").removeClass("active"); //Remove 'active' class from all links
  $(`.footer .footer-link[data-view="${viewName}"]`).addClass("active"); //Add 'active' to the selected link
}

// Handles clicks on navbar
// Loads the corresponding page into the .container without reloading the entire website
$(".nav-link").click(function (e) {
  e.preventDefault();
  const view = $(this).data("view");
  $(".container").empty();

  if (view === "home") {
    $(".container").load("pages/home.html", function () {
      setActiveNav("home");
      sessionStorage.setItem("lastPage", "pages/home.html");
    });
  } else if (view === "order") {
    $(".container").load("pages/order.html", function () {
      setActiveNav("order");
      sessionStorage.setItem("lastPage", "pages/order.html");
    });
  } else if (view === "deliver") {
    $(".container").load("pages/deliver.html", function () {
      setActiveNav("deliver");
      sessionStorage.setItem("lastPage", "pages/deliver.html");
    });
  } else if (view === "help") {
    $(".container").load("pages/help.html", function () {
      setActiveNav("help");
      sessionStorage.setItem("lastPage", "pages/help.html");
    });
  } else if (view === "my-orders") {
    $(".container").load("pages/myOrders.html", function () {
      setActiveNav("my-orders");
      sessionStorage.setItem("lastPage", "pages/myOrders.html");
    });
  } else if (view === "my-deliveries") {
    $(".container").load("pages/myDeliveries.html", function () {
      setActiveNav("my-deliveries");
      sessionStorage.setItem("lastPage", "pages/myDeliveries.html");
    });
  } else if (view === "profile") {
    $(".container").load("pages/profile.html", function () {
      setActiveNav("profile");
      sessionStorage.setItem("lastPage", "pages/profile.html");
      sessionStorage.setItem("lastView", "");
    });
  } else if (view === "login") {
    $(".container").load("pages/login.html", function () {
      setActiveNav("login");
      sessionStorage.setItem("lastPage", "pages/login.html");
    });
  } else if (view === "log-out") {
    logout();
  }
});

// Function that handles the logout process.
function logout() {
  $.ajax({
    url: getHost() + "/logout",
    type: "POST",
    success: function (response) {
      // Clear sessionStorage and update UI
      $(".container").load("pages/login.html", function () {
        setActiveNav("login");
        sessionStorage.setItem("lastPage", "pages/login.html");
      });
      $(
        "#login-button-navbar, #log-out-button-navbar, #profile-button, .balance-navbar, #my-orders-navbar, #my-deliveries-navbar"
      ).toggleClass("d-none");

      isLoggedIn = false;
      sessionStorage.removeItem("auth");
      user = {};
      cart = [];
      localStorage.removeItem(`cart_${myUser.id}`);
    },
    error: function (xhr, status, error) {
      console.error("Logout failed:", error);
    },
  });
}

// Handles clicks on terms-of-use-link
// Loads the page into the .container without reloading the entire website
// $('.terms-of-use-link').click(function (e) {
$(".footer .footer-link").click(function (e) {
  e.preventDefault();
  const view = $(this).data("view");
  $(".container").empty();

  if (view === "terms-of-use") {
    $(".container").load("pages/terms.html", function () {
      setActiveFooter("terms-of-use");
      sessionStorage.setItem("lastPage", "pages/terms.html");
    });
  } else if (view === "about-us") {
    $(".container").load("pages/about.html", function () {
      setActiveFooter("about-us");
      sessionStorage.setItem("lastPage", "pages/about.html");
    });
  }
});

// Function that updates the balance in the navbar
function updateBalance() {
  $("#balance-navbar").text(user.balance + " SEK");
  $("#currentBalance").text(user.balance + " SEK");
}

// Function that updates the profile-button in the navbar
function updateProfile(user) {
  const profile = document.getElementById("profile-button");
  profile.innerHTML = ""; // Clear earlier picture
  const img = document.createElement("img");
  img.src = user.image_url || "images/default.png"; // Fallback to default
  img.alt = "Profile";
  img.style.width = "40px";
  img.style.height = "40px";
  img.style.borderRadius = "50%";
  img.style.objectFit = "cover";
  profile.appendChild(img);
}

// Get the logged in user from the db.
// Sends a GET request to the '/user/{id}' route, including an authorization token if available.
// If the request is successful, the retrieved user are stored in 'user'.
// If the request fails, an error message is logged.
function getUser() {
  $.ajax({
    url: getHost() + "/user/me",
    type: "GET",
    headers: {
      Authorization: "Bearer " + getAuthToken(), // Set the Bearer token for authorization
    },
    success: function (user_from_db) {
      user = user_from_db;
      updateBalance();
      updateProfile(user);
      if (typeof loadUserInfo === "function") {
        loadUserInfo();
      }

      if (typeof getDeliveryHistory === "function") {
        getDeliveryHistory();
      }

      if (typeof getOrderHistory === "function") {
        getOrderHistory();
      }
    },
    error: function (xhr, status, error) {
      console.error("Fel vid hämtning av användare:", error);
    },
  });
}

function getAuthToken() {
  token = JSON.parse(sessionStorage.getItem("auth") || "{}")?.token || "";
  return token || null;
}

async function refreshAuthToken() {
  try {
    const data = await new Promise((resolve, reject) => {
      $.ajax({
        url: getHost() + "/refresh-login",
        type: "POST",
        xhrFields: {
          withCredentials: true, // sends the cookie
        },
        success: function (data) {
          if (data?.token) {
            sessionStorage.setItem("auth", JSON.stringify(data));
            resolve(data);
          } else {
            reject("No token in refresh response");
          }
        },
        error: function (xhr, status, error) {
          reject(error);
        },
      });
    });

    return data.token;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    return null;
  }
}
