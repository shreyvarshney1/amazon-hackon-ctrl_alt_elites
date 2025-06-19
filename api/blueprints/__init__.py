from .auth import auth_bp
from .services import services_bp
from .products import product_bp
from .seller import seller_bp
from .orders import orders_bp

bps = [auth_bp, product_bp, seller_bp, services_bp, orders_bp]
