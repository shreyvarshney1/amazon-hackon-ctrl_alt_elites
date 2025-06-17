"""
Flask Blueprints for the UBA, PIS, and SCS API endpoints.
"""

from flask import Blueprint, jsonify
from api.models import db, User, Product, Seller
from api.services import uba_service, pis_service, scs_service

# --- UBA Blueprint ---
uba_bp = Blueprint("uba_api", __name__, url_prefix="/api")


@uba_bp.route("/uba/<int:user_id>", methods=["POST"])
def get_uba_score(user_id):
    """
    Calculates and returns the User Behavior & Anomaly score for a given user.
    This is triggered when a user performs an action like posting a review.
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    uba_service.calculate_uba_score(user_id)
    # Refresh user object to get the updated score
    user = User.query.get(user_id)
    return (
        jsonify(
            {
                "user_id": user.id,
                "uba_score": round(user.uba_score, 4),
                "last_updated": user.last_uba_update.isoformat(),
            }
        ),
        200,
    )


# --- PIS Blueprint ---
pis_bp = Blueprint("pis_api", __name__, url_prefix="/api")


@pis_bp.route("/pis/<int:product_id>", methods=["POST"])
def get_pis_score(product_id):
    """
    Calculates the Product Integrity Score and triggers a cascading update
    to the seller's SCS. This is triggered by events like a new review,
    a return, or a manual flag.
    """
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # This function handles PIS calculation, SCS cascade, and db.commit()
    pis_service.recalculate_pis_and_cascade_scs(product_id)

    # Refresh objects to get the latest scores
    product = Product.query.get(product_id)
    seller = Seller.query.get(product.seller_id)

    return (
        jsonify(
            {
                "product_id": product.id,
                "pis_score": round(product.pis_score, 4),
                "last_pis_update": product.last_pis_update.isoformat(),
                "cascaded_to_seller": {
                    "seller_id": seller.id,
                    "new_scs_score": round(seller.scs_score, 4),
                    "last_scs_update": seller.last_scs_update.isoformat(),
                },
            }
        ),
        200,
    )


# --- SCS Blueprint ---
scs_bp = Blueprint("scs_api", __name__, url_prefix="/api")


@scs_bp.route("/scs/<int:seller_id>", methods=["POST"])
def get_scs_score(seller_id):
    """
    Calculates and returns the Seller Credibility Score.
    This can be triggered by seller-specific events like a dispute or
    a change in fulfillment metrics.
    """
    seller = Seller.query.get(seller_id)
    if not seller:
        return jsonify({"error": "Seller not found"}), 404

    scs_service.calculate_scs_score(seller_id)
    db.session.commit()  # Commit the change

    # Refresh seller object to get the updated score
    seller = Seller.query.get(seller_id)
    return (
        jsonify(
            {
                "seller_id": seller.id,
                "scs_score": round(seller.scs_score, 4),
                "last_updated": seller.last_scs_update.isoformat(),
            }
        ),
        200,
    )
