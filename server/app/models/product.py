from app.extensions import db
from app.models.customer_order import OrderProduct


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False, unique=False)
    stock = db.Column(db.Integer, nullable=False, unique=False)
    description = db.Column(db.String, nullable=True, unique=False)
    category = db.Column(db.String, nullable=True, unique=False)
    #image_url = db.Column(db.String, nullable=True, unique=False)

    # The __repr__ method is used to display a representation of the object in debugging
    def __repr__(self):
        return '<Product {}: {} {} {} {}>'.format(self.id,
                                                  self.name,
                                                  self.price,
                                                  self.stock,
                                                  self.description,
                                                  self.category)

    def serialize(self):
        return dict(id=self.id, 
                    name=self.name, 
                    price=self.price, 
                    stock=self.stock,
                    description=self.description,
                    category = self.category)
    
    
