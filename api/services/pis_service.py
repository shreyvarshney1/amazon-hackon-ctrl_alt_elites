# /services/pis_service.py

from datetime import datetime
from sqlalchemy import func
from models import db, Product, Review, Return, OrderItem, Seller
from ml_integration import analyze_content_originality, analyze_image_authenticity, analyze_aggregated_reviews
from . import scs_service # Use . to import from the same package (services)

# Weights from your PIS slide deck
WEIGHTS = {
    'p1_content_originality': 0.30,
    'p2_price_deviation': 0.20,
    'p3_image_authenticity': 0.10,
    'p4_review_sentiment': 0.30,
    'p5_return_analysis': 0.10,
}

def calculate_pis_score(product_id: int):
    """Calculates the Product Integrity Score (PIS) for a single product."""
    product = Product.query.get(product_id)
    if not product:
        print(f"PIS Error: Product with ID {product_id} not found.")
        return None

    # P1: Content Originality & Richness (LLM)
    p1_score = analyze_content_originality(product.description)

    # P2: Price Point Deviation
    avg_category_price = db.session.query(func.avg(Product.price))\
        .filter(Product.category == product.category, Product.id != product.id).scalar()
    
    if avg_category_price and avg_category_price > 0:
        deviation = abs(product.price - avg_category_price) / avg_category_price
        p2_score = 1 - min(deviation, 1.0) # Cap deviation at 100%
    else:
        p2_score = 0.75 # Neutral score if no comparable products exist

    # P3: Image Authenticity (CV Model)
    p3_score = analyze_image_authenticity(product.image_urls)

    # P4: Aggregated Review Sentiment (LLM)
    reviews = Review.query.filter_by(product_id=product_id).all()
    if reviews:
        themes = analyze_aggregated_reviews(reviews)
        total_themes = themes['Positive_Themes'] + themes['Negative_Themes']
        p4_score = themes['Positive_Themes'] / total_themes if total_themes > 0 else 0.5
    else:
        p4_score = 0.7 # Neutral score for new products with no reviews

    # P5: Return Reason Analysis
    items_sold_count = db.session.query(func.count(OrderItem.id))\
        .filter(OrderItem.product_id == product_id).scalar()
    
    if items_sold_count > 0:
        # Count returns specifically for integrity-related reasons
        integrity_return_count = db.session.query(func.count(Return.id))\
            .join(OrderItem, Return.order_item_id == OrderItem.id)\
            .filter(OrderItem.product_id == product_id)\
            .filter(Return.reason_category.in_(['counterfeit', 'not_as_described', 'damaged', 'fake'])).scalar()
        
        rate_of_integrity_returns = integrity_return_count / items_sold_count
        p5_score = 1 - min(rate_of_integrity_returns, 1.0)
    else:
        p5_score = 1.0 # Perfect score if no items sold/returned yet

    # Final Weighted PIS Score
    final_pis = (
        p1_score * WEIGHTS['p1_content_originality'] +
        p2_score * WEIGHTS['p2_price_deviation'] +
        p3_score * WEIGHTS['p3_image_authenticity'] +
        p4_score * WEIGHTS['p4_review_sentiment'] +
        p5_score * WEIGHTS['p5_return_analysis']
    )
    
    product.pis_score = final_pis
    product.last_pis_update = datetime.utcnow()
    # db.session.commit() is handled in the cascading function to ensure atomicity
    
    print(f"PIS score for product {product_id} calculated as: {final_pis:.2f}")
    return final_pis

def recalculate_pis_and_cascade_scs(product_id: int):
    """
    A transactional function that updates PIS and then triggers an SCS update.
    This creates the real-time link between the services.
    """
    product = Product.query.get(product_id)
    if not product:
        return

    # Calculate the new PIS score
    calculate_pis_score(product_id)
    
    # Cascade the change: Trigger SCS recalculation for the affected seller
    seller_id = product.seller_id
    scs_service.calculate_scs_score(seller_id)
    
    # Commit all changes (PIS and SCS) together
    db.session.commit()
    print(f"--- Event Cascade Complete for Product {product_id} ---")