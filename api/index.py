import os
from flask import Flask, request, jsonify
from models import db, User, Seller, Product, Review, Order, OrderItem, Return, UserSessionLog
from services import uba_service, pis_service, scs_service
from ml_integration import analyze_linguistic_authenticity

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URI', None)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # --- EVENT-DRIVEN API ENDPOINTS (The Triggers) ---
    
    @app.route('/api/event/review-posted', methods=['POST'])
    def on_review_posted():
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        review_text = data.get('review_text')
        
        if not all([user_id, product_id, review_text]):
            return jsonify({"error": "Missing user_id, product_id, or review_text"}), 400

        # 1. Analyze the review's authenticity (LLM call) and save it
        review = Review.query.get(data.get('review_id')) # Assuming review is already created
        review.linguistic_authenticity_score = analyze_linguistic_authenticity(review_text)
        db.session.commit()

        # 2. Trigger UBA recalculation for the user who posted
        uba_service.calculate_uba_score(user_id)
        
        # 3. Trigger PIS recalculation for the product that was reviewed
        # This will cascade to SCS
        pis_service.recalculate_pis_and_cascade_scs(product_id)
        
        return jsonify({"message": "Review event processed. UBA and PIS scores updated."}), 200

    @app.route('/api/event/item-returned', methods=['POST'])
    def on_item_returned():
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')

        # 1. Trigger UBA recalculation for the user (due to change in return ratio)
        uba_service.calculate_uba_score(user_id)

        # 2. Trigger PIS recalculation for the product (due to change in return reasons)
        pis_service.recalculate_pis_and_cascade_scs(product_id)

        return jsonify({"message": "Return event processed. UBA and PIS scores updated."}), 200

    # ... Other event endpoints for /product-listed, /purchase-made ...
    
    # --- DATA-FETCHING API ENDPOINTS (For Next.js Frontend) ---
    
    @app.route('/api/product/<int:product_id>', methods=['GET'])
    def get_product_details():
        product = Product.query.get_or_404(product_id)
        seller = Seller.query.get(product.seller_id)
        
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "product_integrity_score": product.pis_score, # The PIS score for the UI
            "seller": {
                "id": seller.id,
                "name": seller.name,
                "seller_credibility_score": seller.scs_score # The SCS score for the UI
            }
        })

    @app.route('/api/review/<int:review_id>', methods=['GET'])
    def get_review_with_author_trust():
        review = Review.query.get_or_404(review_id)
        author = User.query.get(review.user_id)
        UBA_THRESHOLD_FOR_TICK = 0.7 # Configurable

        return jsonify({
            "id": review.id,
            "review_text": review.review_text,
            "rating": review.rating,
            "author": {
                "id": author.id,
                "username": author.username,
                "has_trusted_badge": author.uba_score > UBA_THRESHOLD_FOR_TICK if author.uba_score else False # Green tick logic
            }
        })

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)