from flask import Blueprint, request, jsonify, redirect
from app.models.user import User
from app.models.payment import Payment
from app.extensions import stripe
from app.extensions import db
from datetime import datetime

stripe_bp = Blueprint("stripe", __name__, url_prefix="/stripe")


# Creates a checkout session
@stripe_bp.route("/<int:user_id>/create-checkout-session/<int:amount_to_add>", methods=["POST"])
def create_checkout_session(user_id, amount_to_add):
    
    user = User.query.get_or_404(user_id)
    my_url = request.url_root
    # Ensure the user has a Stripe customer object
    customers = stripe.Customer.search(query=f"metadata['user_id']:'{user_id}'").data
    customer = customers[0] if customers else stripe.Customer.create(name=f"{user.first_name} {user.last_name}",
                                                                     email= user.email,
                                                                     metadata={"user_id": user_id})
    try:
        checkout_session = stripe.checkout.Session.create(
                line_items=[{
            "price_data": {
            "currency": "sek",
            "product_data": {"name": 
                             "Balance Top-Up"},
            "unit_amount": int(amount_to_add) * 100  # Stripe expects öre (cents), so multiply by 100
            },
            "quantity": 1,
        }],
            payment_method_types=["card"],
            mode="payment",
            customer=customer.id,
            metadata={"user_id": user_id},
            success_url=f"{my_url}/stripe/payment-success?session_id={{CHECKOUT_SESSION_ID}}", #where to redirect after payment is successful
            cancel_url=f"{my_url}" #where to redirect if payment is cancelled
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400


    return jsonify({"session_id": checkout_session.id})

@stripe_bp.route("/payment-success", methods=["GET"])
def payment_success():
    my_url = request.url_root
    session_id = request.args.get("session_id")
    session = stripe.checkout.Session.retrieve(session_id)
    user_id = int(session.metadata.get("user_id"))
    user = User.query.get_or_404(user_id)
    payment = Payment(
            session_id=request.args.get("session_id"),
            user_id=user_id,
            amount=session.amount_total / 100,
            payment_time=datetime.now(),
            status=session.payment_status
        )
    db.session.add(payment)
    db.session.commit()
    if session.payment_status == "paid":
        user.balance += session.amount_total / 100  # Convert öre to SEK
        db.session.commit()
        return redirect(my_url)



    return "Payment not successful", 400
