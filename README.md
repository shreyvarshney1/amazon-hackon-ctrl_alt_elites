# AI-Powered Trust & Safety Platform for Amazon

### A Submission for `< HackOn > with Amazon 5.0` by Team `Ctrl + Alt + Elites`

## 🚀 Elevator Pitch

Our project is an **AI-Powered Trust & Safety Platform** designed to proactively enhance marketplace trust on Amazon. By leveraging a suite of intelligent microservices, we detect fraud, prevent the sale of counterfeit goods, and verify the authenticity of reviews in real-time. Our goal is to create a safer, more reliable ecosystem for millions of customers and sellers.

---

## 🧐 The Problem

The rapid growth of e-commerce has created significant challenges that erode marketplace trust:

*   **Fraudulent Activities:** Fraudsters exploit the entire product lifecycle. Payment scams like account takeovers have surged by **131%**, while refund fraud costs an estimated **$24 billion** annually.
*   **Counterfeit Products:** High-profile brands have previously left marketplaces due to the proliferation of fake goods, which harms consumers, damages brand integrity, and causes significant financial loss.
*   **Unreliable Reviews:** An estimated **42% of flagged reviews on Amazon are fraudulent**. Paid reviews, bot-generated ratings, and review hijacking mislead customers, leading to poor purchasing decisions and damaging platform credibility.



## ✨ Our Solution

To combat these multifaceted problems, we have developed **three interconnected microservices** that work in concert to build a robust defense for marketplace trust. Each service generates a dynamic score that quantifies risk and trust at different levels of the e-commerce ecosystem.



### Core Microservices

1.  **👤 User Behaviour & Anomaly Score (UBA):** Identifies suspicious user activity by analyzing account history, IP consistency, review velocity, and linguistic patterns to flag potential bots and manipulators.
    *   **Impact:** Authentic users are given a "verified" status, and the weight of reviews from suspicious users is automatically reduced.
    

2.  **📦 Product Integrity Score (PIS):** Ensures a product listing is authentic and accurately described. It analyzes content originality, price deviation, image authenticity (using reverse image search), and aggregated review sentiment to flag potential counterfeits and misrepresented items.
    *   **Impact:** A trust score is displayed directly on the product page, empowering customers to make informed decisions.
    

3.  **🏢 Seller Credibility Score (SCS):** Assesses a seller's overall trustworthiness based on their fulfillment history, performance, and the average integrity of their products (using the PIS).
    *   **Impact:** Reliable sellers earn a "Verified Seller" badge, differentiating them from high-risk sellers and fostering a healthier marketplace.
    

---

## ⚙️ Tech Stack & Architecture

This project is built with a modern, scalable architecture designed for real-time processing and analysis.

*   **Frontend:** **Next.js** | **React** | **Tailwind CSS**
*   **Backend:** **Flask** (Python)
*   **Database:** **PostgreSQL**
*   **AI / Data Analysis:**
    *   **Google Cloud Vision API:** For reverse image search to detect stock/copied product photos.
    *   **TextBlob:** For sentiment and linguistic analysis of reviews and descriptions.
    *   **IP-API:** For analyzing user IP addresses for proxies or suspicious locations.
*   **Proposed AWS Architecture:** The system is designed to be deployed on a serverless architecture using **AWS Lambda**, with data stored in **Amazon S3** and **Aurora PostgreSQL**, and ML models managed via **Amazon SageMaker**.

### Architectural Diagram

Our event-driven architecture ensures that any user, product, or seller action triggers a real-time recalculation of the relevant trust scores, allowing for immediate intervention.

![Architechtural Diagram](image.png)

---

## 🔧 Getting Started

Follow these instructions to get the project running locally on your machine.

### Prerequisites

*   Node.js (v18 or later)
*   Python (v3.9 or later)
*   PostgreSQL
*   Git

### 1. Clone the Repository

```bash
git clone https://github.com/shreyvarshney1/amazon-hackon-ctrl_alt_delete.git
cd amazon-hackon-ctrl_alt_delete
```

### 2. Backend Setup (Flask)

```bash

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download TextBlob corpora
python -m textblob.download_corpora

# Set up environment variables
# Create a .env file and add your PostgreSQL connection string
# and the path to your Google Cloud credentials JSON file.
cp .env.example .env
```
**`.env` file:**
```
DATABASE_URL="postgresql://user:password@localhost/amazon_trust"
GOOGLE_APPLICATION_CREDENTIALS="path/to/your/gcp_credentials.json"
```

### 3. Frontend Setup (Next.js)

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file to link to your backend API.
cp .env.local.example .env.local
```
**`.env.local` file:**
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:5001
```

```bash
# Run the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🔌 API Endpoints

Our backend exposes the following endpoints for calculating trust scores.

### `POST /uba` - User Behaviour Anomaly Score
Calculates a trust score for a user.
**Request Body:**
```json
{
    "creation_date": "2020-01-15",
    "current_ip": "8.8.8.8",
    "unique_ips_last_30d": 2,
    "reviews_per_day": 0.1,
    "latest_review_text": "This camera works wonderfully for my setup.",
    "return_rate": 0.05
}
```
**Success Response:**
```json
{
    "uba_score": 0.8512,
    "details": { ... }
}
```

### `POST /pis` - Product Integrity Score
Calculates an authenticity score for a product listing.
**Request Body:**
```json
{
    "product_description": "Hand-crafted from solid oak...",
    "product_price": 250.00,
    "avg_category_price": 240.00,
    "product_image_url": "https://example.com/image.jpg",
    "review_sentiments": [0.8, 0.9, 0.7, -0.2],
    "integrity_return_rate": 0.02
}
```
**Success Response:**
```json
{
    "pis_score": 0.9150,
    "details": { ... }
}
```

### `POST /scs` - Seller Credibility Score
Calculates a credibility score for a seller.
**Request Body:**
```json
{
    "cancellation_rate": 0.01,
    "on_time_shipping_rate": 0.99,
    "seller_tenure_days": 800,
    "sales_spike_factor": 0.1,
    "positive_seller_review_ratio": 0.95,
    "dispute_rate": 0.005,
    "average_pis_of_products": 0.85
}
```
**Success Response:**
```json
{
    "scs_score": 0.9025,
    "details": { ... }
}
```

---

## 📈 Future Scope

*   **Real-Time Intervention System:** Develop automated rules to instantly flag, delist, or restrict sellers and products the moment trust scores drop below critical thresholds.
*   **Seller Behaviour Forecasting:** Use time-series analysis on seller data to build predictive models that anticipate future fraudulent patterns, allowing for pre-emptive action.

---

## 🏆 Our Team: `Ctrl + Alt + Elites`

*   **Atharv Sathe**
*   **Shrey Varshney**
*   **Sujoy De**
*   **Manoj Kumar Pradhan**

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.