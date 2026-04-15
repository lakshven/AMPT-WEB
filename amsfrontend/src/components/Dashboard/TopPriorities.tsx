import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { PriorityItem } from "../../types/PriorityItem";

interface TopPrioritiesProps {
  priorities: PriorityItem[];
  refreshDashboard: () => void;
}

const TopPriorities: React.FC<TopPrioritiesProps> = ({
  priorities,
  refreshDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("score-desc");
  const navigate = useNavigate();

  const getScoreClass = (score: number | null | undefined) => {
    if (score == null) return "bg-gray-300 text-gray-800";
    if (score >= 15) return "bg-red-600 text-white";     // CR high
    if (score >= 7) return "bg-yellow-400 text-black";   // CR medium
    return "bg-green-600 text-white";                    // CR low
  };

  // ⭐ Updated: mark work item complete
  const handleMarkComplete = async (id: number) => {
    try {
      await axiosInstance.put(`/work-items/${id}`, {
        status: "Completed",
      });
      refreshDashboard();
    } catch (err) {
      console.error("Failed to complete work item:", err);
    }
  };

  const filtered = priorities.filter((item) => {
    const location = item.asset?.location || "";
    return (
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "score-desc":
        return (b.score ?? 0) - (a.score ?? 0);
      case "score-asc":
        return (a.score ?? 0) - (b.score ?? 0);
      case "location-asc":
        return (a.asset?.location || "").localeCompare(
          b.asset?.location || ""
        );
      case "code-asc":
        return a.code.localeCompare(b.code);
      default:
        return 0;
    }
  });

  return (
    <div className="col-span-2 p-6 rounded shadow bg-white">
      <h2 className="text-xl text-black font-bold mb-4">TOP 5 PRIORITIES</h2>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by code, location, or issue"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-3 py-2 border rounded shadow-sm bg-white"
        >
          <option value="score-desc">Score: High → Low</option>
          <option value="score-asc">Score: Low → High</option>
          <option value="location-asc">Location: A → Z</option>
          <option value="code-asc">Code: A → Z</option>
        </select>
      </div>

      {/* Priority Cards */}
      <div className="space-y-6">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 shadow-sm bg-white relative"
          >
            {/* Header Row */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">
                {item.code} – {item.asset?.location || "Unknown Location"}
              </h3>
              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${getScoreClass(
                  item.score
                )}`}
              >
                {item.score ?? "N/A"}
              </span>
            </div>

            {/* Issue */}
            <p className="text-sm mb-2">{item.issue}</p>

            {/* ⭐ Updated: show consequence instead of mitigation */}
            <p className="text-sm italic mb-6">
              {item.consequence || "No consequence provided"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-2 relative z-10">
              {/* ⭐ Updated: open asset log filtered to this asset */}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() =>
                  navigate(`/asset-log?assetId=${item.assetId}`)
                }
              >
                View Asset
              </button>

              {/* ⭐ Updated: open work item edit modal */}
              <button
                className="btn-update"
                onClick={() => navigate(`/work-items/${item.id}/edit`)}
              >
                Update
              </button>

              {/* ⭐ Updated: mark work item complete */}
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={() => handleMarkComplete(item.id)}
              >
                Mark Complete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPriorities;
