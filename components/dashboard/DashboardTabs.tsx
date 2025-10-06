"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="border-b border-radiomke-charcoal-400/30 mb-6">
      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? "border-radiomke-orange-500 text-radiomke-orange-500"
                  : "border-transparent text-radiomke-cream-600 hover:text-radiomke-cream-500 hover:border-radiomke-cream-600"
              }
            `}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
