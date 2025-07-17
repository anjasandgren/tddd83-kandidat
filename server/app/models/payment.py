from app.extensions import db


class Payment(db.Model):
    session_id = db.Column(db.String, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=False)
    amount = db.Column(db.Float, nullable=False, unique=False)
    payment_time = db.Column(db.DateTime, nullable=False, unique=False)
    status = db.Column(db.String, nullable=True, unique=False)


    # The __repr__ method is used to display a representation of the object in debugging
    def __repr__(self):
        return '<Payment {}: {} {} {} {} {} {}>'.format(self.session_id,
                                                        self.user_id,
                                                        self.order_id,
                                                        self.amount,
                                                        self.payment_time,
                                                        self.status)

    def serialize(self):
        return dict(id=self.session_id,
                    user_id=self.user_id,
                    amount=self.amount,
                    # payment_time=self.payment_time,
                    payment_time=self.payment_time.strftime("%Y-%m-%d %H:%M:%S"),
                    status=self.status)
    