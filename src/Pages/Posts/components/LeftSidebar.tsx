import React from "react";
import { LayoutGrid, User, Globe, Bookmark } from "lucide-react";

export type FeedFilter = "feed" | "my-posts" | "community" | "saved";

interface LeftSidebarProps {
  activeFilter: FeedFilter;
  onSelectFilter: (filter: FeedFilter) => void;
  savedCount?: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeFilter,
  onSelectFilter,
  savedCount,
}) => {
  const navItems: {
    id: FeedFilter;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    badge?: number;
  }[] = [
    { id: "feed", label: "Feed", icon: LayoutGrid },
    { id: "my-posts", label: "My Posts", icon: User },
    { id: "community", label: "Community", icon: Globe },
    { id: "saved", label: "Saved", icon: Bookmark, badge: savedCount },
  ];

  return (
    <aside className="w-full">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-2.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectFilter(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-xs"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={isActive ? "text-blue-600" : "text-gray-500"}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
