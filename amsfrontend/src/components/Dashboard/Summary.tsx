import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
// ✅ Type for backend summary response
interface AssetSummary {
  total: number;
  highRisk: number;
}

const Summary: React.FC = () => {
  const [summary, setSummary] = useState<AssetSummary | null>(null);

  useEffect(() => {
    axiosInstance.get<AssetSummary>("/client-groups/assets-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error("Error fetching summary:", err));
  }, []);

  if (!summary) return <p>Loading summary...</p>;

  return (
    <div className="mb-4">
      <p>Total Assets: {summary.total}</p>
      <p>High Risk Assets: {summary.highRisk}</p>
    </div>
  );
};

export default Summary;
