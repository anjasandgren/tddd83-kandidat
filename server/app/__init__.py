from flask import Flask
from app.extensions import init_extensions
from app.routes import register_routes
from app.config import Config


def create_app():
    app = Flask(__name__, static_folder="../../client", static_url_path="/")
    app.config.from_object(Config)

    # Initialize Flask Extensions
    init_extensions(app)

    # Register API Routes
    register_routes(app)

    return app


