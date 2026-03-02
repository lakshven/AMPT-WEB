import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Props {
  userId: number;
}

const UserAnalytics: React.FC<Props> = ({ userId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/admin/user-activity/user/${userId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Loading user analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#0989B1] mb-4">
        User Analytics (User {userId})
      </h2>

      <ul className="space-y-2">
        {data.map((item, idx) => (
          <li key={idx} className="text-gray-700">
            Day {item.dayOfWeek}, Hour {item.hour}: {item.count} actions
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAnalytics;