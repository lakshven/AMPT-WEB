import React from "react";

interface Props {
  stats: {
    totalUsers: number;
    totalActivity: number;
    activeUsers: number;
  };
}

const CompanyStatsCard: React.FC<Props> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">No company statistics available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Company Statistics
      </h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Activity</p>
          <p className="text-2xl font-bold">{stats.totalActivity}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Active Users</p>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyStatsCard;