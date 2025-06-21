"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import StarRating from "@/components/star-rating";
import FilterSection from "./filter-section";

// In a real application, this data would likely come from an API
const brandOptions = ["Samsung", "Realme", "Vivo", "Oppo", "Apple", "Xiaomi"];
const osOptions = ["Android", "iOS", "OxygenOS"];

export default function SearchSidebar() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <aside className="w-64 p-4 border-r border-gray-200 hidden lg:block">
      <FilterSection title="Department">
        <div className="text-sm text-blue-600 mb-2 font-semibold">
          Smartphones & Mobiles
        </div>
      </FilterSection>

      <FilterSection title="Customer Review">
        {[4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center text-sm cursor-pointer hover:text-orange-600">
            <StarRating rating={rating} />
            <span className="ml-2 text-gray-700">& Up</span>
          </div>
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {brandOptions.map((brand) => (
          <div key={brand} className="flex items-center">
            <Checkbox
              id={brand}
              checked={selectedBrands.includes(brand)}
              onCheckedChange={() => handleBrandToggle(brand)}
            />
            <label htmlFor={brand} className="ml-2 text-sm cursor-pointer text-gray-800">
              {brand}
            </label>
          </div>
        ))}
        <button className="text-blue-600 text-sm mt-2 flex items-center hover:text-orange-600 cursor-pointer">
          <ChevronDown className="w-4 h-4 mr-1" />
          See more
        </button>
      </FilterSection>

      <FilterSection title="Operating System">
        {osOptions.map((os) => (
          <div key={os} className="flex items-center">
            <Checkbox id={os} />
            <label htmlFor={os} className="ml-2 text-sm cursor-pointer text-gray-800">
              {os}
            </label>
          </div>
        ))}
      </FilterSection>
      
      <FilterSection title="Price">
          <div className="space-y-1 text-sm text-blue-600">
              <div className="cursor-pointer hover:text-orange-600">Under ₹1,000</div>
              <div className="cursor-pointer hover:text-orange-600">₹1,000 - ₹5,000</div>
              <div className="cursor-pointer hover:text-orange-600">₹5,000 - ₹10,000</div>
              <div className="cursor-pointer hover:text-orange-600">₹10,000 - ₹20,000</div>
              <div className="cursor-pointer hover:text-orange-600">Over ₹20,000</div>
          </div>
      </FilterSection>
    </aside>
  );
}