from app.extensions import db, bcrypt
from sqlalchemy import event


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    phone_number = db.Column(db.String, nullable=False, unique=False)
    password_hash = db.Column(db.String, nullable=False, unique=False)
    delivery_rating = db.Column(db.Float, nullable=True, unique=False, default=4.5)
    recipient_rating = db.Column(db.Float, nullable=True, unique=False, default=4.5)
    admin = db.Column(db.Boolean, nullable=False, unique=False, default=False)
    delivery_history = db.relationship('Customer_order',
                                        backref='delivery_user', 
                                        lazy=True, 
                                        foreign_keys='Customer_order.delivery_user_id')
    
    recipient_history = db.relationship('Customer_order', 
                                        backref='recipient_user', 
                                        lazy=True, 
                                        foreign_keys='Customer_order.recipient_user_id')
    program = db.Column(db.String, nullable=False, unique=False)
    balance = db.Column(db.Float, nullable=False, unique=False, default=0.0)
    image_url = db.Column(db.String, nullable=False, default="images/default.png")
    nr_deliveries = db.Column(db.Integer, nullable=False, unique=False, default=0)
    nr_orders = db.Column(db.Integer, nullable=False, unique=False, default=0)


    #Password setting and handling
    @property
    def password(self):
        #Should not return in deployed setting
        return password_hash

    @password.setter
    def password(self, plaintext_password):
        self.password_hash = bcrypt.generate_password_hash(plaintext_password).decode('utf-8')

    def check_password(self, plaintext_password):
        return bcrypt.check_password_hash(self.password_hash, plaintext_password)


    #The __repr__ method is used to display a string representation of the object in debugging
    def __repr__(self):
        return '<User {}: {} {} {} {} {} {} {} {} {} {}>'.format(self.id, self.first_name,
                                                                 self.last_name, self.email,
                                                                 self.phone_number,
                                                                 self.password_hash,
                                                                 self.delivery_rating,
                                                                 self.recipient_rating,
                                                                 self.admin,
                                                                 self.delivery_history,
                                                                 self.recipient_history,
                                                                 self.program,
                                                                 self.balance,
                                                                 self.image_url,
                                                                 self.nr_deliveries,
                                                                 self.nr_orders)

    def serialize(self):
        return dict(
            id=self.id,
            first_name=self.first_name,
            last_name=self.last_name,
            email=self.email,
            phone_number=self.phone_number,
            delivery_rating=self.delivery_rating,
            recipient_rating=self.recipient_rating,
            admin=self.admin,
            delivery_history=[order.serialize() for order in self.delivery_history],
            recipient_history=[order.serialize() for order in self.recipient_history],
            program=self.program,
            balance = self.balance,
            image_url=self.image_url,
            nr_deliveries=self.nr_deliveries,
            nr_orders=self.nr_orders)

    def update_delivery_rating(self):
        """Calculate and update the user's delivery rating based on their delivery history"""
        delivered_orders = [order for order in self.delivery_history
                            if order.delivery_rating is not None]
        
        if not delivered_orders:
            self.delivery_rating = 5.0
            return
        
        total_rating = sum(order.delivery_rating for order in delivered_orders)
        self.delivery_rating = round(total_rating / len(delivered_orders), 2)
        db.session.commit()


    def update_recipient_rating(self):
        """Calculate and update the user's recipient rating based on their recipient history"""
        recipient_orders = [order for order in self.recipient_history 
                          if order.recipient_rating is not None]
        
        if not recipient_orders:
            self.recipient_rating = 5.0
            return
        
        total_rating = sum(order.recipient_rating for order in recipient_orders)
        self.recipient_rating = round(total_rating / len(recipient_orders), 2)
        db.session.commit()