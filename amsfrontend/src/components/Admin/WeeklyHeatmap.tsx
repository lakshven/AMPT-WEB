import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WeeklyHeatmap: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/user-activity/weekly")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Loading weekly activity...</p>
      </div>
    );
  }

  // Group data by day
  const grouped = data.reduce((acc: any, item: any) => {
    if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = [];
    acc[item.dayOfWeek].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[#0989B1] mb-4">
        Weekly Activity
      </h2>

      <p className="text-gray-600 text-sm mb-6">
        Expand any day to view the exact times and number of actions recorded.
      </p>

      <div className="space-y-4">
        {Object.keys(grouped).map((dayIndex: any) => {
          const entries = grouped[dayIndex];

          // Extract date from first entry
          const date = entries[0]?.date || ""; // backend must send date field

          return (
            <div
              key={dayIndex}
              className="border rounded-lg p-4 bg-gray-50"
            >
              {/* Header row */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenDay(openDay === Number(dayIndex) ? null : Number(dayIndex))
                }
              >
                <h3 className="text-lg font-semibold text-[#0989B1]">
                  {days[dayIndex]} {date && `(${date})`}
                </h3>

                <span className="text-gray-600">
                  {openDay === Number(dayIndex) ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded content */}
              {openDay === Number(dayIndex) && (
                <div className="mt-3 space-y-1">
                  {entries.map((item: any, idx: number) => (
                    <p key={idx} className="text-gray-700 text-sm">
                      • {item.hour} — {item._sum.count} actions
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHeatmap;