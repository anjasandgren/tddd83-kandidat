from flask import Blueprint

# Import all route modules
# Continiously add new ones as they are created
from app.routes.user_routes import user_bp
from app.routes.customer_order_routes import co_bp
from app.routes.product_routes import product_bp
from app.routes.payment_routes import payment_bp
from app.routes.base_routes import base_bp
from app.routes.stripe_routes import stripe_bp

# List of all blueprints
blueprints = [user_bp, co_bp, product_bp, payment_bp, base_bp, stripe_bp]

def register_routes(app):
    """Registers all blueprints with the Flask app."""

    for bp in blueprints:
        app.register_blueprint(bp)

