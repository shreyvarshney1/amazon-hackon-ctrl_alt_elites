"""
Flask Blueprints for the UBA, PIS, and SCS API endpoints.
These routes act as the triggers for score recalculations.
"""

from flask import jsonify, request
from flask_smorest import Blueprint
from api.models import db, User, Product, Seller
from api.ml_services import uba_service, pis_service, scs_service

BASE_ROUTE = "/api/services"

services_bp = Blueprint("services", __name__, url_prefix=BASE_ROUTE)


@services_bp.route("/uba", methods=["POST"])
def trigger_uba_calculation():
    """
    Calculates and returns the User Behavior & Anomaly score for a given user.
    This is triggered when a user performs an action like posting a review.
    """
    data = request.json
    if not data or "user_id" not in data:
        return jsonify({"error": "User ID is required"}), 400
    user_id = data["user_id"]
    if not User.query.get(user_id):
        return jsonify({"error": "User not found"}), 404

    uba_service.calculate_uba_score(user_id)
    db.session.commit()  # Commit the changes to the database

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


@services_bp.route("/pis", methods=["POST"])
def trigger_pis_calculation():
    """
    Calculates the Product Integrity Score and triggers a cascading update
    to the seller's SCS. This is triggered by events like a new review,
    a return, or a manual flag.
    """
    data = request.json
    if not data or "product_id" not in data:
        return jsonify({"error": "Product ID is required"}), 400
    product_id = data["product_id"]
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # This single function handles PIS calculation and the SCS cascade.
    pis_service.recalculate_pis_and_cascade_scs(product_id)
    db.session.commit()  # Commit all cascaded changes in one transaction

    # Refresh objects to get the latest scores
    product = Product.query.get(product_id)
    seller = Seller.query.get(product.seller_id)

    return (
        jsonify(
            {
                "message": "PIS calculation and SCS cascade complete.",
                "product_id": product.id,
                "new_pis_score": round(product.pis_score, 4),
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


@services_bp.route("/scs", methods=["POST"])
def trigger_scs_calculation():
    """
    Calculates and returns the Seller Credibility Score.
    This can be triggered by seller-specific events like a dispute or
    a change in fulfillment metrics, independent of a PIS update.
    """
    data = request.json
    if not data or "seller_id" not in data:
        return jsonify({"error": "Seller ID is required"}), 400
    seller_id = data["seller_id"]
    if not Seller.query.get(seller_id):
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
