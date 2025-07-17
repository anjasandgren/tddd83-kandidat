from sqlite3 import IntegrityError
from flask import Blueprint, request, jsonify
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

user_bp = Blueprint("user", __name__, url_prefix="/user")

# Create a new user
# Required: "first_name"<string>, "last_name"<string>, "email"<string>, "phone_number"<int>, 
#          "password"<string>, "admin"<bool>, "program"<string>
@user_bp.route("/sign-up", methods =["POST"])
def register():
    data = request.json
   
    required_fields = {"first_name", "last_name", "email", "phone_number", "password", "admin", "program"}
    missing_fields = [field for field in required_fields if field not in data]
   
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email is already being used"}), 400
    else:
    
        new_user = User(first_name =data["first_name"],
                        last_name =data["last_name"],
                        email=data["email"],
                        phone_number =data["phone_number"],
                        password =data["password"],
                        program =data["program"]
                        )
        
        if "image_url" in data:
            new_user.image_url = data["image_url"]

        db.session.add(new_user)


        try:
            db.session.commit()
            return jsonify(new_user.serialize())
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "User with that email already exists"}), 400


# Get a user by ID
@user_bp.route("/<int:user_id>", methods =["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    user.update_recipient_rating()
    user.update_delivery_rating()

    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.serialize())


# Modify an existing user
# Need to be a valid user in order to change one
# Optional fields: "first_name"<string>, "last_name"<string>, "email"<string>, "phone_number"<int>,
#                 "password"<string>, "admin"<bool>, "program"<string>'
@user_bp.route("/<int:user_id>", methods =["PUT"])
@jwt_required() 
def update_user(user_id):
    data = request.json
    user = User.query.get_or_404(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "email" in data:
        user.email = data["email"]
    if "phone_number" in data:
        user.phone_number = data["phone_number"]
    if "password_hash" in data:
        user.password_hash = data["password"]
    if "admin" in data:
        user.admin = data["admin"]
    if "program" in data:
        user.program = data["program"]
    if "image_url" in data:
        user.image_url = data["image_url"]
    db.session.commit()
    return jsonify(user.serialize())


# Get user recipient history
# Is only possible for a valid user
@user_bp.route("/<int:user_id>/recipient_history", methods=["GET"])
@jwt_required() 
def get_recipient_history(user_id):
    user = User.query.get_or_404(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 400
    return jsonify([order.serialize() for order in user.recipient_history])


# Get user delivery history
# Only possible for a user
@user_bp.route("/<int:user_id>/delivery_history", methods=["GET"])
@jwt_required() 
def get_delivery_history(user_id):
    user = User.query.get_or_404(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 400
    return jsonify([order.serialize() for order in user.delivery_history])


# Get all users
@user_bp.route("/", methods =["GET"])
def all_users():
    users = User.query.all()
    if not users:
        return jsonify({"error": "Users not found"}), 400
    return jsonify([user.serialize() for user in users])


# Add user balance
# Only possible for a valid user
@user_bp.route("/<int:user_id>/add_balance", methods=["PUT"])
@jwt_required() 
def add_balance(user_id):
    data = request.json
    user = User.query.get_or_404(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 400
    if "balance" not in data:
        return jsonify({"error": "Missing required field: balance"}), 400
    user.balance += data["balance"]
    db.session.commit()
    return jsonify(user.serialize())


# More secure way of getting the current user, allows the user (and only the user) to get its information
@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if user:
        return jsonify(user.serialize())
    else:
        return jsonify({"error": "User not found"}), 404
    
    
# More secure route to change user information, requires the user itself to be logged in to change information
@user_bp.route("/me", methods=["PUT"])
@jwt_required
def update_current_user():
    data = request.json
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "email" in data:
        user.email = data["email"]
    if "phone_number" in data:
        user.phone_number = data["phone_number"]
    if "password_hash" in data:
        user.password_hash = data["password_hash"]
    if "admin" in data:
        user.admin = data["admin"]
    if "program" in data:
        user.program = data["program"]
    if "image_url" in data:
        user.image_url = data["image_url"]
   
    db.session.commit()
    return jsonify(user.serialize())



#Gets all non-completed orders for a recipient
@user_bp.route("/current_orders", methods=["GET"])
@jwt_required()
def get_my_orders():

    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    non_completed_orders = [
        order.serialize() for order in user.recipient_history 
        if order.order_status in ('pending', 'accepted')
    ]

    return jsonify(non_completed_orders)


#Gets all non-completed orders for a deliverer
@user_bp.route("/current_deliveries", methods=["GET"])
@jwt_required()
def get_my_deliveries():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    active_deliveries = [
        order.serialize() for order in user.delivery_history 
        if order.recipient_rating is None  # this lets "delivered" orders show until rated
    ]

    return jsonify(active_deliveries)

