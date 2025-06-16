# /services/scs_service.py

from datetime import datetime
from sqlalchemy import func
from models import db, Seller, Product, Order, OrderItem, Review
# Note: We are not importing pis_service to avoid circular dependencies.
# The cascade is initiated from PIS -> SCS.

# Weights from your SCS slide deck
WEIGHTS = {
    'p1_fulfillment': 0.25,
    'p2_history_velocity': 0.15,
    'p3_seller_reviews': 0.30,
    'p4_disputes': 0.20,
    'p5_avg_pis': 0.10,
}

def calculate_scs_score(seller_id: int):
    """Calculates the Seller Credibility Score (SCS) for a single seller."""
    seller = Seller.query.get(seller_id)
    if not seller:
        print(f"SCS Error: Seller with ID {seller_id} not found.")
        return None

    # P1: Order Fulfillment Rate
    seller_products_subquery = db.session.query(Product.id).filter(Product.seller_id == seller_id).subquery()
    seller_orders_query = db.session.query(Order).join(OrderItem).filter(OrderItem.product_id.in_(seller_products_subquery))
    
    total_orders = seller_orders_query.count()
    if total_orders > 0:
        # On-time shipping rate
        on_time_count = seller_orders_query.filter(Order.shipped_on_time == True).count()
        on_time_rate = on_time_count / total_orders
        
        # Cancellation rate (seller-initiated)
        cancelled_count = seller_orders_query.filter(Order.status == 'cancelled').count()
        cancellation_rate = cancelled_count / total_orders
        
        p1_score = (1 - cancellation_rate) * on_time_rate
    else:
        p1_score = 0.7 # Neutral score for new sellers with no orders

    # P2: Seller History & Velocity
    # A composite score based on tenure and sales stability
    days_as_seller = (datetime.utcnow() - seller.created_at.replace(tzinfo=None)).days
    tenure_score = 1 - (1 / (1 + days_as_seller * 0.05)) # Normalizes tenure
    # NOTE: Sales velocity/stability analysis would be more complex, involving time-series data.
    # We use tenure as a strong proxy for this hackathon.
    p2_score = tenure_score
    
    # P3: Aggregated Seller-Specific Reviews (LLM)
    # This analyzes reviews on the seller's products, looking for seller-related feedback.
    all_seller_reviews = db.session.query(Review).join(Product).filter(Product.seller_id == seller_id).all()
    if all_seller_reviews:
        # In a real app, you'd have a separate LLM prompt for this.
        # Here we assume the existing stub can find seller-related themes.
        from ml_integration import analyze_aggregated_reviews 
        themes = analyze_aggregated_reviews(all_seller_reviews) # Re-using stub for demo
        total_themes = themes['Positive_Themes'] + themes['Negative_Themes']
        p3_score = themes['Positive_Themes'] / total_themes if total_themes > 0 else 0.5
    else:
        p3_score = 0.7 # Neutral score if no reviews yet

    # P4: Dispute & Chargeback Rate
    # ASSUMPTION: This data would come from a separate Payments/Disputes system.
    # We simulate it with a placeholder. A real implementation would query a 'Disputes' table.
    dispute_rate = 0.05 # Placeholder: 5% dispute rate
    dispute_weight_factor = 5.0 # Amplify the impact of disputes
    p4_score = 1 - min(dispute_rate * dispute_weight_factor, 1.0)

    # P5: Average Product Integrity (Interlink)
    # This is the CRITICAL link from the PIS microservice.
    avg_pis = db.session.query(func.avg(Product.pis_score))\
        .filter(Product.seller_id == seller_id).scalar()
    
    # If a seller has no products or their PIS hasn't been calculated, give a neutral score.
    p5_score = avg_pis if avg_pis is not None else 0.7

    # Final Weighted SCS Score
    final_scs = (
        p1_score * WEIGHTS['p1_fulfillment'] +
        p2_score * WEIGHTS['p2_history_velocity'] +
        p3_score * WEIGHTS['p3_seller_reviews'] +
        p4_score * WEIGHTS['p4_disputes'] +
        p5_score * WEIGHTS['p5_avg_pis']
    )
    
    seller.scs_score = final_scs
    seller.last_scs_update = datetime.utcnow()
    # db.session.commit() is handled by the calling function (recalculate_pis_and_cascade_scs)
    
    print(f"SCS score for seller {seller_id} updated to: {final_scs:.2f}")
    return final_scs
    """
    Microservice 3: Seller Credibility Score (SCS)
    Calculates a score based on seller history and performance.
    """
    data = request.json
    
    # This endpoint relies on data from the other two microservices (PIS) and other metrics.
    # We assume these are passed in the request.
    
    # --- P1: Order Fulfillment Rate (Weight: 25%) ---
    p1 = (1 - data['cancellation_rate']) * data['on_time_shipping_rate']

    # --- P2: Seller History & Velocity (Weight: 15%) ---
    seller_tenure_days = data['seller_tenure_days']
    # A score that rewards tenure but penalizes sudden sales spikes
    tenure_score = min(1, seller_tenure_days / 365.0) 
    velocity_stability = 1 - data['sales_spike_factor'] # 0=stable, 1=huge spike
    p2 = (tenure_score * 0.7) + (velocity_stability * 0.3)
    
    # --- P3: Aggregated Seller-Specific Reviews (Weight: 30%) ---
    # This would analyze reviews about the *seller* (e.g., "fast shipping," "rude service")
    # For simplicity, we'll simulate this with a simple positive ratio.
    p3 = data['positive_seller_review_ratio']
    
    # --- P4: Dispute & Chargeback Rate (Weight: 20%) ---
    p4 = 1 - data['dispute_rate']
    
    # --- P5: Average Product Integrity (Weight: 10%) ---
    # This is the critical link: the average PIS of all the seller's products
    p5 = data['average_pis_of_products']
    
    # --- Final SCS Score Calculation ---
    w1, w2, w3, w4, w5 = 0.25, 0.15, 0.30, 0.20, 0.10
    scs_score = (w1 * p1) + (w2 * p2) + (w3 * p3) + (w4 * p4) + (w5 * p5)
    
    return jsonify({
        "scs_score": round(scs_score, 4),
        "details": {
            "p1_fulfillment": round(p1, 2),
            "p2_history_velocity": round(p2, 2),
            "p3_seller_reviews": round(p3, 2),
            "p4_dispute_rate": round(p4, 2),
            "p5_avg_product_integrity": round(p5, 2)
        }
    })