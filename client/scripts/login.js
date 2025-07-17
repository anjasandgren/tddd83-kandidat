var loginPageHtml = ``;
var signUpPageHtml = ``;
var isLoggedIn = false;

$(document).ready(function () {
  loginPageHtml = $("#view-login").html();
  signUpPageHtml = $("#view-sign-up").html();

  if (Object.keys(user).length !== 0) {
    // User is logged in
    $(
      "#login-button-navbar, #profile-button, .balance-navbar, #my-orders-navbar, #my-deliveries-navbar",
    ).removeClass("d-none");
    $(".container").load("pages/home.html", function () {
      sessionStorage.setItem("lastPage", "pages/home.html");
    });
  } else {
    // User is not logged in
      $(".container-page").html(loginPageHtml);
  }
});

// Listener that triggers when the link to the Login view is clicked.
// When clicked, it displays the Login view.
$(document).on("click", "#login-view", function (e) {
  $(".container-page").html(loginPageHtml);
  sessionStorage.setItem("lastLoginView", "login");
});

// Listener that triggers when the link to the Sign Up view is clicked.
// When clicked, it displays the Sign Up view.
$(document).on("click", "#sign-up-view", function (e) {
  $(".container-page").html(signUpPageHtml);
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone);
}

// Listener that triggers when the "Sign Up"-button is clicked.
// When clicked, it tries to create a new account.
$(document).on("click", "#sign-up-button", function (e) {
  const firstname = $("#firstname").val();
  const lastname = $("#lastname").val();
  const email = $("#email").val();
  const phoneNr = $("#phone-number").val();
  const password = $("#password").val();
  const program = $("#program-select").val();


  if (!firstname || !lastname || !email || !phoneNr || !password || program =="ALL") {
    showError("Fill in all fields", "sign-up");
    return;
  } else {
   if(!isValidEmail(email)) {
      showError("Invalid email format", "sign-up");
      return;
    }
    if(!isValidPhoneNumber(phoneNr)) {
      showError("Invalid phone number format", "sign-up");
      return;
    }
    sessionStorage.setItem("lastLoginView", "login");
    const new_user = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      phoneNr: phoneNr,
      password: password,
      program: program,
    };
    signUp(new_user);
  }
});

// Listener that triggers when the "Login"-button is clicked.
// When clicked, it tries to create a new account.
$(document).on("click", "#login-button", function (e) {
  const email = $("#email").val();
  const password = $("#password").val();

  if (!email || !password) {
    showError("Fill in all fields", "login");
    return;
  }
  login(email, password);
});

// Listener that triggers when the eye-icon is clicked.
// When clicked, it shows/hides the password.
$(document).on("click", "#toggle-password", function (e) {
  togglePasswordVisibility("password");
});

// Creates a new user in the db.
// Sends a POST to the '/users' route.
function signUp(new_user) {
  $.ajax({
    url: getHost() + "/user/sign-up",
    type: "POST",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
    data: JSON.stringify({
      first_name: new_user.firstname,
      last_name: new_user.lastname,
      email: new_user.email,
      phone_number: new_user.phoneNr,
      password: new_user.password,
      program: new_user.program,
      admin: false,
    }),
    success: function (response) {
      new_user.id = response.id;
      login(new_user.email, new_user.password);
      openPage();
    },
    error: function (xhr, status, error) {
      showError("User already exists", "sign-up");
      return;
    },
  });
}

// Logs in a user.
// Sends a POST to the '/login' route.
// If it is successful, the users is logged in.
// If it fails, an error message shown.
function login(email, password) {
  $.ajax({
    url: getHost() + "/login",
    type: "POST",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + getAuthToken(),
    },
    data: JSON.stringify({
      email: email,
      password: password,
    }),
    success: function (response) {
      sessionStorage.setItem("auth", JSON.stringify(response));
      $("#login-button-navbar").addClass("d-none");
      $(
        "#log-out-button-navbar, #profile-button, .balance-navbar, #my-orders-navbar, #my-deliveries-navbar",
      ).removeClass("d-none");
      openPage();
      getUser();
      isLoggedIn = true;
    },
    error: function (xhr, status, error) {
      showError("Email or password is incorrect", "login");
      return;
    },
  });
}

// Function that handles the page loading.
// Loads the page into the .container without reloading the entire website.
function openPage() {
  $(".container").empty();
  if (goBackToPage === "") {
    $(".container").load("pages/home.html", function () {
      sessionStorage.setItem("lastPage", "pages/home.html");
    });
  } else {
    $(".container").load("pages/" + goBackToPage + ".html", function () {
      sessionStorage.setItem("lastPage", "pages/" + goBackToPage + ".html");
      goBackToPage = "";
    });
    goBackToPage = "";
  }
}

// Function that handle to show error messages to the user.
// Shows a (before) hidden div in the html that contains the message.
// First param is the error message shown.
// Second param is the specifying id for the html (login, sign-up etc).
function showError(message, id) {
   $("#error-message-" + id).text(message).show();
}

// Function that toggles password visibility
// and how the eye icon should be displayed.
function togglePasswordVisibility(passwordId) {
  var password = document.getElementById(passwordId);
  var icon = document.getElementById("toggle-password");

  if (password.type === "password") {
    password.type = "text"; // Show password
    icon.classList.remove("fa-eye"); // Remove normal eye
    icon.classList.add("fa-eye-slash"); // Add eye with a slash
  } else {
    password.type = "password"; // Hide password
    icon.classList.remove("fa-eye-slash"); // Remove eye with a slash
    icon.classList.add("fa-eye"); // Add normal eye
  }
}
