from flask_smorest import Blueprint
from flask import request, url_for
import requests

from api.models import db, Order, OrderItem, Product, Return
from .auth import check_auth
from .seller import check_auth_seller

BASE_ROUTE = "/api/orders"
orders_bp = Blueprint("orders", __name__, url_prefix=BASE_ROUTE)


@orders_bp.route("/my-orders", methods=["GET"])
@check_auth
def get_my_orders(user):
    try:
        orders = db.session.query(Order).filter(Order.user_id == user.id).all()
        return {
            "orders": [
                {
                    "id": order.id,
                    "username": order.user.username,
                    "created_at": (
                        order.created_at.isoformat() if order.created_at else None
                    ),
                    "total_amount": order.total_amount,  # @Sat
                    "items": [
                        {
                            "id": item.id,
                            "product_id": item.product.id,
                            "product_name": item.product.name,
                            "product_description": item.product.description,
                            "product_category": item.product.category,
                            "product_seller": item.product.seller.name,
                            "quantity": item.quantity,
                            "price_at_purchase": item.price_at_purchase,
                            "status": item.status,
                            "cancelled_by_seller": item.cancelled_by_seller,
                            "delivered_on_time": item.delivered_on_time,
                        }
                        for item in order.items
                    ],
                }
                for order in orders
            ]
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/<int:order_id>", methods=["GET"])
@check_auth
def get_order(user, order_id):
    try:
        order = (
            db.session.query(Order)
            .filter(Order.id == order_id, Order.user_id == user.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        return {
            "id": order.id,
            "username": order.user.username,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "product_description": item.product.description,
                    "product_category": item.product.category,
                    "product_seller": item.product.seller.name,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "status": item.status,
                    "cancelled_by_seller": item.cancelled_by_seller,
                    "delivered_on_time": item.delivered_on_time,
                }
                for item in order.items
            ],
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/add-order", methods=["POST"])
@check_auth
def add_order(user):
    try:
        data = request.get_json()
        if not data or "items" not in data:
            return {"error": "Invalid request data"}, 400

        # Validate all products before creating the order
        for item_data in data["items"]:
            product = db.session.query(Product).get(item_data.get("product_id"))
            if not product:
                db.session.rollback()
                return {
                    "error": f"Product with ID {item_data.get('product_id')} not found"
                }, 404

        # Create the order and add it to the session
        order = Order(user_id=user.id, total_amount=0)
        db.session.add(order)

        total_amount = 0
        # Add order items to the session
        for item_data in data["items"]:
            product = db.session.query(Product).get(item_data.get("product_id"))
            order_item = OrderItem(
                order=order,
                product=product,
                quantity=item_data.get("quantity", 1),
                price_at_purchase=product.price,
            )
            db.session.add(order_item)
            total_amount += product.price * order_item.quantity
        order.total_amount = total_amount

        db.session.commit()
        return {"message": "Order created successfully", "order_id": order.id}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/cancel-order", methods=["POST"])
@check_auth
def cancel_order(user):
    try:
        data = request.get_json()
        if not data or "order_id" not in data or "product_id" not in data:
            return {"error": "Invalid request data"}, 400

        order = (
            db.session.query(Order)
            .filter(Order.id == data["order_id"], Order.user_id == user.id)
            .first()
        )
        if not order:
            return {"error": "Order not found"}, 404

        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id == data["product_id"],
            )
            .filter(OrderItem.status != "delivered")
            .first()
        )
        if not order_item:
            return {"error": "No matching order items found"}, 404

        order_item.status = "cancelled"
        order_item.cancelled_by_seller = False

        db.session.commit()
        return {"message": "Order cancelled successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/return-product", methods=["POST"])
@check_auth
def return_product(user):
    try:
        data = request.get_json()
        if (
            not data
            or "reason" not in data
            or "product_id" not in data
            or "order_id" not in data
        ):  # @Sat
            # if not data or "reason" not in data or "product_id" not in data:
            return {"error": "Invalid request data"}, 400

        product = db.session.query(Product).get(data["product_id"])
        if not product:
            return {"error": "Product not found"}, 404
        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.product_id == product.id,
                OrderItem.order_id == data["order_id"],
            )  # @Sat
            # .filter(OrderItem.product_id == product.id, OrderItem.order_id == user.id)
            .filter(OrderItem.status == "delivered")
            .first()
        )

        if not order_item:
            return {"error": "No matching order item found"}, 404

        order_item.status = "returned"  # @Sat

        return_record = Return(
            order_item_id=order_item.id,
            user_id=user.id,
            reason_text=data["reason"],
            reason_category=data.get("reason_category", "other"),
        )
        db.session.add(return_record)

        db.session.commit()

        requests.post(
            url_for("services.trigger_uba_calculation", _external=True),
            json={"user_id": user.id},
            timeout=5,
        )
        requests.post(
            url_for("services.trigger_pis_calculation", _external=True),
            json={"product_id": product.id},
            timeout=5,
        )
        requests.post(
            url_for("services.trigger_scs_calculation", _external=True),
            json={"seller_id": product.seller_id},
            timeout=5,
        )

        return {"message": "Product return initiated successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders", methods=["GET"])
@check_auth_seller
def get_seller_orders(seller):
    try:
        orders = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Product.seller_id == seller.id)
            .distinct(Order.id)
            .all()
        )

        return {
            "orders": [
                {
                    "id": order.id,
                    "username": order.user.username,
                    "created_at": (
                        order.created_at.isoformat() if order.created_at else None
                    ),
                    "items": [
                        {
                            "id": item.id,
                            "product_id": item.product.id,
                            "product_name": item.product.name,
                            "product_description": item.product.description,
                            "product_category": item.product.category,
                            "quantity": item.quantity,
                            "price_at_purchase": item.price_at_purchase,
                            "status": item.status,
                            "cancelled_by_seller": item.cancelled_by_seller,
                            "delivered_on_time": item.delivered_on_time,
                        }
                        for item in order.items
                        if item.product.seller_id == seller.id  # @Sat
                    ],
                }
                for order in orders
                if any(item.product.seller_id == seller.id for item in order.items)
            ]
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/<int:order_id>", methods=["GET"])
@check_auth_seller
def get_seller_order(seller, order_id):
    try:
        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == order_id, Product.seller_id == seller.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        return {
            "id": order.id,
            "username": order.user.username,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product.id,
                    "product_name": item.product.name,
                    "product_description": item.product.description,
                    "product_category": item.product.category,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                    "status": item.status,
                    "cancelled_by_seller": item.cancelled_by_seller,
                    "delivered_on_time": item.delivered_on_time,
                }
                for item in order.items
            ],
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/deliver-product", methods=["POST"])
@check_auth_seller
def deliver_order(seller):
    try:
        data = request.get_json()
        if (
            not data
            or "delivered_on_time" not in data
            or "order_id" not in data
            or "product_id" not in data
        ):
            return {"error": "Invalid request data"}, 400
        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == data["order_id"], Product.seller_id == seller.id)
            .first()
        )
        if not order:
            return {"error": "Order not found"}, 404
        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id == data["product_id"],
            )
            .first()
        )
        if not order_item:
            return {"error": "Order item not found"}, 404
        order_item.delivered_on_time = data["delivered_on_time"]
        order_item.status = "delivered"
        db.session.commit()
        requests.post(
            url_for("services.trigger_pis_calculation", _external=True),
            json={"product_id": order_item.product.id},
            timeout=5,
        )
        requests.post(
            url_for("services.trigger_scs_calculation", _external=True),
            json={"seller_id": seller.id},
            timeout=5,
        )
        return {"message": "Order delivered successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/cancel-product", methods=["POST"])
@check_auth_seller
def cancel_seller_order(seller):
    try:
        data = request.get_json()
        if not data or "order_id" not in data or "product_id" not in data:
            return {"error": "Invalid request data"}, 400
        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == data["order_id"], Product.seller_id == seller.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id == data["product_id"],
            )
            .first()
        )
        if not order_item:
            return {"error": "Order item not found"}, 404
        order_item.cancelled_by_seller = True
        order_item.status = "cancelled"
        db.session.commit()
        requests.post(
            url_for("services.trigger_scs_calculation", _external=True),
            json={"seller_id": seller.id},
            timeout=5,
        )
        return {"message": "Order cancelled successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/refund-requested", methods=["GET"])
@check_auth_seller
def get_refund_requested_orders(seller):
    try:
        orders = (
            db.session.query(Order)
            .join(OrderItem)
            .filter(OrderItem.status == "returned", Product.seller_id == seller.id)
            .all()
        )
        return {
            "orders": [
                {
                    "id": order.id,
                    "user_id": order.user_id,
                    "created_at": order.created_at,
                    "total_amount": order.total_amount,
                    "items": [
                        {
                            "product_id": item.product_id,
                            "quantity": item.quantity,
                            "price_at_purchase": item.price_at_purchase,
                            "status": item.status,
                        }
                        for item in order.items
                    ],
                }
                for order in orders
            ]
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/refund-process", methods=["POST"])
@check_auth_seller
def process_refund_request(seller):
    try:
        data = request.get_json()
        if not data or "order_id" not in data or "product_id" not in data:
            return {"error": "Invalid request data"}, 400

        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == data["order_id"], Product.seller_id == seller.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id == data["product_id"],
            )
            .first()
        )
        if not order_item:
            return {"error": "Order item not found"}, 404

        order_item.status = "refunded"
        db.session.commit()

        requests.post(
            url_for("services.trigger_scs_calculation", _external=True),
            json={"seller_id": seller.id},
            timeout=5,
        )
        return {"message": "Refund processed successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/refund-reject", methods=["POST"])
@check_auth_seller
def reject_refund_request(seller):
    try:
        data = request.get_json()
        if not data or "order_id" not in data or "product_id" not in data:
            return {"error": "Invalid request data"}, 400

        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == data["order_id"], Product.seller_id == seller.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        order_item = (
            db.session.query(OrderItem)
            .filter(
                OrderItem.order_id == order.id,
                OrderItem.product_id == data["product_id"],
            )
            .first()
        )
        if not order_item:
            return {"error": "Order item not found"}, 404

        order_item.status = "refund_rejected"
        db.session.commit()

        requests.post(
            url_for("services.trigger_scs_calculation", _external=True),
            json={"seller_id": seller.id},
            timeout=5,
        )
        return {"message": "Refund request rejected successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500
