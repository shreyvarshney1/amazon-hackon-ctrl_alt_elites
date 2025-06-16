from functools import wraps
import os
from flask_smorest import Blueprint
from flask import request, jsonify
import jwt

from api.models import db, User, UserSessionLog

JWT_SECRET=os.getenv('JWT_SECRET')
BASE_ROUTE = '/api/auth'
auth_bp = Blueprint('auth', __name__, url_prefix=BASE_ROUTE)


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        if not email:
            return jsonify({"message": "Email is required"}), 400
        if not username:
            username = email.split('@')[0]
        
        user = db.session.query(User).filter_by(username=username).first()
        if not user:
            user = User(username=username, email=email)
            db.session.add(user)
            db.session.commit()

        token = jwt.encode(
            {'user_id': user.id}, 
            JWT_SECRET,
            algorithm='HS256'
        )
        user_session = UserSessionLog(
            user_id=user.id,
            ip_address=request.remote_addr,
            device_info=request.headers.get('User-Agent')
        )
        db.session.add(user_session)
        db.session.commit()
        return jsonify({"message": "User logged in successfully", "token": token}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


def check_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_token = request.cookies.get('auth_token')
        if not auth_token:
            if request.headers.get('Authorization'):
                auth_token = request.headers['Authorization'].split(" ")[1]
            else:
                return jsonify({"error": "Authorization token is missing"}), 401
        try:
            decoded = jwt.decode(auth_token, JWT_SECRET, algorithms=["HS256"])
            user = db.session.query(User).filter_by(id=decoded['user_id']).first()
            if not user:
                return jsonify({"error": "User not found"}), 404
            return f(user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    return decorated


@auth_bp.route('/session', methods=['GET'])
@check_auth
def get_session(user):
    try:
        session_logs = db.session.query(UserSessionLog).filter_by(user_id=user.id).all()
        session_data = [{
            "id": log.id,
            "ip_address": log.ip_address,
            "device_info": log.device_info,
            "timestamp": log.timestamp.isoformat()
        } for log in session_logs]
        return jsonify({"sessions": session_data}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500