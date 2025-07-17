from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import stripe
import os
stripe.api_key = 'sk_test_51R28RIJjAmpM2ZLbdFlnCnil3SHgzZJFBZc46nH5RdZrPHxoQkbSHK5X8w4gDCRitctbFe0aRkCvgwNoRnv49cqD00Q36DPcol'


db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def init_extensions(app):
    """Initialize all Flask extensions with the app instance."""
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)