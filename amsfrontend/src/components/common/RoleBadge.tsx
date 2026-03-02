// frontend/src/components/common/RoleBadge.tsx
import React from "react";

interface RoleBadgeProps {
  role: string | null | undefined;
  tooltip?: boolean;
}

// Centralized future‑proof config
const ROLE_STYLES: Record<
  string,
  { icon: string; label: string; classes: string }
> = {
  admin: {
    icon: "👑",
    label: "Admin",
    classes: "bg-red-100 text-red-700",
  },
  asset_manager: {
    icon: "🛠",
    label: "Asset Manager",
    classes: "bg-blue-100 text-blue-700",
  },
  editor: {
    icon: "✏️",
    label: "Editor",
    classes: "bg-green-100 text-green-700",
  },
  viewer: {
    icon: "👁",
    label: "Viewer",
    classes: "bg-gray-200 text-gray-700",
  },
  app_admin: {
  icon: "🧿",
  label: "App Admin",
  classes: "bg-purple-100 text-purple-700",
},
single_user: {
  icon: "🧍",
  label: "Single User",
  classes: "bg-indigo-100 text-indigo-700",
},

company_admin: {
  icon: "🏢",
  label: "Company Admin",
  classes: "bg-orange-100 text-orange-700",
},
};

// Fallback for unknown roles
const DEFAULT_STYLE = {
  icon: "❓",
  label: "Unknown",
  classes: "bg-gray-100 text-gray-700",
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, tooltip = true }) => {
  if (!role) return null;

  const normalized = role.toLowerCase();
  const style = ROLE_STYLES[normalized] || DEFAULT_STYLE;

  return (
    <div className="relative group inline-block">
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${style.classes}`}
      >
        {style.icon} {style.label}
      </span>

      {tooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block 
                     bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-50"
        >
          Your current permissions determine what actions you can perform.
        </div>
      )}
    </div>
  );
};

export default RoleBadge;