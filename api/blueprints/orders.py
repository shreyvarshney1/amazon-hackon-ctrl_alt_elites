from flask_smorest import Blueprint
from flask import request

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
                    "status": order.status,
                    "shipped_on_time": order.shipped_on_time,
                    "items": [
                        {
                            "id": item.id,
                            "product_name": item.product.name,
                            "product_description": item.product.description,
                            "product_category": item.product.category,
                            "product_seller": item.product.seller.name,
                            "quantity": item.quantity,
                            "price_at_purchase": item.price_at_purchase,
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
            "status": order.status,
            "shipped_on_time": order.shipped_on_time,
            "items": [
                {
                    "id": item.id,
                    "product_name": item.product.name,
                    "product_description": item.product.description,
                    "product_category": item.product.category,
                    "product_seller": item.product.seller.name,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
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

        order = Order(user_id=user.id)
        db.session.add(order)

        for item_data in data["items"]:
            product = db.session.query(Product).get(item_data.get("product_id"))
            if not product:
                return {
                    "error": f"Product with ID {item_data.get('product_id')} not found"
                }, 404

            order_item = OrderItem(
                order=order,
                product=product,
                quantity=item_data.get("quantity", 1),
                price_at_purchase=product.price,
            )
            db.session.add(order_item)

        db.session.commit()
        return {"message": "Order created successfully", "order_id": order.id}, 201
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/<int:order_id>/cancel", methods=["POST"])
@check_auth
def cancel_order(user, order_id):
    try:
        order = (
            db.session.query(Order)
            .filter(Order.id == order_id, Order.user_id == user.id)
            .first()
        )
        if not order:
            return {"error": "Order not found"}, 404

        if order.status == "delivered":
            return {
                "error": "Cannot cancel an order that has already been delivered"
            }, 400

        order.status = "cancelled"
        db.session.commit()
        return {"message": "Order cancelled successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/<int:order_id>/return", methods=["POST"])
@check_auth
def return_order(user, order_id):
    try:
        data = request.get_json()
        if not data or "reason" not in data:
            return {"error": "Invalid request data"}, 400
        order = (
            db.session.query(Order)
            .filter(Order.id == order_id, Order.user_id == user.id)
            .first()
        )
        if not order:
            return {"error": "Order not found"}, 404

        if order.status != "delivered":
            return {"error": "Only delivered orders can be returned"}, 400

        return_items = (
            db.session.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        )
        if not return_items:
            return {"error": "No items to return in this order"}, 400
        for item in return_items:
            return_record = Return(
                order_item_id=item.id,
                user_id=user.id,
                reason_text=data["reason"],
                reason_category=data.get("reason_category", "other"),
            )
            db.session.add(return_record)
        db.session.flush()

        order.status = "returned"
        db.session.commit()

        return {"message": "Order returned successfully"}, 200
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
                    "status": order.status,
                    "shipped_on_time": order.shipped_on_time,
                    "items": [
                        {
                            "id": item.id,
                            "product_name": item.product.name,
                            "product_description": item.product.description,
                            "product_category": item.product.category,
                            "quantity": item.quantity,
                            "price_at_purchase": item.price_at_purchase,
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
            "status": order.status,
            "shipped_on_time": order.shipped_on_time,
            "items": [
                {
                    "id": item.id,
                    "product_name": item.product.name,
                    "product_description": item.product.description,
                    "product_category": item.product.category,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase,
                }
                for item in order.items
            ],
        }, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/<int:order_id>/deliver", methods=["POST"])
@check_auth_seller
def deliver_order(seller, order_id):
    try:
        data = request.get_json()
        if not data or "shipped_on_time" not in data:
            return {"error": "Invalid request data"}, 400
        order = (
            db.session.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Order.id == order_id, Product.seller_id == seller.id)
            .first()
        )

        if not order:
            return {"error": "Order not found"}, 404

        if order.status != "pending":
            return {"error": "Order can only be delivered if it is pending"}, 400

        order.status = "delivered"
        order.shipped_on_time = data["shipped_on_time"]
        db.session.commit()
        return {"message": "Order delivered successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


@orders_bp.route("/seller/orders/<int:order_id>/cancel", methods=["POST"])
@check_auth_seller
def cancel_seller_order(seller, order_id):
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

        if order.status == "delivered":
            return {
                "error": "Cannot cancel an order that has already been delivered"
            }, 400

        order.status = "cancelled"
        db.session.commit()
        return {"message": "Order cancelled successfully"}, 200
    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500
