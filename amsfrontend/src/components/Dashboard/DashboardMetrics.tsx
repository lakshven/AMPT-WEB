import React from "react";
import ClientGroupAssetsWidget from "./ClientGroupAssetsWidget";

interface Metrics {
  total: number;
  completed: number;
  open: number;
  highRisk: number;   // ✅ FIXED
}

interface DashboardMetricsProps {
  metrics: Metrics;
  onViewAssetLog: () => void;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  onViewAssetLog,
}) => {
  return (
    <div className="col-span-2 rounded shadow p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">WELCOME</h1>
      <p className="text-gray-600 mb-6">
        Asset Management Prioritisation System
      </p>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        DASHBOARD METRICS
      </h2>

      <div className="flex flex-row gap-4 mb-6">
        <div className="basis-64 shrink-0 grow-0 bg-blue-100 text-blue-800 p-4 rounded shadow text-center">
          <p className="text-3xl font-bold">{metrics.total}</p>
          <p className="uppercase text-sm mt-2">Total Tasks</p>
        </div>

        <div className="basis-64 shrink-0 grow-0 bg-green-100 text-green-800 p-4 rounded shadow text-center">
          <p className="text-3xl font-bold">{metrics.completed}</p>
          <p className="uppercase text-sm mt-2">Completed</p>
        </div>

        <div className="basis-64 shrink-0 grow-0 bg-red-100 text-red-800 p-4 rounded shadow text-center">
          <p className="text-3xl font-bold">{metrics.open}</p>
          <p className="uppercase text-sm mt-2">Open</p>
        </div>

        <div className="basis-64 shrink-0 grow-0 bg-yellow-100 text-yellow-800 p-4 rounded shadow text-center">
          <p className="text-3xl font-bold">{metrics.highRisk}</p>
          <p className="uppercase text-sm mt-2">High Risk (CR &gt;= 7)</p>
        </div>
      </div>

      <div className="mt-4 mb-6">
        <button
          onClick={onViewAssetLog}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          VIEW ASSET LOG
        </button>
      </div>

      <div className="mt-4">
        <ClientGroupAssetsWidget />
      </div>
    </div>
  );
};

export default DashboardMetrics;
