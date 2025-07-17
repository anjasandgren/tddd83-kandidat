// Global variables
var profileViewHtml = ``;
var balanceViewHtml = ``;
var orderHistoryViewHtml = ``;
var deliveryHistoryViewHtml = ``;
var leaderboardViewHtml = ``;
var paymentHistoryViewHtml = ``;
if (typeof isProfilePageInitialized === "undefined") {
   var isProfilePageInitialized = false;
}

// Ready function
// Runs every time page is opened
$(document).ready(function () {
   profileViewHtml = $("#profile-view").html();
   balanceViewHtml = $("#balance-view").html();
   orderHistoryViewHtml = $("#order-history-view").html();
   deliveryHistoryViewHtml = $("#delivery-history-view").html();
   leaderboardViewHtml = $("#leaderboard-view").html();
   paymentHistoryViewHtml = $("#payment-history-view").html();

   //loadUserInfo();
   (async function () {
      const token = await refreshAuthToken();
      //console.log("Token: ", token);
      if (token) {
         getUser();
         updateBalance();
      }
   })();

   // Open the last visit view on the page when pages is refreshed.
   // If it is first time used, profile page is opened.
   // Some of these are handled in the getUser() function in global.js to solve bug with loading info.
   const lastView = sessionStorage.getItem("lastView" || "profile");
   if (lastView == "orderHistory") {
      $(".main-container").html(orderHistoryViewHtml);
   } else if (lastView == "deliveryHistory") {
      $(".main-container").html(deliveryHistoryViewHtml);
   } else if (lastView == "paymentHistory") {
      $(".main-container").html(paymentHistoryViewHtml);
      setTimeout(() => {
         getPaymentHistory();
      }, 0); // even 0ms gives the DOM time to update
   } else if (lastView == "leaderboard") {
      $(".main-container").html(leaderboardViewHtml);
      setTimeout(() => {
         getLeaderboard();
      }, 0); // even 0ms gives the DOM time to update
   } else if (lastView == "balance") {
      $(".main-container").html(balanceViewHtml);
   } else {
      $(".main-container").html(profileViewHtml);
   }

   // Only load listeners once
   if (!isProfilePageInitialized) {
      listeners();
      isProfilePageInitialized = true;
   }
});

// Function with all listeners for the profile page.
// Only called the first time the page is loaded.
function listeners() {
   // Listener that triggers when the big "Handle Your Balance"-button is clicked.
   // When clicked, it displays the Balance view.
   $(document).on("click", "#balance-button", function (e) {
      $(".main-container").html(balanceViewHtml);
      sessionStorage.setItem("lastView", "balance");
      updateBalance();
   });

   // Listener that triggers when the "Add Money"-button is clicked.
   // When clicked, it sends the user to Stripe to add money to the balance.
   $(document).on("click", "#add-money-button", function (e) {
      addMoney();
   });

   // Listener that triggers when the keyboard is clicked.
   // When clicked, it sends the user to Stripe to add money to the balance.
   $(document).on("keypress", "#amount", function (e) {
      if (e.keyCode === 13) {
         e.preventDefault();
         addMoney();
      }
   });

   // Listener that triggers when the big "Order History"-button is clicked.
   // When clicked, it displays the order history view and triggers the order history to load.
   $(document).on("click", "#order-history-button", function (e) {
      $(".main-container").html(orderHistoryViewHtml);
      sessionStorage.setItem("lastView", "orderHistory");
      getOrderHistory();
   });

   // Listener that triggers when the big "Order History"-button is clicked.
   // When clicked, it displays the order history view and triggers the order history to load.
   $(document).on("click", "#delivery-history-button", function (e) {
      $(".main-container").html(deliveryHistoryViewHtml);
      sessionStorage.setItem("lastView", "deliveryHistory");

      setTimeout(() => {
         getDeliveryHistory();
      }, 0); // even 0ms gives the DOM time to update
   });

   // Listener that triggers when the big "Payment History"-button is clicked.
   $(document).on("click", "#payment-history-button", function (e) {
      $(".main-container").html(paymentHistoryViewHtml);
      sessionStorage.setItem("lastView", "paymentHistory");
      getPaymentHistory();
   });

   // Listener that triggers when the big "Leaderboard"-button is clicked.
   // When clicked, it displays the order history view and triggers the order history to load.
   $(document).on("click", "#leaderboard-button", function (e) {
      $(".main-container").html(leaderboardViewHtml);
      sessionStorage.setItem("lastView", "leaderboard");
      // getLeaderboard()
      getDeliveryRank();
      getOrderRank();
   });

   // Listener that triggers when the left-arrow to go back to "Profile" is clicked.
   // When clicked, it displays the Profile view and reloads info about the user.
   $(document).on("click", "#go-back-to-profile-view", function (e) {
      $(".main-container").html(profileViewHtml);
      sessionStorage.setItem("lastView", "profile");
      loadUserInfo();
      updateBalance();
   });

   // Listener that triggers when the the icon to edit profile is clicked.
   // When clicked, it displays input rows where you can change your information.
   $(document).on("click", "#edit-profile", function (e) {
      toggleEditMode(true);
   });

   // Listener that triggers when the user clicks on "Edit" the profile picture.
   // Opens a file chooser and reads and sets the file choses. Updates DB when user press "Save".
   $(document).on("click", "#upload-button", function (e) {
      const fileInput = document.getElementById("file-input");
      fileInput.onchange = function () {
         const file = fileInput.files[0];
         if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
               $("#profile-picture img").attr("src", e.target.result);
               user.image_url = e.target.result;
            };
            reader.readAsDataURL(file);
         }
      };
      fileInput.click();
   });

   // Listener that triggers when the "SAVE"-button is clicked.
   // When clicked, it saves the new user info and update the user.
   $(document).on("click", "#save-button", function (e) {
      saveUserInfo();
      toggleEditMode(false);
   });
}

function getOrderRank() {
   $.ajax({
      url: getHost() + "/user/",
      type: "GET",
      headers: {
         Authorization: "Bearer " + getAuthToken(),
      },
      contentType: "application/json",
      success: function (response) {
         const rankBody = document.getElementById("rank-ordering-body");
         rankBody.innerHTML = "";

         var users = response;
         users.sort((a, b) => b.nr_orders - a.nr_orders);
         const topUsers = users.slice(0, 5);

         topUsers.forEach((user, index) => {
            let userName = user.name;
            let image_url = user.image_url || "images/default.png";
            if (index === 0) {
               userName = user.first_name + " " + user.last_name + " 👑";
            } else if (index === 1) {
               userName = user.first_name + " " + user.last_name + " 🥈";
            } else if (index === 2) {
               userName = user.first_name + " " + user.last_name + " 🥉";
            } else if (index == 3) {
               userName = user.first_name + " " + user.last_name + " 🏇";
            } else {
               userName = user.first_name + " " + user.last_name;
            }

            let row = `<tr>
               <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                     <span>${index + 1}</span>
                     <img src="${image_url}" alt="Profile" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                  </div>
               </td>
               <td>${userName}</td>
               <td>${user.nr_orders}</td>
            </tr>`;

            rankBody.innerHTML += row;
         });
      },

      error: function (xhr, status, error) {
         console.error("Fel vid uppdatering av användare:", error);
      },
   });
}

function getDeliveryRank() {
   $.ajax({
      url: getHost() + "/user/",
      type: "GET",
      headers: {
         Authorization: "Bearer " + getAuthToken(),
      },
      contentType: "application/json",
      success: function (response) {
         const rankBody = document.getElementById("rank-delivery-body");
         rankBody.innerHTML = "";

         var users = response;
         users.sort((a, b) => b.nr_deliveries - a.nr_deliveries);
         const topUsers = users.slice(0, 5);

         topUsers.forEach((user, index) => {
            let userName = user.name;
            let image_url = user.image_url || "images/default.png";

            if (index === 0) {
               userName = user.first_name + " " + user.last_name + " 👑";
            } else if (index === 1) {
               userName = user.first_name + " " + user.last_name + " 🥈";
            } else if (index === 2) {
               userName = user.first_name + " " + user.last_name + " 🥉";
            } else if (index == 3) {
               userName = user.first_name + " " + user.last_name + " 🏇";
            } else {
               userName = user.first_name + " " + user.last_name;
            }

            let row = `<tr>
               <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                     <span>${index + 1}</span>
                     <img src="${image_url}" alt="Profile" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">
                  </div>
               </td>
               <td>${userName}</td>
               <td>${user.nr_orders}</td>
            </tr>`;

            rankBody.innerHTML += row;
         });
      },

      error: function (xhr, status, error) {
         console.error("Fel vid uppdatering av användare:", error);
      },
   });
}

function getLeaderboard() {
   getDeliveryRank();
   getOrderRank();
}

// Updated user info in the db.
// Sends a PUT request to the '/user/{id}' route, including an authorization token if available.
// If the request is successful, the retrieved user are stored in 'user'.
// If the request fails, an error message is logged.
function updateUser() {
   $.ajax({
      url: getHost() + "/user/" + user.id,
      type: "PUT",
      headers: {
         Authorization: "Bearer " + getAuthToken(),
      },
      contentType: "application/json",
      data: JSON.stringify({
         first_name: user.first_name,
         last_name: user.last_name,
         email: user.email,
         phone_number: user.phone_number,
         image_url: user.image_url,
      }),
      success: function (response) {
         updateBalance();
         loadUserInfo();
      },
      error: function (xhr, status, error) {
         console.error("Fel vid uppdatering av användare:", error);
      },
   });
}

// Function that loads/reloads user info on profile page.
function loadUserInfo() {
   $("#name").text(user.first_name + " " + user.last_name);
   $("#email").text(user.email);
   $("#phone").text(user.phone_number);
   $("#program").text(user.program);
   $("#profile-picture img").attr("src", user.image_url);

   // Only show the rating if the user has a rating.
   if (user.recipient_rating != null) {
      $("#star-order").removeClass("d-none");
      $("#rating-order").text(user.recipient_rating);
   } else {
      $("#star-order").addClass("d-none");
      $("#rating-order").text("No rating yet");
   }

   if (user.delivery_rating != null) {
      $("#star-deliver").removeClass("d-none");
      $("#rating-deliver").text(user.delivery_rating);
   } else {
      $("#star-deliver").addClass("d-none");
      $("#rating-deliver").text("No rating yet");
   }
}

// Function that changes between the "User Info" view and the "Edit User" view on the right side of the page.
function toggleEditMode(editMode) {
   if (editMode) {
      $(".user-info").addClass("d-none");
      $(".edit-input").removeClass("d-none");
      $("#save-button").removeClass("d-none");
      $("#edit-profile").addClass("d-none");
      $("#user-info-rating-order, #user-info-rating-deliver").addClass("d-none");
      $("#upload-button").show();

      //Default values are current user info.
      $("#name-input").val(user.first_name + " " + user.last_name);
      $("#email-input").val(user.email);
      $("#phone-input").val(user.phone_number);
      $("#program-input").val(user.program);
      $("#profile-picture").attr("src", user.image_url);
   } else {
      $(".user-info").removeClass("d-none");
      $(".edit-input").addClass("d-none");
      $("#save-button").addClass("d-none");
      $("#edit-profile").removeClass("d-none");
      $("#user-info-rating-order, #user-info-rating-deliver").removeClass(
         "d-none",
      );
      $("#upload-button").hide();
   }
}

// Function that saves the new user info from input-fields to the global variable user.
// Also, sends the new info to updateUser() to update the info in the db.
function saveUserInfo() {
   user.first_name = $("#name-input").val().split(" ")[0];
   user.last_name = $("#name-input").val().split(" ")[1];
   user.email = $("#email-input").val();
   user.phone_number = $("#phone-input").val();
   updateUser();
   updateProfile(user);
}

// Function that loads the Stripe page to add money to the balance.
function addMoney() {
   var amountToAdd = document.getElementById("amount").value;
   if (!amountToAdd || isNaN(amountToAdd) || amountToAdd <= 0) {
      return;
   }

   var stripe = Stripe(
      "pk_test_51R28RIJjAmpM2ZLbkqpE2ZEiABULNt8QBj0TbIMI68nncLel2JRRfHaJVVrJxB376mebsW5zUuGnGlh29JVoJeWb00HcGxZPQs",
   );
   var id = JSON.parse(sessionStorage.getItem("auth")).user.id; // Assuming the user ID is stored in sessionStorage

   $.ajax({
      url: `/stripe/${id}/create-checkout-session/${amountToAdd}`, // Ensure this matches the route in Flask
      type: "POST",
      headers: {
         Authorization: "Bearer " + getAuthToken(),
      },
      contentType: "application/json",
      data: JSON.stringify({ amount: amountToAdd }),
      processData: false,
      dataType: "json",
      success: function (response) {
         if (response.session_id) {
            stripe
               .redirectToCheckout({ sessionId: response.session_id })
               .then(function (result) {
                  if (result.error) {
                     alert(result.error.message);
                  }
               });
         }
      },
      error: function (xhr, status, error) {
         console.error("Error with payment:", error);
      },
   });
}

// Function that displays the product name in the right format.
function getProductName(productName) {
   if (
      productName == "Small coffee - (black)" ||
      productName == "Small coffee - some milk" ||
      productName == "Small coffee - some oatly" ||
      productName == "Small coffee - more milk" ||
      productName == "Small coffee - more oatly"
   ) {
      return "Small coffee";
   } else if (
      productName == "Large coffee - (black)" ||
      productName == "Large coffee - some milk" ||
      productName == "Large coffee - some oatly" ||
      productName == "Large coffee - more milk" ||
      productName == "Large coffee - more oatly"
   ) {
      return "Large coffee";
   } else {
      return productName;
   }
}

// Function that loads order history from db and put it in the html-table.
function getOrderHistory() {
   // Bug fix - only load order history if the user is on the order history tab
   if (sessionStorage.getItem("lastView") !== "orderHistory") {
      return;
   }

   const tableBody = document.getElementById("orderTableBody");
   if (!tableBody) {
      console.warn("orderTableBody not found. Aborting.");
      return;
   }

   tableBody.innerHTML = "";
   if (!user || !user.recipient_history) {
      console.warn("User or recipient history not available.");
      return;
   }

   if (user.recipient_history.length > 0) {
      console.log(user.recipient_history.length);
      user.recipient_history.forEach((order) => {
         if (order.order_status === "delivered") {
            let productCount = {};

            order.products.forEach((prod) => {
               const name = getProductName(prod.product.name);
               productCount[name] = (productCount[name] || 0) + prod.quantity;
            });

            let productString = Object.entries(productCount)
               .map(([key, value]) => `${value}x ${key}`)
               .join(", ");

            const parts = order.order_date.split(" ");
            const date = `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
            const time = parts[4].slice(0, 5);

            const row = `<tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${productString}</td>
            <td>${order.price} kr</td>
         </tr>`;

            tableBody.innerHTML += row;
         }
      });
   } else {

      const row = `<tr>
               <td colspan="4" style="text-align: center;">No orders found</td>
          </tr>`;
      tableBody.innerHTML += row;
   }
}

function getDeliveryHistory() {
   // Bug fix - only load delivery history if the user is on the delivery history tab
   if (sessionStorage.getItem("lastView") !== "deliveryHistory") {
      return;
   }

   const tableBody = document.getElementById("deliveryTableBody");

   if (!tableBody) {
      console.warn("deliveryTableBody not found. Aborting.");
      return;
   }

   tableBody.innerHTML = "";
   if (!user || !user.delivery_history) {
      console.warn("User or delivery history not available.");
      return;
   }
   if (user.delivery_history.length > 0) {
      user.delivery_history.forEach((delivery) => {
         if (delivery.order_status === "delivered") {
            let productCount = {};

            delivery.products.forEach((prod) => {
               const name = getProductName(prod.product.name);
               productCount[name] = (productCount[name] || 0) + prod.quantity;
            });

            let productString = Object.entries(productCount)
               .map(([key, value]) => `${value}x ${key}`)
               .join(", ");
            let date = "No date";
            let time = "No time";

            if (delivery.delivery_date !== null) {
               const parts = delivery.delivery_date.split(" ");
               date = `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
               time = parts[4].slice(0, 5);
            }

            const row = `<tr>
            <td>${date}</td>
            <td>${time}</td>
            <td>${productString}</td>
            <td>${delivery.building}</td>
            <td>${delivery.room}</td>
            <td>${delivery.price} kr</td>
         </tr>`;

            tableBody.innerHTML += row;
         }
      });
   } else {
      const row = `<tr>
                <td colspan="6" style="text-align: center;">No deliveries found</td>
            </tr>`;
      tableBody.innerHTML += row;
   }
}

function getPaymentHistory() {
   $.ajax({
      url: "/payment/myPayments",
      type: "GET",
      headers: {
         Authorization: "Bearer " + getAuthToken(),
      },
      success: function (payments) {
         const tableBody = $("#paymentTableBody");
         tableBody.empty();
         var status = "";
         payments.reverse().forEach((payment) => {
            if (payment.status == "paid") {
               status = "Success";
            } else {
               status = "Failed";
            }

            const dateTime = new Date(payment.payment_time);
            const date = dateTime.toLocaleDateString("sv-SE", {
               weekday: "short",
               year: "numeric",
               month: "short",
               day: "numeric",
            });
            const time = dateTime.toTimeString().slice(0, 5);
            const row = `
           <tr>
             <td>${date}</td>
             <td>${time}</td>
             <td>${payment.amount.toFixed(2)} kr</td>
             <td>${status || "-"}</td>
           </tr>
         `;
            tableBody.append(row);
         });
      },
      error: function (xhr) {
         const tableBody = $("#paymentTableBody");
         tableBody.empty();
       
         try {
           const response = JSON.parse(xhr.responseText);
           if (response.error && response.error.includes("No payments found")) {
             const row = `
               <tr>
                 <td colspan="6" style="text-align: center;">No payments found</td>
               </tr>`;
             tableBody.append(row);
           } else {
             console.error("Error fetching payment history:", xhr.responseText);
           }
         } catch (e) {
           console.error("Unexpected error format:", xhr.responseText);
         }
      },
   });
}
