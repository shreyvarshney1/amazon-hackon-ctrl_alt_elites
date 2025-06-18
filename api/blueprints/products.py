from flask_smorest import Blueprint
from flask import request
from sqlalchemy.inspection import inspect
from api.models import db, Product, Review
from .auth import check_auth
from .seller import check_auth_seller

BASE_ROUTE = "/api/products"
product_bp = Blueprint("products", __name__, url_prefix=BASE_ROUTE)


@product_bp.route("/", methods=["GET"])
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
                    "last_pis_update": product.last_pis_update.isoformat(),
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
        product = db.session.query(Product).get(product_id)
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
            "last_pis_update": (
                product.last_pis_update.isoformat() if product.last_pis_update else None
            ),
            "reviews": list(
                map(
                    lambda obj: {
                        c.key: getattr(obj, c.key)
                        for c in inspect(obj).mapper.column_attrs
                    },
                    product.reviews,
                )
            ),
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
        product = db.session.query(Product).get(product_id)
        if not product:
            return {"error": "Product not found"}, 404

        reviews = list(
            map(
                lambda obj: {
                    c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs
                },
                product.reviews,
            )
        )

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
        is_verified_purchase = data.get("is_verified_purchase", False)

        if not rating or not 1 <= rating <= 5:
            return {"error": "Rating must be between 1 and 5"}, 400

        product = db.session.query(Product).get(product_id)
        if not product:
            return {"error": "Product not found"}, 404

        review = Review(
            user_id=user.id,
            product_id=product.id,
            rating=rating,
            review_text=review_text,
            is_verified_purchase=is_verified_purchase,
        )
        db.session.add(review)
        db.session.commit()

        return {"message": "Review added successfully"}, 201
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
