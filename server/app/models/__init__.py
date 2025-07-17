from flask_sqlalchemy import SQLAlchemy

# Import all models to ensure they are registered with SQLAlchemy
# Add new ones as they are created
from app.models.user import User
from app.models.payment import Payment
#from app.extensions import db

from app.models.customer_order import Customer_order, OrderProduct
from app.models.product import Product
