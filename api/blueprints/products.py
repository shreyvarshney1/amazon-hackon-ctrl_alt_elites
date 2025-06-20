from flask_smorest import Blueprint
from flask import request, url_for
import requests
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import joinedload
from flask_cors import CORS
from api.models import db, Product, Review, Order, OrderItem
from .auth import check_auth
from .seller import check_auth_seller

BASE_ROUTE = "/api/products"
product_bp = Blueprint("products", __name__, url_prefix=BASE_ROUTE)

# Enable CORS for all routes in this blueprint
CORS(product_bp, resources={r"/*": {"origins": "*"}})


@product_bp.route("/all", methods=["GET"])
def get_products():
    try:
        products = db.session.query(Product).all()
        return {
            "products": [
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
                        sum(review.rating for review in product.reviews)
                        / len(product.reviews)
                        if product.reviews
                        else 0
                    ),
                    "review_count": len(product.reviews),
                    "last_pis_update": (
                        product.last_pis_update.isoformat()
                        if product.last_pis_update
                        else None
                    ),
                    "seller": {
                        "id": product.seller.id,
                        "name": product.seller.name,
                        "scs_score": product.seller.scs_score,
                        "last_scs_update": (
                            product.seller.last_scs_update.isoformat()
                            if product.seller.last_scs_update
                            else None
                        ),
                    },
                }
                for product in products
            ]
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        # product = db.session.query(Product).get(product_id)

        product = (
            db.session.query(Product)
            .options(joinedload(Product.reviews).joinedload(Review.user))
            .get(product_id)
        )

        if not product:
            return {"error": "Product not found"}, 404

        return {
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
            "reviews": [
                {
                    **{
                        c.key: getattr(review, c.key)
                        for c in inspect(review).mapper.column_attrs
                    },
                    "username": review.user.username,
                    "has_trusted_badge": (review.user.uba_score or 0) > 0.7,
                }
                for review in product.reviews
            ],
            "seller": {
                "id": product.seller.id,
                "name": product.seller.name,
                "scs_score": product.seller.scs_score,
                "last_scs_update": product.seller.last_scs_update,
            },
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/<int:product_id>/reviews", methods=["GET"])
def get_product_reviews(product_id):
    try:
        product = (
            db.session.query(Product)
            .options(joinedload(Product.reviews).joinedload(Review.user))
            .get(product_id)
        )

        if not product:
            return {"error": "Product not found"}, 404

        reviews = [
            {
                **{
                    c.key: getattr(review, c.key)
                    for c in inspect(review).mapper.column_attrs
                },
                "username": review.user.username,
                "has_trusted_badge": (review.user.uba_score or 0)
                > 0.7,  # Add this line
            }
            for review in product.reviews
        ]

        return {"reviews": reviews}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/<int:product_id>/add-review", methods=["POST"])
@check_auth
def add_review(user, product_id):
    try:
        data = request.json
        rating = data.get("rating")
        review_text = data.get("review_text", "")
        title = data.get("title", "")

        if not rating or not 1 <= rating <= 5:
            return {"error": "Rating must be between 1 and 5"}, 400

        product = db.session.query(Product).get(product_id)
        if not product:
            return {"error": "Product not found"}, 404

        orders = (
            db.session.query(Order)
            .join(OrderItem)
            .filter(
                Order.user_id == user.id,
                OrderItem.product_id == product_id,
                Order.status.in_(["delivered", "returned"]),
            )
            .all()
        )
        is_verified_purchase = len(orders) > 0

        review = Review(
            user_id=user.id,
            product_id=product.id,
            rating=rating,
            review_text=review_text,
            is_verified_purchase=is_verified_purchase,
            title=title,
        )
        db.session.add(review)
        db.session.commit()

        requests.post(
            url_for(
                "services.trigger_uba_calculation",
                _external=True,
            ),
            json={"user_id": user.id},
            timeout=5,
        )

        requests.post(
            url_for(
                "services.trigger_pis_calculation",
                _external=True,
            ),
            json={"product_id": product_id},
            timeout=5,
        )

        requests.post(
            url_for(
                "services.trigger_scs_calculation",
                _external=True,
            ),
            json={"seller_id": product.seller_id},
            timeout=5,
        )

        # return {"message": "Review added successfully", "review" : review}, 201

        # Refresh the object to ensure all auto-generated fields are loaded
        db.session.refresh(review)
        # Manually construct the response to ensure created_at is properly serialized
        review_response = {
            "id": review.id,
            "user_id": review.user_id,
            "product_id": review.product_id,
            "rating": review.rating,
            "review_text": review.review_text,
            "title": review.title,
            "created_at": review.created_at.isoformat(),  # Explicitly convert to ISO format
            "is_verified_purchase": review.is_verified_purchase,
            "linguistic_authenticity_score": review.linguistic_authenticity_score,
            "username": user.username,
            "has_trusted_badge": (user.uba_score or 0) > 0.7,
        }

        return {"message": "Review added successfully", "review": review_response}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/add-product", methods=["POST"])
@check_auth_seller
def add_product(seller):
    try:
        data = request.json
        name = data.get("name")
        slug = data.get("slug")
        description = data.get("description")
        price = data.get("price")
        category = data.get("category")
        image_urls = data.get("image_urls", [])

        if not name or not description or not price:
            return {"error": "Name, description, and price are required"}, 400

        product = Product(
            seller_id=seller.id,
            slug=slug,
            name=name,
            description=description,
            price=price,
            category=category,
            image_urls=image_urls,
        )
        db.session.add(product)
        db.session.commit()

        requests.post(
            url_for(
                "services.trigger_pis_calculation",
                _external=True,
            ),
            json={"product_id": product.id},
            timeout=5,
        )

        return {"message": "Product added successfully", "product_id": product.id}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/<int:product_id>/update", methods=["PUT"])
@check_auth_seller
def update_product(seller, product_id):
    try:
        data = request.json
        product = db.session.query(Product).get(product_id)
        if not product or product.seller_id != seller.id:
            return {"error": "Product not found or unauthorized"}, 404

        if "name" in data:
            product.name = data["name"]
        if "slug" in data:
            product.slug = data["slug"]
        if "description" in data:
            product.description = data["description"]
        if "price" in data:
            product.price = data["price"]
        if "category" in data:
            product.category = data["category"]
        if "image_urls" in data:
            product.image_urls = data["image_urls"]

        db.session.commit()

        requests.post(
            url_for(
                "services.trigger_pis_calculation",
                _external=True,
            ),
            json={"product_id": product.id},
            timeout=5,
        )

        return {"message": "Product updated successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@product_bp.route("/<int:product_id>/delete", methods=["DELETE"])
@check_auth_seller
def delete_product(seller, product_id):
    try:
        product = db.session.query(Product).get(product_id)
        if not product or product.seller_id != seller.id:
            return {"error": "Product not found or unauthorized"}, 404

        db.session.delete(product)
        db.session.commit()

        return {"message": "Product deleted successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500
