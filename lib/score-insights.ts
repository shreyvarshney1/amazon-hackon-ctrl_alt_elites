// lib/score-insights.ts

export type ScoreType = "PIS" | "SCS" | "UBA";

interface ScoreInsightLevel {
  threshold: number;
  flag: string;
  flagColor: string;
  insight: string;
}

export interface ScoreConfig {
  name: string;
  description: string;
  levels: ScoreInsightLevel[];
}

export const scoreInsights: Record<ScoreType, ScoreConfig> = {
  PIS: {
    name: "Product Integrity Score",
    description:
      "This score ensures a product listing is authentic, accurately described, and not a counterfeit. A higher score indicates a more trustworthy product.",
    levels: [
      {
        threshold: 0,
        flag: "Suspicious",
        flagColor: "bg-red-500 text-white",
        insight:
          "This product is flagged as suspicious due to potential counterfeiting, misrepresentation, or quality issues.",
      },
      {
        threshold: 0.2,
        flag: "Caution",
        flagColor: "bg-yellow-500 text-black",
        insight:
          "This product warrants caution. It may have some inconsistencies in its listing or a slightly higher than normal rate of negative feedback.",
      },
      {
        threshold: 0.6,
        flag: "Verified",
        flagColor: "bg-green-500 text-white",
        insight:
          "This product has a good integrity score, indicating it is likely authentic and accurately described.",
      },
      {
        threshold: 0.8,
        flag: "Excellent",
        flagColor: "bg-blue-500 text-white",
        insight:
          "This product has an excellent integrity score, indicating a high degree of trust in its authenticity and description.",
      },
    ],
  },
  SCS: {
    name: "Seller Credibility Score",
    description:
      "This score assesses a seller's overall trustworthiness based on their history, performance, and the quality of their products. A high score indicates a reliable seller.",
    levels: [
      {
        threshold: 0,
        flag: "High Risk",
        flagColor: "bg-red-500 text-white",
        insight:
          "This seller is considered high-risk due to a history of issues or poor performance.",
      },
      {
        threshold: 0.3,
        flag: "Moderate",
        flagColor: "bg-yellow-500 text-black",
        insight:
          "This seller has a moderate credibility score. Proceed with some caution.",
      },
      {
        threshold: 0.7,
        flag: "Reliable",
        flagColor: "bg-green-500 text-white",
        insight:
          "This seller has a strong track record of reliability and customer satisfaction.",
      },
      {
        threshold: 0.9,
        flag: "Top Seller",
        flagColor: "bg-blue-500 text-white",
        insight:
          "This is a top-rated seller with a history of excellent service and high-quality products.",
      },
    ],
  },
  UBA: {
    name: "User Behavior and Anomaly Score",
    description:
      "This score identifies suspicious user activity and anomalous behavior on the platform, flagging potential bots, account takeovers, or review manipulators. A lower score indicates higher risk.",
    levels: [
      {
        threshold: 0,
        flag: "Suspicious Activity",
        flagColor: "bg-red-500 text-white",
        insight:
          "Highly suspicious behavior detected, such as high IP churn or inauthentic-looking reviews.",
      },
      {
        threshold: 0.2,
        flag: "Unusual Patterns",
        flagColor: "bg-yellow-500 text-black",
        insight:
          "Some unusual user activity patterns have been noted, warranting caution.",
      },
      {
        threshold: 0.5,
        flag: "Normal",
        flagColor: "bg-green-500 text-white",
        insight:
          "User behavior appears to be normal and within expected patterns.",
      },
      {
        threshold: 0.8,
        flag: "Trusted User",
        flagColor: "bg-blue-500 text-white",
        insight:
          "This user has a consistent and trusted activity record on the platform.",
      },
    ],
  },
};
