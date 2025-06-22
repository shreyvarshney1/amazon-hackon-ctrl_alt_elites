// app/products/filter-section.tsx
import React from "react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <h3 className="font-bold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
