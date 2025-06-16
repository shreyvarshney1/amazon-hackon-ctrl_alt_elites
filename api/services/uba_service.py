from datetime import datetime, timedelta
from sqlalchemy import func, distinct
from models import db, User, Review, UserSessionLog, Order, Return
from ml_integration import analyze_linguistic_authenticity

# Weights from your slide deck
WEIGHTS = {
    'p1_age_completeness': 0.15,
    'p2_ip_device': 0.20,
    'p3_review_velocity': 0.25,
    'p4_linguistic_auth': 0.30,
    'p5_purchase_return': 0.10,
}

def calculate_uba_score(user_id: int):
    """Calculates and updates the User Behavior & Anomaly Score."""
    user = User.query.get(user_id)
    if not user:
        return None

    # P1: Account Age & Completeness
    days_since_creation = (datetime.utcnow() - user.created_at.replace(tzinfo=None)).days
    norm_age = 1 - (1 / (1 + days_since_creation * 0.1))
    p1_score = norm_age * user.profile_completeness_score # Combine age and completeness

    # P2: IP & Device Consistency (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    unique_ips = db.session.query(func.count(distinct(UserSessionLog.ip_address)))\
        .filter(UserSessionLog.user_id == user_id, UserSessionLog.timestamp >= thirty_days_ago).scalar()
    max_expected_ips = 10 # Configurable threshold
    p2_score = 1 - min(unique_ips / max_expected_ips, 1.0)
    
    # P3: Review Velocity & Distribution (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    reviews_last_7d = db.session.query(func.count(Review.id))\
        .filter(Review.user_id == user_id, Review.created_at >= seven_days_ago).scalar()
    reviews_per_day = reviews_last_7d / 7.0
    high_velocity_threshold = 5.0 # Configurable: 5 reviews/day is suspicious
    p3_score = 1 - min(reviews_per_day / high_velocity_threshold, 1.0)
    
    # P4: Linguistic Authenticity (average of last 5 reviews)
    recent_reviews = Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc()).limit(5).all()
    if recent_reviews:
        auth_scores = [r.linguistic_authenticity_score for r in recent_reviews if r.linguistic_authenticity_score is not None]
        p4_score = sum(auth_scores) / len(auth_scores) if auth_scores else 0.7 # Default if no scores
    else:
        p4_score = 1.0 # New user with no reviews is not penalized here

    # P5: Purchase-Return Ratio
    order_count = Order.query.filter_by(user_id=user_id).count()
    return_count = Return.query.filter_by(user_id=user_id).count()
    if order_count > 0:
        return_rate = return_count / order_count
        max_acceptable_return_rate = 0.50 # Configurable: 50% return rate is high
        p5_score = 1 - min(return_rate / max_acceptable_return_rate, 1.0)
    else:
        p5_score = 1.0 # No orders, no penalty
        
    # Final Weighted Score
    final_uba = (
        p1_score * WEIGHTS['p1_age_completeness'] +
        p2_score * WEIGHTS['p2_ip_device'] +
        p3_score * WEIGHTS['p3_review_velocity'] +
        p4_score * WEIGHTS['p4_linguistic_auth'] +
        p5_score * WEIGHTS['p5_purchase_return']
    )
    
    user.uba_score = final_uba
    user.last_uba_update = datetime.utcnow()
    db.session.commit()
    
    print(f"UBA score for user {user_id} updated to: {final_uba:.2f}")
    return final_uba
    """
    Microservice 1: User Behavior & Anomaly Score (UBA)
    Calculates a score based on user profile and behavior.
    """
    data = request.json
    
    # --- P1: Account Age & Completeness (Weight: 15%) ---
    # `creation_date` should be in "YYYY-MM-DD" format
    days_since_creation = (datetime.now() - datetime.strptime(data['creation_date'], "%Y-%m-%d")).days
    p1 = 1 - (1 / (1 + days_since_creation * 0.1))

    # --- P2: IP & Device Consistency (Weight: 20%) ---
    # `unique_ips_last_30d` is the count of unique IPs
    # We simulate risk from the current IP
    ip_analysis = get_ip_info(data['current_ip'])
    # Higher number of unique IPs is riskier. A proxy IP is very risky.
    p2 = 1 - min(1, (data['unique_ips_last_30d'] / 10.0 + ip_analysis['proxy_risk'])) # Assuming >10 unique IPs is max risk

    # --- P3: Review Velocity (Weight: 25%) ---
    # `reviews_per_day` is the user's average
    p3 = 1 - min(1, (data['reviews_per_day'] / 5.0)) # Assuming >5 reviews/day is max risk

    # --- P4: Linguistic Authenticity (LLM) (Weight: 30%) ---
    p4 = analyze_review_text(data['latest_review_text'])
    
    # --- P5: Purchase-Return Ratio (Weight: 10%) ---
    p5 = 1 - min(1, data['return_rate']) # return_rate is a float 0.0 to 1.0
    
    # --- Final UBA Score Calculation ---
    w1, w2, w3, w4, w5 = 0.15, 0.20, 0.25, 0.30, 0.10
    uba_score = (w1 * p1) + (w2 * p2) + (w3 * p3) + (w4 * p4) + (w5 * p5)
    
    return jsonify({
        "uba_score": round(uba_score, 4),
        "details": {
            "p1_account_age": round(p1, 2),
            "p2_ip_consistency": round(p2, 2),
            "p3_review_velocity": round(p3, 2),
            "p4_linguistic_authenticity": round(p4, 2),
            "p5_return_ratio": round(p5, 2)
        }
    })