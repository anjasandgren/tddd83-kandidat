from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.customer_order import Customer_order, OrderProduct
from app.models.payment import Payment
from app.models.product import Product
from datetime import datetime, timedelta

import os
from random import uniform

def reset_database():
    """Drops all tables, recreates them, and inserts sample data."""
    app = create_app()
  
    with app.app_context():
        # Extract database path from config
        db_path = app.config["SQLALCHEMY_DATABASE_URI"].replace("sqlite:///", "")
        print(f"Using database path: {db_path}")

        # Check if instance folder exists
        instance_dir = os.path.dirname(db_path)
        if not os.path.exists(instance_dir):
            print(f"Creating missing 'instance/' directory at {instance_dir}...")
            os.makedirs(instance_dir)

        # Ensure database file exists
        if not os.path.exists(db_path):
            print(f"Creating database file: {db_path}")
            open(db_path, "a").close()

        # Drop all tables
        print("Dropping all tables...")
        db.drop_all()
        db.create_all()

        # Insert sample users
        user1 = User(first_name="Alice", last_name="Johnson", email="alice@example.com", recipient_rating=2.2, password="password", phone_number="1234567890", program="Engineering", nr_deliveries=2, nr_orders=2, image_url="images/elephant.png")
        user2 = User(first_name="Bob", last_name="Smith", email="bob@example.com", recipient_rating=3.3, password="password", phone_number="0987654321", program="Science", nr_deliveries=3, nr_orders=3, image_url="images/dog.jpeg")
        user3 = User(first_name="Charlie", last_name="Brown", email="charlie@example.com", recipient_rating=4.5, password="password", phone_number="1122334455", program="Arts", nr_deliveries=0, nr_orders=0, image_url="images/monster1.png")
        user4 = User(first_name="Anja", last_name="", email="a", recipient_rating=5.0, password="a", phone_number="0760171915", program="Engineering", nr_deliveries=10, nr_orders=10, balance=86, image_url="images/dog.jpeg")
        user5 = User(first_name="David", last_name="Smith", email="david@example.com", recipient_rating=3.8, password="password", phone_number="2233445566", program="Mathematics", nr_deliveries=5, nr_orders=5, image_url="images/emoji.jpeg")
        user6 = User(first_name="Emma", last_name="Taylor", email="emma@example.com", recipient_rating=4.2, password="password", phone_number="3344556677", program="Physics", nr_deliveries=4, nr_orders=4)
        user7 = User(first_name="Frank", last_name="Miller", email="frank@example.com", recipient_rating=3.0, password="password", phone_number="4455667788", program="Chemistry", nr_deliveries=1, nr_orders=1)
        user8 = User(first_name="Grace", last_name="Wilson", email="grace@example.com", recipient_rating=4.7, password="password", phone_number="5566778899", program="Biology", nr_deliveries=6, nr_orders=6)
        user9 = User(first_name="Hannah", last_name="Moore", email="hannah@example.com", recipient_rating=4.1, password="password", phone_number="6677889900", program="Computer Science", nr_deliveries=3, nr_orders=3)
        user10 = User(first_name="Ian", last_name="Anderson", email="ian@example.com", recipient_rating=3.5, password="password", phone_number="7788990011", program="Economics", nr_deliveries=2, nr_orders=2)
        user11 = User(first_name="Julia", last_name="Thomas", email="julia@example.com", recipient_rating=4.8, password="password", phone_number="8899001122", program="Law", nr_deliveries=7, nr_orders=7, image_url="images/elephant.png")
        user12 = User(first_name="Kevin", last_name="Jackson", email="kevin@example.com", recipient_rating=3.9, password="password", phone_number="9900112233", program="Medicine", nr_deliveries=4, nr_orders=4)
        user13 = User(first_name="Laura", last_name="White", email="laura@example.com", recipient_rating=4.6, password="password", phone_number="1011121314", program="Philosophy", nr_deliveries=5, nr_orders=5, image_url="images/monster1.png")
        user14 = User(first_name="Michael", last_name="Harris", email="michael@example.com", recipient_rating=3.7, password="password", phone_number="1213141516", program="History", nr_deliveries=3, nr_orders=3)
        
        # Insert sample products
        product1 = Product(name="Small coffee - (black)", price=7, stock=99999999, description="A Small coffee", category="Coffee")
        product2 = Product(name="Small coffee - (some milk)", price=7, stock=99999999, description="A Small coffee with some milk", category="Coffee")
        product3 = Product(name="Small coffee - (some oatly)", price=7, stock=99999999, description="A Small coffee with some oatly", category="Coffee")
        product4 = Product(name="Small coffee - (more milk)", price=7, stock=99999999, description="A Small coffee with more milk", category="Coffee")
        product5 = Product(name="Small coffee - (more oatly)", price=7, stock=99999999, description="A Small coffee with more oatly", category="Coffee")
        product6 = Product(name="Large coffee - (black)", price=7, stock=99999999, description="A Large coffee", category="Coffee")
        product7 = Product(name="Large coffee - (some milk)", price=7, stock=99999999, description="A Large coffee with some milk", category="Coffee")
        product8 = Product(name="Large coffee - (some oatly)", price=7, stock=99999999, description="A Large coffee with some oatly", category="Coffee")
        product9 = Product(name="Large coffee - (more milk)", price=7, stock=99999999, description="A Large coffee with more milk", category="Coffee")
        product10 = Product(name="Large coffee - (more oatly)", price=7, stock=99999999, description="A Large coffee with more oatly", category="Coffee")
        product11 = Product(name="Meatball sandwich", price=35, stock=99999999, description="Swedish meatballs served on bread like grandma wished she could make it – cozy, juicy, and totally legendary", category = "Sandwich")
        product12 = Product(name="Pear biscut", price=8, stock=9999999, description="A creamy, fruity twist on the classic. Green, gorgeous, and impossible to resist. One bite and you're hooked", category = "Klägg")
        product13 = Product(name="Shrimp sandwich", price=35, stock=99999999, description="A creamy shrimp salad with a twist of lemon and dill – classy, coastal, and a little bit fancy. Like fika at sea", category = "Sandwich")
        product14 = Product(name="Falafel sandwich", price=35, stock=99999999, description="Crispy falafel balls with fresh veggies and a zesty sauce – fully plant-powered and dangerously delicious", category = "Sandwich")
        product15 = Product(name="Tuna sandwich", price=35, stock=99999999, description="A remix of creamy tuna, red onion and crunchy greens – this sandwich sings with flavor and never goes off-key", category = "Sandwich")
        product16 = Product(name="Ham and Cheese sandwich", price=35, stock=99999999, description="Cheesy, hammy, toasty perfection – simple, nostalgic, and the sandwich equivalent of a warm hug", category = "Sandwich")
        product17 = Product(name="Kebab sandwich", price=35, stock=99999999, description="Juicy kebab slices with creamy garlic sauce – bold, messy, and proud of it. Like 3AM on a Friday after KK, but better", category = "Sandwich")
        product18 = Product(name="Chicken and Bacon sandwich", price=35, stock=99999999, description="Tender chicken and crispy bacon in perfect harmony – smoky, savory, and totally addictive. You've been warned", category = "Sandwich")
        product19 = Product(name="Coconut chocolate ball", price=8, stock=9999999, description="Chocolatey, chewy, and rolled in a tropical snowstorm. A fika-favorite that always sticks the landing", category = "Klägg")
        product20 = Product(name="Sugar chocolate ball", price=8, stock=9999999, description="Old-school chocolate ball rolled in chunky pearl sugar – it’s gritty, nostalgic, and unapologetically sweet. Like childhood but edible", category = "Klägg")
        product21 = Product(name="Vacuum cleaner", price=8, stock=9999999, description="Bright green marzipan, dark chocolate ends, and a soft punch of punsch inside. Weird-looking. Wildly loved.", category = "Klägg")
        product22 = Product(name="Rasberry cave", price=8, stock=9999999, description="A soft buttery cookie with a raspberry heart – the fika version of a warm hug with a gooey secret", category = "Klägg")
        product23 = Product(name="Laffe biscut", price=8, stock=9999999, description="A silky mocha dream with chocolate coating and biscuity crunch. Coffee in dessert form. No further questions", category = "Klägg")
        product24 = Product(name="Lemon biscut", price=8, stock=9999999, description="Sweet meets tangy in this lemony biskvi bomb – sunshine wrapped in chocolate. Like summer just hit your mouth", category = "Klägg")
        product25 = Product(name="Chicken salad", price=49, stock=9999999, description="Grilled chicken meets fresh greens in a salad so good, even your fork gets excited. Light, lean, and full of protein-powered charm.", category = "Salad")
        product26 = Product(name="Shrimp salad", price=49, stock=9999999, description="Juicy prawns dancing on crispy greens with a touch of citrus – refreshing, fancy, and seriously shell-icious", category = "Salad")
        product27 = Product(name="Tuna salad", price=49, stock=9999999, description="Tuna, tangy dressing, and crunchy veg – this is not your boring lunch salad. It's got flavor, it's got moves, it's got tuna.", category = "Salad")
        product28 = Product(name="Falafel salad", price=49, stock=9999999, description="Crispy falafel on a bed of greens with creamy hummus vibes – earthy, wholesome, and totally vibing with your soul.", category = "Salad")
        product29 = Product(name="Greek salad", price=49, stock=9999999, description="Feta, olives, tomatoes, and a little olive oil drama – straight outta Santorini. This salad knows how to party like it's Greek summer", category = "Salad")
        product30 = Product(name="Rasberry soda", price=7, stock=9999999, description="Sweet, pink and proud. Like a summer disco in your mouth. Guaranteed to put a sparkle in your sip – and your soul", category = "Drink")
        product31 = Product(name="Loka", price=7, stock=9999999, description="Crisp, clean, and wildly refreshing. Like snowmelt in the Alps… but with fizz. Hydration with attitude", category = "Drink")
        product32 = Product(name="Trocadero", price=7, stock=9999999, description="A golden mix of apple and citrus with just the right kick of caffeine. Retro, refreshing, and as mysteriously addictive as a midsummer night", category = "Drink")
        # Insert sample orders with different times and dates
        order1 = Customer_order(recipient_user_id=4, delivery_user_id=1, building="A", room="ACAS", order_date=datetime.now(), price=30, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order2 = Customer_order(recipient_user_id=4, delivery_user_id=3, building="B", room="SU06", order_date=datetime.now() - timedelta(days=2, hours=4, minutes=15), price=28, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order3 = Customer_order(recipient_user_id=4, delivery_user_id=4, building="C", room="R1", order_date=datetime.now() - timedelta(days=3, hours=1, minutes=45), price=29, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order4 = Customer_order(recipient_user_id=4, delivery_user_id=1, building="A", room="AG31", order_date=datetime.now() - timedelta(days=4, hours=3, minutes=20), price=29, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order5 = Customer_order(recipient_user_id=4, delivery_user_id=1, building="B", room="Vippan", order_date=datetime.now() - timedelta(days=5, hours=5, minutes=10), price=30, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order6 = Customer_order(recipient_user_id=1, delivery_user_id=4, building="C", room="S10", order_date=datetime.now() - timedelta(days=6, hours=6, minutes=50), price=27, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order7 = Customer_order(recipient_user_id=2, delivery_user_id=4, building="A", room="A1", order_date=datetime.now() - timedelta(days=7, hours=2, minutes=5), price=32, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order8 = Customer_order(recipient_user_id=1, delivery_user_id=4, building="B", room="SU03", order_date=datetime.now() - timedelta(days=8, hours=7, minutes=40), price=29, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order9 = Customer_order(recipient_user_id=4, delivery_user_id=2, building="B", room="SU24", order_date=datetime.now() - timedelta(days=9, hours=3, minutes=15), price=28, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order10 = Customer_order(recipient_user_id=4, delivery_user_id=3, building="C", room="C2", order_date=datetime.now() - timedelta(days=10, hours=4, minutes=45), price=29, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order11 = Customer_order(recipient_user_id=5, delivery_user_id=6, building="D", room="D225", order_date=datetime.now() - timedelta(days=11, hours=5, minutes=20), price=32, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order12 = Customer_order(recipient_user_id=6, delivery_user_id=7, building="E", room="E243", order_date=datetime.now() - timedelta(days=12, hours=6, minutes=10), price=35, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order13 = Customer_order(recipient_user_id=7, delivery_user_id=8, building="A", room="Valhall", order_date=datetime.now() - timedelta(days=13, hours=7, minutes=50), price=40, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order14 = Customer_order(recipient_user_id=8, delivery_user_id=9, building="B", room="Vippan", order_date=datetime.now() - timedelta(days=14, hours=8, minutes=30), price=45, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order15 = Customer_order(recipient_user_id=9, delivery_user_id=10, building="KEY", room="KY31", order_date=datetime.now() - timedelta(days=15, hours=9, minutes=15), price=50, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order16 = Customer_order(recipient_user_id=10, delivery_user_id=11, building="I", room="I102", order_date=datetime.now() - timedelta(days=16, hours=10, minutes=40), price=55, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order17 = Customer_order(recipient_user_id=11, delivery_user_id=12, building="B", room="SU00", order_date=datetime.now() - timedelta(days=17, hours=11, minutes=25), price=60, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order18 = Customer_order(recipient_user_id=12, delivery_user_id=13, building="B", room="SU00", order_date=datetime.now() - timedelta(days=18, hours=12, minutes=10), price=65, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order19 = Customer_order(recipient_user_id=13, delivery_user_id=14, building="B", room="Vippan", order_date=datetime.now() - timedelta(days=19, hours=1, minutes=30), price=70, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order20 = Customer_order(recipient_user_id=14, delivery_user_id=1, building="I", room="I101", order_date=datetime.now() - timedelta(days=20, hours=2, minutes=15), price=75, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order21 = Customer_order(recipient_user_id=4, delivery_user_id=5, building="A", room="AG31", order_date=datetime.now() - timedelta(days=21, hours=3, minutes=10), price=30, order_status="delivered", time_limit="08:15")
        order22 = Customer_order(recipient_user_id=4, delivery_user_id=6, building="B", room="SUO1", order_date=datetime.now() - timedelta(days=22, hours=4, minutes=20), price=28, order_status="delivered", time_limit="09:30")
        order23 = Customer_order(recipient_user_id=4, delivery_user_id=7, building="C", room="P1", order_date=datetime.now() - timedelta(days=23, hours=5, minutes=30), price=29, order_status="delivered", time_limit="10:45")
        order24 = Customer_order(recipient_user_id=4, delivery_user_id=8, building="SH", room="", order_date=datetime.now() - timedelta(days=24, hours=6, minutes=40), price=32, order_status="delivered", time_limit="11:15")
        order25 = Customer_order(recipient_user_id=4, delivery_user_id=9, building="A", room="AG32", order_date=datetime.now() - timedelta(days=25, hours=7, minutes=50), price=35, order_status="delivered", time_limit="12:30")
        order26 = Customer_order(recipient_user_id=4, delivery_user_id=10, building="B", room="SU04", order_date=datetime.now() - timedelta(days=26, hours=8, minutes=15), price=40, order_status="delivered", time_limit="13:45")
        order27 = Customer_order(recipient_user_id=4, delivery_user_id=11, building="C", room="T1", order_date=datetime.now() - timedelta(days=27, hours=9, minutes=25), price=45, order_status="delivered", time_limit="14:15")
        order28 = Customer_order(recipient_user_id=4, delivery_user_id=12, building="SH", room="", order_date=datetime.now() - timedelta(days=28, hours=10, minutes=35), price=50, order_status="accepted", time_limit="15:30")
        order29 = Customer_order(recipient_user_id=4, delivery_user_id=13, building="A", room="A1", order_date=datetime.now() - timedelta(days=29, hours=11, minutes=45), price=55, order_status="accepted", time_limit="16:45")
        order30 = Customer_order(recipient_user_id=4, delivery_user_id=14, building="B", room="Vipan", order_date=datetime.now() - timedelta(days=30, hours=12, minutes=55), price=60, order_status="accepted", time_limit="17:00")
        order31 = Customer_order(recipient_user_id=4, delivery_user_id=1, building="C", room="T2", order_date=datetime.now() - timedelta(days=31, hours=1, minutes=5), price=65, order_status="delivered", time_limit="08:15")
        order32 = Customer_order(recipient_user_id=4, delivery_user_id=2, building="SH", room="", order_date=datetime.now() - timedelta(days=32, hours=2, minutes=15), price=70, order_status="accepted", time_limit="09:30")
        order33 = Customer_order(recipient_user_id=4, delivery_user_id=3, building="A", room="A2", order_date=datetime.now() - timedelta(days=33, hours=3, minutes=25), price=75, order_status="delivered", time_limit="10:45")
        order34 = Customer_order(recipient_user_id=4, delivery_user_id=4, building="B", room="Vippan", order_date=datetime.now() - timedelta(days=34, hours=4, minutes=35), price=80, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        order35 = Customer_order(recipient_user_id=4, delivery_user_id=5, building="C", room="R11", order_date=datetime.now() - timedelta(days=35, hours=5, minutes=45), price=85, order_status="delivered", time_limit="12:30")
        order36 = Customer_order(recipient_user_id=4, delivery_user_id=6, building="SH", room="", order_date=datetime.now() - timedelta(days=36, hours=6, minutes=55), price=90, order_status="accepted", time_limit="13:45")
        order37 = Customer_order(recipient_user_id=4, delivery_user_id=7, building="A", room="AG31", order_date=datetime.now() - timedelta(days=37, hours=7, minutes=5), price=95, order_status="delivered", time_limit="14:15")
        order38 = Customer_order(recipient_user_id=4, delivery_user_id=8, building="B", room="SU00", order_date=datetime.now() - timedelta(days=38, hours=8, minutes=15), price=100, order_status="accepted", time_limit="15:30")
        order39 = Customer_order(recipient_user_id=4, delivery_user_id=9, building="C", room="P44", order_date=datetime.now() - timedelta(days=39, hours=9, minutes=25), price=105, order_status="delivered", time_limit="16:45")
        order40 = Customer_order(recipient_user_id=4, delivery_user_id=10, building="SH", room="", order_date=datetime.now() - timedelta(days=40, hours=10, minutes=35), price=110, order_status="pending", time_limit=(datetime.now() + timedelta(hours=uniform(0.1, 4))).strftime("%H:%M"))
        
        # Add products to orders as OrderProduct objects
        order1.products = [
            OrderProduct(product=product1, quantity=4),
            OrderProduct(product=product2, quantity=2)
        ]
        order2.products = [
            OrderProduct(product=product3, quantity=1),
            OrderProduct(product=product4, quantity=3),
        ]
        order3.products = [
            OrderProduct(product=product5, quantity=2),
            OrderProduct(product=product6, quantity=1),
        ]
        order4.products = [
            OrderProduct(product=product7, quantity=3),
            OrderProduct(product=product8, quantity=2),
        ]
        order5.products = [
            OrderProduct(product=product9, quantity=1),
            OrderProduct(product=product10, quantity=4),
        ]
        order6.products = [
            OrderProduct(product=product11, quantity=2),
            OrderProduct(product=product12, quantity=1),
        ]
        order7.products = [
            OrderProduct(product=product13, quantity=1),
            OrderProduct(product=product14, quantity=3),
        ]
        order8.products = [
            OrderProduct(product=product15, quantity=2),
            OrderProduct(product=product1, quantity=1),
        ]
        order9.products = [
            OrderProduct(product=product11, quantity=2),
            OrderProduct(product=product12, quantity=3),
        ]
        order10.products = [
            OrderProduct(product=product13, quantity=1),
        ]
        order11.products = [
            OrderProduct(product=product14, quantity=2),
            OrderProduct(product=product15, quantity=1),
            OrderProduct(product=product16, quantity=3),
        ]
        order12.products = [
            OrderProduct(product=product17, quantity=1),
            OrderProduct(product=product18, quantity=2),
        ]
        order13.products = [
            OrderProduct(product=product19, quantity=3),
            OrderProduct(product=product20, quantity=1),
            OrderProduct(product=product21, quantity=2),
        ]
        order14.products = [
            OrderProduct(product=product22, quantity=1),
        ]
        order15.products = [
            OrderProduct(product=product23, quantity=2),
            OrderProduct(product=product24, quantity=3),
        ]
        order16.products = [
            OrderProduct(product=product25, quantity=1),
            OrderProduct(product=product26, quantity=2),
            OrderProduct(product=product27, quantity=1),
        ]
        order17.products = [
            OrderProduct(product=product28, quantity=3),
        ]
        order18.products = [
            OrderProduct(product=product29, quantity=2),
            OrderProduct(product=product30, quantity=1),
        ]
        order19.products = [
            OrderProduct(product=product31, quantity=1),
            OrderProduct(product=product32, quantity=2),
        ]
        order20.products = [
            OrderProduct(product=product1, quantity=3),
        ]
        order21.products = [
            OrderProduct(product=product2, quantity=1),
            OrderProduct(product=product3, quantity=2),
        ]
        order22.products = [
            OrderProduct(product=product4, quantity=3),
            OrderProduct(product=product5, quantity=1),
        ]
        order23.products = [
            OrderProduct(product=product6, quantity=2),
            OrderProduct(product=product7, quantity=1),
            OrderProduct(product=product8, quantity=3),
        ]
        order24.products = [
            OrderProduct(product=product9, quantity=1),
        ]
        order25.products = [
            OrderProduct(product=product10, quantity=2),
            OrderProduct(product=product11, quantity=1),
        ]
        order26.products = [
            OrderProduct(product=product12, quantity=3),
            OrderProduct(product=product13, quantity=2),
        ]
        order27.products = [
            OrderProduct(product=product14, quantity=1),
            OrderProduct(product=product15, quantity=2),
            OrderProduct(product=product16, quantity=1),
        ]
        order28.products = [
            OrderProduct(product=product17, quantity=3),
            OrderProduct(product=product18, quantity=1),
            OrderProduct(product=product19, quantity=2),
            OrderProduct(product=product20, quantity=1),
        ]
        order29.products = [OrderProduct(product=product1, quantity=1)]
        order30.products = [OrderProduct(product=product2, quantity=1)]
        order31.products = [OrderProduct(product=product3, quantity=1)]
        order32.products = [OrderProduct(product=product4, quantity=1)]
        order33.products = [OrderProduct(product=product5, quantity=1)]
        order34.products = [
            OrderProduct(product=product6, quantity=2),
            OrderProduct(product=product7, quantity=1),
        ]
        order35.products = [
            OrderProduct(product=product8, quantity=1),
            OrderProduct(product=product9, quantity=2),
        ]
        order36.products = [
            OrderProduct(product=product10, quantity=3),
            OrderProduct(product=product11, quantity=1),
        ]
        order37.products = [
            OrderProduct(product=product12, quantity=2),
            OrderProduct(product=product13, quantity=1),
        ]
        order38.products = [
            OrderProduct(product=product14, quantity=1),
            OrderProduct(product=product15, quantity=2),
        ]
        order39.products = [
            OrderProduct(product=product16, quantity=3),
            OrderProduct(product=product17, quantity=1),
        ]
        order40.products = [
            OrderProduct(product=product18, quantity=2),
            OrderProduct(product=product19, quantity=1),
        ]

        # Add to database
        db.session.add_all([
            user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, user11, user12, user13, user14,
                            
            product1,  product2,  product3,  product4,  product5,  product6,  product7,  product8,  product9,  product10, 
            product11, product12, product13, product14, product15, product16, product17, product18, product19, product20,
            product21, product22, product23, product24, product25, product26, product27, product28, product29, product30,
            product31, product32,

            order1,  order2,  order3,  order4,  order5,  order6,  order7,  order8,  order9,  order10,
            order11, order12, order13, order14, order15, order16, order17, order18, order19, order20,
            order21, order22, order23, order24, order25, order26, order27, order28, order29, order30,
            order31, order32, order33, order34, order35, order36, order37, order38, order39, order40
        ])
        
        db.session.commit()

        print("Sample data inserted successfully!")

if __name__ == "__main__":
    confirm = input("Are you sure you want to reset the database? This will delete ALL data! (yes/no): ")
    if confirm.lower() == "yes":
        reset_database()
    else:
        print("Operation cancelled.")
