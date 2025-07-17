from flask import Blueprint, request, jsonify
from app.models.product import Product
from app.extensions import db
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

product_bp = Blueprint("product", __name__, url_prefix="/product")


# Create a new product
# Required: "name"<string>, "price"<float>, stock<int>
# Optional: "description"<string>
@product_bp.route("/", methods =["POST"])
@jwt_required() 
def register():
    data = request.json
    required_fields = {"name",
                       "price",
                       "stock"}
    missing_fields = [field for field in required_fields
                      if field not in data]

    if missing_fields:
        return jsonify({"error": "Missing required fields", "missing": list(missing_fields)}), 400

    new_product = Product(name=data["name"],
                          price=data["price"],
                          stock=data["stock"])
    if "description" in data:
        new_product.description = data["description"]
    db.session.add(new_product)
    db.session.commit()
    return jsonify(new_product.serialize())


# Get all products
@product_bp.route("/", methods =["GET"])
def all_products():
    products = Product.query.all()
    if not products:
        return jsonify({"error": "Products not found"}), 400
    return jsonify([product.serialize() for product in products])   
