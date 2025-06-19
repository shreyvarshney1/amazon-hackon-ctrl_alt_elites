from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

# --- Core Entities ---


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))

    # UBA Score - The core output of Microservice 1
    uba_score = db.Column(db.Float, nullable=True, default=1.0)
    # Example: 1.0 if phone/address verified
    profile_completeness_score = db.Column(db.Float, default=0.5)
    last_uba_update = db.Column(db.DateTime(timezone=True))

    reviews = db.relationship("Review", back_populates="user", lazy=True)
    orders = db.relationship("Order", back_populates="user", lazy=True)
    sessions = db.relationship("UserSessionLog", back_populates="user", lazy=True)


class Seller(db.Model):
    __tablename__ = "sellers"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))

    scs_score = db.Column(db.Float, nullable=True, default=1.0)
    last_scs_update = db.Column(db.DateTime(timezone=True))

    products = db.relationship("Product", back_populates="seller", lazy=True)


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("sellers.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100))
    image_urls = db.Column(ARRAY(db.String), nullable=True)
    listed_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))

    pis_score = db.Column(db.Float, nullable=True, default=1.0)
    last_pis_update = db.Column(db.DateTime(timezone=True))

    seller = db.relationship("Seller", back_populates="products")
    reviews = db.relationship("Review", back_populates="product", lazy=True)


# --- Event & Data Logging Entities ---


class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    review_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))
    is_verified_purchase = db.Column(db.Boolean, default=False)

    title = db.Column(db.Text)  # Added title for the review

    # From LLM analysis (Parameter P4 of UBA)
    linguistic_authenticity_score = db.Column(db.Float)

    user = db.relationship("User", back_populates="reviews")
    product = db.relationship("Product", back_populates="reviews")


class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))
    # e.g., pending, shipped, delivered, cancelled
    status = db.Column(db.String(50), default="pending")

    # For Seller's Order Fulfillment Rate (Parameter P1 of SCS)
    shipped_on_time = db.Column(db.Boolean, nullable=True)

    user = db.relationship("User", back_populates="orders")
    items = db.relationship("OrderItem", back_populates="order", lazy=True)


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)

    order = db.relationship("Order", back_populates="items")


class Return(db.Model):
    __tablename__ = "returns"
    id = db.Column(db.Integer, primary_key=True)
    order_item_id = db.Column(
        db.Integer, db.ForeignKey("order_items.id"), nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reason_text = db.Column(db.Text, nullable=False)

    # Structured reason from LLM analysis (Parameter P5 of PIS)
    # e.g., 'counterfeit', 'damaged', 'not_as_described'
    reason_category = db.Column(db.String(100))
    created_at = db.Column(db.DateTime(timezone=True), server_default=text("now()"))


class UserSessionLog(db.Model):
    __tablename__ = "user_session_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    ip_address = db.Column(db.String(45))
    device_info = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime(timezone=True), server_default=text("now()"))

    user = db.relationship("User", back_populates="sessions")
