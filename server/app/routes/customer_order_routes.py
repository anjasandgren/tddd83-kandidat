from flask import Blueprint, request, jsonify, session
from app.models.customer_order import Customer_order, OrderProduct
from app.models.product import Product
from app.models.user import User
from app.extensions import db
from datetime import datetime
from collections import Counter
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

co_bp = Blueprint("customer_order", __name__, url_prefix="/customer_order")


# This route creates a customer order
# Need to be authenticated to make an order
# Requires: "recipient_user_id" <int> , "building" <string> , "room" <string> , "products"<list<int>>, cost<float>
# Optional: comment<string>, time_limit<hour,minute>
@co_bp.route("/", methods =["POST"])
@jwt_required()
def register():
    data = request.json
    required_fields = ["recipient_user_id",
                       "building",
                       "room",
                       "products"]
    missing_fields = [field for field in required_fields
                      if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    recipient_user = User.query.get(data["recipient_user_id"])
    if not recipient_user:
        return jsonify({"error": "Recipient user not found"}), 404

    product_counts = Counter(data["products"])
    product_ids = list(product_counts.keys())
    products = Product.query.filter(Product.id.in_(product_ids)).all()

    if not products:
        return jsonify({"error": "No valid products found for the given IDs"}), 400

    new_order = Customer_order(
        recipient_user_id=data["recipient_user_id"],
     
        comment=data.get("comment"),
        order_status="pending",
        order_date=datetime.now(),
        price = data["cost"],
        room = data["room"],
        building = data["building"]
    )
    if "time_limit" in data:
        new_order.time_limit=data["time_limit"]
    else:
        new_order.time_limit=20 #if recipient does not choose a time limit, 20 minutes is automatically set

    for product in products:
        quantity = product_counts[product.id]
        products = OrderProduct(product=product, quantity=quantity)
        new_order.products.append(products)

    recipient_user.balance -= data["cost"]

    db.session.add(new_order)
    db.session.commit()
    return jsonify(new_order.serialize())


#Helper function to remove orders that have expired
def clean_up_expired(orders):
    clean = []
    for order in orders:
        if not order.check_and_expire(db):
            clean.append(order)

    return clean


# Route that lists all pending orders
@co_bp.route("/pending", methods=["GET"])
def get_pending_all():
    pending_orders = Customer_order.query.filter_by(order_status="pending").all()
    pending_orders = clean_up_expired(pending_orders)
    return jsonify([order.serialize() for order in pending_orders]), 200


# Route that lists all pending orders, filtering out a users own orders
@co_bp.route("/pending/<int:user_id>", methods=["GET"])
def get_pending(user_id):
    pending_orders = Customer_order.query.filter(
    Customer_order.order_status == "pending",
    Customer_order.recipient_user_id != user_id
    ).all()
    
    pending_orders = clean_up_expired(pending_orders)
    
    if(len(pending_orders)==0):
        return jsonify({"message": "No pending orders found"}), 404
    return jsonify([order.serialize() for order in pending_orders]), 200

#This route updates the status of the order to accepted and assigns a delivery user
#Requires: "delivery_user_id"<int>
@co_bp.route("/order_accepted/<int:customer_order_id>", methods =["POST"])
@jwt_required()
def update_status_accepted(customer_order_id):
    customer_order = Customer_order.query.get(customer_order_id)
    current_user_email = get_jwt_identity()
    delivery_user = User.query.filter_by(email=current_user_email).first()
    if customer_order.check_and_expire(db):
        return jsonify({"error": "Customer order expired"}), 410

    if not customer_order.order_status == "pending":
        return jsonify({"error": "Order already accepted"}), 410

    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404

    if not delivery_user:
        return jsonify({"error": "Delivery user not found"}), 404
    customer_order.delivery_user_id=delivery_user.id
    customer_order.order_status="accepted"
    db.session.commit()
    return jsonify(customer_order.serialize())


# This route updates the status of the order to delivered and handles payment to the deliverer
# Need to be a valid deliverer for the order to change
@co_bp.route("/order_delivered/<int:customer_order_id>", methods =["PUT"])
@jwt_required()
def update_status_delivered(customer_order_id):
    customer_order = Customer_order.query.get(customer_order_id)
    
    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404
    if not customer_order.order_status == "accepted":
        return jsonify({"error": "Customer order not accepted"}), 400
    customer_order.order_status="delivered"
    customer_order.delivery_date=datetime.now()
    deliverer = User.query.get(customer_order.delivery_user_id)
    deliverer.balance += (customer_order.price -1); # deliverer gets the price of the order -1 for service fee
    db.session.commit()
    return jsonify(customer_order.serialize())


# This route updates the rating of the delivery user
# Can not be updated if user not valid
# Requires: "delivery_rating"<float>
@co_bp.route("/rate_delivery/<int:customer_order_id>", methods =["PUT"])
@jwt_required()
def rate_delivery(customer_order_id):
    data = request.json
    customer_order = Customer_order.query.get(customer_order_id)
    
    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404
    if "delivery_rating" not in data:
        return jsonify({"error": "Missing required field: delivery_rating"}), 400
    customer_order.delivery_rating=data["delivery_rating"]
    delivery_user = User.query.get(customer_order.delivery_user_id)
    delivery_user.nr_deliveries += 1
    delivery_user.update_delivery_rating()
    db.session.commit()
    return jsonify(customer_order.serialize())


# This route updates the rating of the recipient user
# Can not be updated if recipient is not a valid user
# Requires: "recipient_rating"<float>
@co_bp.route("/rate_recipient/<int:customer_order_id>", methods = ["PUT"])
@jwt_required()
def rate_recipient(customer_order_id):
    data = request.json
    customer_order = Customer_order.query.get(customer_order_id)
    
    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404
    if "recipient_rating" not in data:
        return jsonify({"error": "Missing required field: recipient_rating"}), 400
    customer_order.recipient_rating=data["recipient_rating"]
    recipient_user = User.query.get(customer_order.recipient_user_id)
    recipient_user.nr_orders += 1
    recipient_user.update_recipient_rating()
    db.session.commit()
    return jsonify(customer_order.serialize())


# This route gets a specific customer order
@co_bp.route("/<int:customer_order_id>", methods =["GET"])
def get_customer_order(customer_order_id):
    customer_order = Customer_order.query.get(customer_order_id)
    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404
    return jsonify(customer_order.serialize())

# Get all customer orders
@co_bp.route("/", methods =["GET"])
def all_customer_orders():
    customer_orders = Customer_order.query.all()
    customer_orders = clean_up_expired(customer_orders)
    return jsonify([customer_order.serialize() for customer_order in customer_orders])   


#Delete a pending customer order
@co_bp.route("/<int:customer_order_id>", methods=["DELETE"])
def delete_order(customer_order_id):
    customer_order = Customer_order.query.get(customer_order_id)
    if not customer_order:
        return jsonify({"error": "Customer order not found"}), 404

    if customer_order.order_status != "pending":
        return jsonify({"error": "Order is not allowed to be deleted"}), 403

    recipient_user = User.query.get(customer_order.recipient_user_id)
    recipient_user.balance += customer_order.price

    db.session.delete(customer_order)   
    db.session.commit()

    return jsonify({"msg": "Customer order deleted successfully"}), 200

    


