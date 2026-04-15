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
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Company Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Users */}
        <div className="p-5 rounded-xl bg-[#E6F4EA] border border-[#549E39]/30 shadow-sm text-center">
          <p className="text-[#2E7D32] font-medium text-sm">Total Users</p>
          <p className="text-3xl font-bold text-[#1B5E20] mt-1">
            {stats.totalUsers}
          </p>
        </div>

        {/* Total Activity */}
        <div className="p-5 rounded-xl bg-[#F0F9FF] border border-[#0989B1]/30 shadow-sm text-center">
          <p className="text-[#026C8A] font-medium text-sm">Total Activity</p>
          <p className="text-3xl font-bold text-[#01546A] mt-1">
            {stats.totalActivity}
          </p>
        </div>

        {/* Active Users */}
        <div className="p-5 rounded-xl bg-[#FFF7E6] border border-[#FFB74D]/30 shadow-sm text-center">
          <p className="text-[#E65100] font-medium text-sm">Active Users</p>
          <p className="text-3xl font-bold text-[#BF360C] mt-1">
            {stats.activeUsers}
          </p>
        </div>

      </div>
    </div>
  );
};

export default CompanyStatsCard;
