import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const ActivityCategoryChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/user-activity/categories")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#0989B1] mb-4">
        Activity by Category
      </h2>

      <ul className="space-y-2">
        {data.map((item, idx) => (
          <li key={idx} className="text-gray-700">
            <span className="font-semibold capitalize">{item.category}</span>:{" "}
            {item._sum.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityCategoryChart;