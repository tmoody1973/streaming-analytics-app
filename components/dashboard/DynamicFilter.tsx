"use client";

import { useMemo } from "react";
import type { FilterSpecification, RadioMetrics } from "@/types";

interface DynamicFilterProps {
  filter: FilterSpecification;
  data: RadioMetrics[];
  value: any;
  onChange: (value: any) => void;
}

export default function DynamicFilter({ filter, data, value, onChange }: DynamicFilterProps) {
  const options = useMemo(() => {
    if (filter.options) return filter.options;

    // Auto-generate options from data
    const uniqueValues = [...new Set(data.map((item) => (item as any)[filter.field]).filter(Boolean))];
    return uniqueValues.map(String).sort();
  }, [filter, data]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value === "all" ? null : e.target.value);
  };

  if (filter.type === "select") {
    return (
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-radiomke-cream-500 mb-2">{filter.label}</label>
        <select
          value={value || "all"}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-radiomke-charcoal-700 border border-radiomke-charcoal-400/30 rounded-lg text-radiomke-cream-500 focus:outline-none focus:ring-2 focus:ring-radiomke-orange-500"
        >
          <option value="all">All {filter.label}s</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (filter.type === "date") {
    return (
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-radiomke-cream-500 mb-2">{filter.label}</label>
        <input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
          className="w-full px-4 py-2 bg-radiomke-charcoal-700 border border-radiomke-charcoal-400/30 rounded-lg text-radiomke-cream-500 focus:outline-none focus:ring-2 focus:ring-radiomke-orange-500"
        />
      </div>
    );
  }

  return null;
}
