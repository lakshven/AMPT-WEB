import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
// Backend response type
interface SummaryResponse {
  total: number;
  high_risk: number;
}

const ClientGroupAssetsWidget: React.FC = () => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get<SummaryResponse>("/assets/summary");
        setData(res.data);
      } catch (err: any) {
        setError("Failed to load summary: " + (err.response?.data || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-600">{error}</div>;

  return (
    <div className="card p-4 rounded-lg shadow-sm bg-white">
      <h3 className="text-sm font-semibold text-gray-600">
        Assets per Client Group
      </h3>
      <div className="mt-3 flex justify-between">
        <div>
          <div className="text-xs text-gray-500">Total assets</div>
          <div className="text-xl font-bold">{data?.total ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">High risk (≥ 7)</div>
          <div className="text-xl font-bold text-red-600">
            {data?.high_risk ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientGroupAssetsWidget;