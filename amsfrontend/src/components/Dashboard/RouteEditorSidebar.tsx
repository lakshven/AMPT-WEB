import React from "react";
import { Asset } from "../common/MapView";

interface RouteEditorSidebarProps {
  assets: Asset[];
  selectedAssetId: number | string | null;
  setSelectedAssetId: (id: number | string | null) => void;
  distances: number[]; // distance between each pair
  totalDistance: number;
  onSave: () => void;
  onOptimize: () => void;
}

const RouteEditorSidebar: React.FC<RouteEditorSidebarProps> = ({
  assets,
  selectedAssetId,
  setSelectedAssetId,
  distances,
  totalDistance,
  onSave,
  onOptimize,
}) => {
  const sorted = [...assets].sort(
    (a, b) => Number(a.routeOrder ?? 0) - Number(b.routeOrder ?? 0)
  );

  return (
    <div className="w-full md:w-72 bg-white/90 rounded shadow p-4 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Route Editor</h3>

      {/* Total Distance */}
      <div className="mb-3 text-sm font-semibold text-gray-700">
        Total Distance:{" "}
        <span className="text-blue-700">
          {totalDistance.toFixed(2)} km
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {sorted.map((asset, index) => {
          const isSelected = selectedAssetId === asset.id;

          return (
            <div
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id!)}
              className={`cursor-pointer flex items-center justify-between px-2 py-2 rounded border text-sm transition
                ${
                  isSelected
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              <span
                className={`font-semibold ${
                  isSelected ? "text-blue-900" : "text-blue-700"
                }`}
              >
                {index + 1}.
              </span>

              <div className="flex-1 ml-2">
                <div
                  className={`font-medium ${
                    isSelected ? "text-gray-900" : "text-gray-800"
                  }`}
                >
                  {asset.structure_no ||
                    asset.structure_name ||
                    "Unnamed"}
                </div>

                <div className="text-xs text-gray-500 truncate">
                  {asset.location}
                </div>

                {/* Distance to next asset */}
                {index < distances.length && (
                  <div className="text-xs text-green-700 mt-1">
                    → {distances[index].toFixed(2)} km
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <p className="text-sm text-gray-500">No assets in route.</p>
        )}
      </div>

      {/* Optimize Route */}
      <button
        onClick={onOptimize}
        className="mt-3 w-full px-3 py-2 rounded bg-purple-600 text-white text-sm font-semibold"
      >
        Optimize Route
      </button>

      {/* Save Route Order */}
      <button
        onClick={onSave}
        className="mt-2 w-full px-3 py-2 rounded bg-green-600 text-white text-sm font-semibold"
      >
        Save Route Order
      </button>
    </div>
  );
};

export default RouteEditorSidebar;