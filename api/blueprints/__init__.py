from .auth import auth_bp
from .ml_services import uba_service, pis_service, scs_service

bps = [auth_bp, uba_service, pis_service, scs_service]
