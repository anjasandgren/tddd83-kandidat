from flask import Blueprint, request, jsonify, current_app, make_response
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from datetime import timedelta


#This file contains miscellaneous blueprints that use the base path (website.com/...)

base_bp = Blueprint("base", __name__, url_prefix = "")


@base_bp.route("/login", methods=["POST"])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    loginUser = User.query.filter_by(email=email).first()

    if loginUser and loginUser.check_password(password):
        access_token = create_access_token(identity=email)  
        
        #Authentication token for cookie to save login
        refresh_token = create_refresh_token(identity=email, expires_delta=timedelta(days=7))

        response = make_response(jsonify({
            "token": access_token,
            "user": loginUser.serialize()
        }))
        
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=60*60*24*7  # 7 days
        )

        return response

    return jsonify({"msg": "Bad username or password"}), 401

@base_bp.route("/refresh-login", methods=["POST"])
def refresh():
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return jsonify({"msg": "Missing refresh token"}), 401

    try:
        decoded = decode_token(refresh_token)
        email = decoded["sub"]  # You used email as identity in login
    except Exception as e:
        print("Refresh token error:", e)
        return jsonify({"msg": "Invalid or expired refresh token"}), 401

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    new_access_token = create_access_token(identity=email)

    return jsonify({
        "token": new_access_token,
        "user": user.serialize()
    })
    
@base_bp.route("/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"msg": "Logged out"}))
    response.set_cookie(
        "refresh_token",
        value="",
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=0  # Expire immediately
    )
    return response
        

@base_bp.route("/")
def index():
    return current_app.send_static_file("index.html")







