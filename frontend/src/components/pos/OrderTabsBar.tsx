import React from 'react';
import { useOrderTabsStore } from '../../hooks/useOrderTabsStore';
import { Plus, X } from 'lucide-react';

const OrderTabsBar: React.FC = () => {
  const { tabs, activeTabId, addTab, switchTab, closeTab } = useOrderTabsStore();

  return (
    <div className="flex items-center gap-2 p-2 border-b bg-muted/50 overflow-x-auto">
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => switchTab(tab.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-colors
            ${activeTabId === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted'
            }`}
        >
          <span className="text-sm font-medium">{tab.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // منع التبديل إلى التاب عند إغلاقه
              closeTab(tab.id);
            }}
            className={`rounded-full p-0.5 transition-colors
              ${activeTabId === tab.id
                ? 'hover:bg-primary/80'
                : 'hover:bg-destructive/20 text-muted-foreground hover:text-destructive'
              }`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addTab}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-background hover:bg-primary hover:text-primary-foreground border"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default OrderTabsBar;
