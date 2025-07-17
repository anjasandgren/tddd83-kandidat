if (typeof isPageIni === 'undefined') {
    var isPageIni = false;
}

if (typeof selectedOrder === 'undefined') {
    var selectedOrder = null;
}

if (typeof selectedRating === 'undefined') {
    var selectedRating = 0;
}
if (typeof popup === 'undefined') {
    var popup = null;
}

$(document).ready(function () {
    // var currentOrder = null;
    displayOrders();
    iniPage();

    $("#order-history-button").on("click", function () {
        $(".container").load("pages/profile.html", function () {
            // Manually load and execute profile.js
            $.getScript("scripts/profile.js", function () {
                const wait = setInterval(function () {
                    if (
                        typeof orderHistoryViewHtml !== "undefined" &&
                        orderHistoryViewHtml !== "" &&
                        typeof user !== "undefined" &&
                        user.recipient_history
                    ) {
                        clearInterval(wait);
                        $(".main-container").html(orderHistoryViewHtml);
    
                        // Wait for HTML to render
                        setTimeout(() => {
                            getOrderHistory();
                        }, 10);
                    }
                }, 10);
            });
            sessionStorage.setItem("lastPage", "pages/profile.html");
        });
    });
    
});


function iniPage() {
    if (isPageIni) return;
    isPageIni = true;

    $(document).on("click", "#edit-order", function (e) {
        toggleOrderEditMode(true);
        editOrder(selectedOrder);
    });

    $(document).on("click", "#save-button", function (e) {
        toggleOrderEditMode(false);
        saveOrderInfo(selectedOrder);
    });

    $(document).on("click", "#delete-button", async function (e) {
        toggleOrderEditMode(false);
        deleteOrder(selectedOrder.id);
        user_balance = user.balance + selectedOrder.price;
        $("#balance-navbar").text(user_balance + " SEK");
    });

    $(document).on("click", "#order-received-btn", function (e) {
        console.log("Order received button clicked");
        popup = document.getElementById("order-received-popup");
        popup.classList.remove("hidden");
        const stars = document.querySelectorAll('.star');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                updateStarDisplay(selectedRating);
            });

            star.addEventListener('mouseover', () => {
                updateStarDisplay(index + 1);
            });

            star.addEventListener('mouseout', () => {
                updateStarDisplay(selectedRating);
            });
        });

        $(document).on("click", function (event) {
            const popup = document.getElementById("order-received-popup");
            const button = document.getElementById("order-received-btn");

            if (
                popup &&
                !popup.classList.contains("hidden") &&
                !popup.contains(event.target) &&
                !button.contains(event.target)
            ) {
                popup.classList.add("hidden");
            }
        });


        function updateStarDisplay(rating) {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('selected');
                } else {
                    star.classList.remove('selected');
                }
            });
        }
    });

    $(document).on("click", "#confirm-receipt-btn", function (e) {
        if (selectedRating === 0) {
            showPopupMessage("Please select a rating before confirming!");
        } else {
            $.ajax({
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                url: `/customer_order/rate_delivery/${selectedOrder.id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    delivery_rating: selectedRating // Send the delivery rating
                }),
                success: function (response) {
                    console.log("Delivery rating submitted successfully:", response);
                    showPopupMessage(`Thanks! You rated the delivery ${selectedRating} star(s)!`);
                    popup.classList.add("hidden");
                },
                error: function (xhr, status, error) {
                    console.error("Error submitting delivery rating:", error);
                    showPopupMessage("Failed to submit delivery rating. Please try again later.");
                }
            });

            $.ajax({
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                url: `/customer_order/order_delivered/${selectedOrder.id}`, // Replace with the correct order ID
                method: 'PUT',
                contentType: 'application/json',
                success: function (response) {
                    console.log("Order marked as delivered successfully:", response);
                    showPopupMessage("Order has been marked as delivered!");
               //updates the user data
                    $.ajax({
                        headers: {
                            'Authorization': 'Bearer ' + getAuthToken()
                        },
                        url: '/user/me',
                        method: 'GET',
                        dataType: 'json',
                        success: function (updatedUser) {
                            user = updatedUser;
                            displayOrders();
                        },
                        error: function () {
                            console.warn("Could not refresh user data after marking order as delivered.");
                            displayOrders();
                        }
                    });
                    // Optionally update the UI to reflect the delivered status
                },
                error: function (xhr, status, error) {
                    console.error("Error marking order as delivered:", error);
                    showPopupMessage("Failed to mark order as delivered. Please try again later.");
                }
            });
        }
    });
}


// Function that changes between the "User Info" view and the "Edit User" view on the right side of the page.
function toggleOrderEditMode(editMode) {
    if (editMode) {
        $(".order-info").addClass("d-none");
        $(".edit-order-input").removeClass("d-none");
        $("#edit-order").addClass("d-none");
        $("#save-button").removeClass("d-none");
        $("#delete-button").removeClass("d-none");

    } else {
        $(".order-info").removeClass("d-none");
        $(".edit-order-input").addClass("d-none");
        $("#edit-order").removeClass("d-none");
        $("#save-button").addClass("d-none");
        $("#delete-button").addClass("d-none");
    }
}


function editOrder(selectedOrder) {
    const productList = selectedOrder.products.map(item => `${item.product.name} x ${item.quantity}`).join(', ');
    $("#product-input").html(`<span class="order-info">${productList}</span>`);

    $("#time-limit-input").val(selectedOrder.time_limit);
    $("#building-input").val(selectedOrder.building);
    $("#room-input").val(selectedOrder.room);
    $("#comment-input").val(selectedOrder.comment);
}


function saveOrderInfo(selectedOrder) {
    timeLimit = $("#time-limit-input").val();
    building = $("#building-input").val();
    room = $("#room-input").val();
    comment = $("#comment-input").val();

    const copy = selectedOrder;
    console.log(copy.id);
    const list = getIDList(copy.products);
    updateOrder(copy.recipient_user_id, building, room, list, copy.price, comment, timeLimit);
    deleteOrder(copy.id);
}


function getIDList(cart) {
    let idList = [];
    for (let item of cart) {
        idList.push(parseInt(item.product.id));
    }
    return idList;
}


function updateOrder(user_id, house, room, products, cost, comment, time) {
    $.ajax({
        url: getHost() + '/customer_order/',
        type: 'POST',
        headers: {
            Authorization: "Bearer " + getAuthToken(),
          },
        contentType: 'application/json',
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
            console.log(user_id, house, room, products, cost, comment, time);
        },
        error: function (xhr, status, error) {
            console.error("Fel vid hämtning av produkter:", user_id, house, room, products, cost, comment, time);
        }
    });
}


function deleteOrder(orderID) {
    $.ajax({
        url: getHost() + '/customer_order/' + orderID,
        type: 'DELETE',
        headers: {
            Authorization: "Bearer " + getAuthToken(),
        },
        success: function (response) {
            displayOrders();
            console.log(response);
        },
        error: function (xhr, status, error) {
            console.error("Fel vid hämtning av id:", orderID);
        }
    });
}


function updateOrderProgress(status) {
    const labels = $(".progress-label");
    const bar1 = $("#progress-fill-pending-accepted");
    const bar2 = $("#progress-fill-accepted-delivered");

    $(".progress-label").removeClass("active");
    $("#progress-fill-pending-accepted").css("height", "0%");
    $("#progress-fill-accepted-delivered").css("height", "0%");

    if (!status) return; //  exit early if status is null/undefined

    if (status === "pending") {
        labels.eq(0).addClass("active");
    }

    if (status === "accepted") {
        bar1.css("height", "100%");
        labels.eq(0).addClass("active");
        labels.eq(1).addClass("active");

    }

    if (status === "delivered") {
        setTimeout(() => {
            bar1.css("height", "100%");
            labels.eq(0).addClass("active");
        }, 500);

        setTimeout(() => {
            bar2.css("height", "100%");
            labels.eq(1).addClass("active");
        }, 1500);

        setTimeout(() => {
            // bar2.css("height", "100%");
            // labels.eq(1).addClass("active");
            labels.eq(2).addClass("active");
        }, 2500);
    }
}


function populateOrderSelect(orders) {
    const select = $('#myorder-select');
    select.empty();
    select.append('<option disabled>Choose an order</option>');
    console.log("Orders:", orders);

    orders.forEach((order, index) => {
        select.append(`<option value="${index}">Order #${index + 1}</option>`);
    });

    if (orders.length > 0) {
        const lastIndex = orders.length - 1;
        select.val(lastIndex); // Auto-select the last order
        selectedOrder = orders[lastIndex];
        updateDelivererInfo(selectedOrder);
        updateOrderProgress(selectedOrder.order_status);
    } else {
        // 💡 No orders left — clear everything
        selectedOrder = null;
        updateDelivererInfo(null);
        updateOrderProgress(null);
        select.append('<option disabled selected>No active orders</option>');
    }

    select.off('change').on('change', function () {
        const selectedIndex = $(this).val();
        selectedOrder = orders[selectedIndex];
        updateDelivererInfo(selectedOrder);
        updateOrderProgress(selectedOrder.order_status);
    });
}


function displayOrders() {
    $.ajax({
        headers: {
            'Authorization': 'Bearer ' + getAuthToken()
         },
        url: `/user/current_orders`,
        method: 'GET',
        dataType: 'json',
        success: function (orders) {
            populateOrderSelect(orders);
        }
    })
}


function updateDelivererInfo(order) {
    if(!order){
        $("#deliverer-name-value").text("");
        $("#deliverer-phone-value").text("");
        $("#deliverer-email-value").text("");
        $("#deliverer-rating-value").text("");
        $("#product").html("");
        $("#time-limit").html("");
        $("#building").html("");
        $("#room").html("");
        $("#comment").html("");
        $("#edit-order").hide();
        $("#order-received-btn").hide();
        return;
    }
    if (order.delivery_user_id != null) {
        $.ajax({
            url: `/user/${order.delivery_user_id}`,
            method: 'GET',
            dataType: 'json',
            success: function (user) {
                $("#deliverer-name-value").text(user.first_name);
                $("#deliverer-phone-value").text(user.phone_number);
                $("#deliverer-email-value").text(user.email);
                $("#deliverer-rating-value").text(user.rating);
                $('#profile-picture-order img').attr('src', user.image_url);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching customer info:", error);
                showPopupMessage("Failed to fetch customer info. Please try again later.");
            }
        });
    } else {
        $("#deliverer-name-value").text("");
        $("#deliverer-phone-value").text("");
        $("#deliverer-email-value").text(""); 
        $("#deliverer-rating-value").text("");
       
    }

    // Remove edit button if the order is not pending 
    if (selectedOrder.order_status !== "pending") {
        document.getElementById("edit-order").style.display = "none";
        document.getElementById("order-received-btn").style.display = "block";
    } else {
        document.getElementById("edit-order").style.display = "block";
        document.getElementById("order-received-btn").style.display = "none";
    }

    // Dynamically updates the information
    // console.log(order.products);
    const productList = order.products.map(item => `${item.quantity} x ${item.product.name}`).join('<br>');
    $("#product").html(`<span class="order-info">${productList}</span>`);
    $("#time-limit").html(`<span class="order-info">${order.time_limit}</span>`);
    $("#building").html(`<span class="order-info">${order.building}</span>`);
    $("#room").html(`<span class="order-info">${order.room}</span>`);
    $("#comment").html(`<span class="order-info">${order.comment}</span>`);
}


function showPopupMessage(message) {
    $("#custom-popup-message").text(message);
    $("#custom-popup").removeClass("hidden");
}

$("#custom-popup-close").on("click", function () {
    $("#custom-popup").addClass("hidden");
});
