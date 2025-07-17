from flask import Blueprint, request, jsonify
from app.models.payment import Payment
from app.extensions import db
from datetime import datetime
from app.models.user import User
from app.models.customer_order import Customer_order
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

payment_bp = Blueprint("payment", __name__, url_prefix="/payment")

# Starts a payment
# Recipient need to be a valid user
# Required: "user_id"<int>, "order_id"<int>, "amount"<int>
# Optional: receipt<string>, status<string>
@payment_bp.route("/", methods =["POST"])
#@jwt_required()
def register():
    data = request.json
    required_fields = ["user_id",
                       "order_id",
                       "amount"]
    missing_fields = [field for field in required_fields
                      if field not in data]
    
    if missing_fields:
        return jsonify({"error": "Missing required fields", "missing": missing_fields}), 400
    user = User.query.get(data["user_id"])
    if not user:
        return jsonify({"error": "Payment user not found"}), 404
    order = Customer_order.query.get(data["order_id"])
    if not order:
        return jsonify({"error": "Order not found"}), 404
    new_payment = Payment(user_id= data["user_id"],
                          order_id=data["order_id"],
                          amount=data["amount"])
    if "receipt" in data:
        new_payment.receipt=data["receipt"]
    if "status" in data:
        new_payment.status=data["status"]
    new_payment.payment_time=datetime.now()
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.serialize())


# Get all payments
# Need to be a valid user, might need more protection here - isAdmin?
@payment_bp.route("/", methods =["GET"])
#@jwt_required()
def all_payments():
    payments = Payment.query.all()
    return jsonify([payment.serialize() for payment in payments])   

#returns all payments for a specific user
@payment_bp.route("/myPayments", methods =["GET"])
@jwt_required()
def my_payments():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    my_user_id = user.id
    payments = Payment.query.filter_by(user_id=my_user_id).all()
    if not payments:
        print("No payments found for this user")    
        return jsonify({"error": "No payments found for this user"}), 404
    return jsonify([payment.serialize() for payment in payments])  
