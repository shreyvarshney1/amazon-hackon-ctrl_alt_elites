from flask_smorest import Blueprint
from flask import request, jsonify
import jwt

from api.models import db, Seller, Product
from .auth import JWT_SECRET

BASE_ROUTE = "/api/seller"
seller_bp = Blueprint("seller", __name__, url_prefix=BASE_ROUTE)


@seller_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        if not email:
            return jsonify({"message": "Email is required"}), 400

        seller = db.session.query(Seller).filter_by(email=email).first()
        if not seller:
            seller = Seller(name=username, email=email, created_at=db.func.now())
            db.session.add(seller)
            db.session.commit()

        token = jwt.encode(
            {"username": seller.name, "seller_id": seller.id},
            JWT_SECRET,
            algorithm="HS256",
        )
        return (
            jsonify({"message": "Seller logged in successfully", "token": token}),
            200,
        )
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


def check_auth_seller(f):
    def decorated(*args, **kwargs):
        auth_token = request.cookies.get("auth_token")
        if not auth_token:
            if request.headers.get("Authorization"):
                auth_token = request.headers["Authorization"].split(" ")[1]
            else:
                return jsonify({"error": "Authorization token is missing"}), 401
        try:
            decoded = jwt.decode(auth_token, JWT_SECRET, algorithms=["HS256"])
            seller = db.session.query(Seller).filter_by(id=decoded["seller_id"]).first()
            if not seller:
                return jsonify({"error": "Seller not found"}), 404
            return f(seller, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401

    return decorated


@seller_bp.route("/session", methods=["GET"])
@check_auth_seller
def get_session(seller):
    return (
        jsonify(
            {
                "seller_id": seller.id,
                "name": seller.name,
                "email": seller.email,
                "created_at": seller.created_at.isoformat(),
                "scs_score": round(seller.scs_score, 4) if seller.scs_score else None,
                "last_scs_update": (
                    seller.last_scs_update.isoformat()
                    if seller.last_scs_update
                    else None
                ),
            }
        ),
        200,
    )


@seller_bp.route("/products", methods=["GET"])
@check_auth_seller
def get_products(seller):
    products = db.session.query(Product).filter_by(seller_id=seller.id).all()
    product_list = [
        {
            "id": product.id,
            "slug": product.slug,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "image_urls": product.image_urls,
            "listed_at": product.listed_at.isoformat(),
            "pis_score": product.pis_score,
            "rating": (
                sum(review.rating for review in product.reviews) / len(product.reviews)
                if product.reviews
                else 0
            ),
            "review_count": len(product.reviews),
            "last_pis_update": (
                product.last_pis_update.isoformat() if product.last_pis_update else None
            ),
        }
        for product in products
    ]
    return jsonify({"products": product_list}), 200
