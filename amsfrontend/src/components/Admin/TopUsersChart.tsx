import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const TopUsersChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/user-activity/top-users")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Loading top users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#0989B1] mb-4">
        Top Active Users
      </h2>

      <ul className="space-y-2">
        {data.map((item, idx) => (
          <li key={idx} className="text-gray-700">
            <span className="font-semibold">User {item.userId}</span>:{" "}
            {item._sum.count} actions
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopUsersChart;