from .auth import auth_bp
from .ml_services import uba_bp, pis_bp, scs_bp

bps = [auth_bp, uba_bp, pis_bp, scs_bp]
