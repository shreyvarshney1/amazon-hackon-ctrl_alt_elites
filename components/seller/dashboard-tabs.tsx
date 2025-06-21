// components/seller/dashboard-tabs.tsx

"use client";

interface DashboardTabsProps {
  activeTab: "products" | "orders";
  setActiveTab: (tab: "products" | "orders") => void;
}

const tabs = [
  { id: "products", name: "Products" },
  { id: "orders", name: "Orders" },
] as const;

export default function DashboardTabs({
  activeTab,
  setActiveTab,
}: DashboardTabsProps) {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
