from app.extensions import db
from app.models import User
from datetime import datetime


#Helper table for connecting orders with products
class OrderProduct(db.Model):
    __tablename__ = 'order_product'
    order_id = db.Column(db.Integer, db.ForeignKey('customer_order.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    
    order = db.relationship("Customer_order", back_populates="products")
    product = db.relationship("Product")


class Customer_order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    delivery_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_status = db.Column(db.String, nullable=True)
    location = db.Column(db.String, nullable=True, default = "Change to building & room")
    building = db.Column(db.String, nullable = True)
    room = db.Column(db.String, nullable=True)
    order_date = db.Column(db.DateTime, nullable=True) #ska denna sättas i FE eller BE?
    comment = db.Column(db.String, nullable=True) 
    delivery_date = db.Column(db.DateTime, nullable=True)
    delivery_rating = db.Column(db.Float, nullable=True)
    recipient_rating = db.Column(db.Float, nullable=True)
    price = db.Column(db.Float, nullable=True)
    
    products = db.relationship("OrderProduct", back_populates="order", cascade="all, delete-orphan")

    time_limit = db.Column(db.Integer, nullable=True)

    #The __repr__ method is used to display a representation of the object in debugging
    def __repr__(self):
        return '<Customer_order {}: {} {} {} {} {}>'.format(self.id,
                                                            self.delivery_user_id,
                                                            self.recipient_user_id,
                                                            self.order_status,
                                                            self.building,
                                                            self.room,
                                                            self.order_date,
                                                            self.comment,
                                                            self.delivery_date,
                                                            self.recipient_rating,
                                                            self.price,
                                                            self.time_limit)

    def serialize(self):
        return dict(id=self.id, 
                    delivery_user_id=self.delivery_user_id,
                    recipient_user_id=self.recipient_user_id,
                    order_status=self.order_status, 
                    order_date=self.order_date, 
                    comment=self.comment,
                    location=self.location,
                    building = self.building,
                    room = self.room,
                    products=[
                        {
                        "product": op.product.serialize(),
                        "quantity": op.quantity
                        } for op in self.products
                    ],
                    delivery_date=self.delivery_date, 
                    delivery_rating=self.delivery_rating, 
                    recipient_rating=self.recipient_rating,
                    price = self.price,
                    time_limit = self.time_limit
                    )

    def check_and_expire(self, db):
        if self.time_limit:
            limit = datetime.strptime(self.time_limit, "%H:%M").time()
            if limit < datetime.now().time() and self.order_status == "pending":
                print("Deleting order (id: ", self.id, ") due to time limit")
                recipient_user = User.query.get(self.recipient_user_id)
                recipient_user.balance += self.price
                db.session.delete(self)
                db.session.commit()
                return True
        return False