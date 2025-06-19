import os
from flask import Flask
from flask_migrate import Migrate
from flask_smorest import Api
from dotenv import load_dotenv
from .blueprints import bps
from .models import db

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", None)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    migrate = Migrate(app, db)

    app.config["API_TITLE"] = "Core API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.2"
    app.config["OPENAPI_URL_PREFIX"] = "/api"
    api = Api(app)
    for bp in bps:
        api.register_blueprint(bp)

    return app, migrate


app, _ = create_app()
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
