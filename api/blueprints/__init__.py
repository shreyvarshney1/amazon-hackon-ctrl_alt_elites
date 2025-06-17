from .auth import auth_bp
from .services import uba_bp, pis_bp, scs_bp
from .products import product_bp
from .seller import seller_bp

bps = [auth_bp, product_bp, seller_bp, uba_bp, pis_bp, scs_bp]
