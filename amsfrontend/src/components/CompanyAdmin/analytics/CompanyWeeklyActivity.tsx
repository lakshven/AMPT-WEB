import React from "react";

interface Props {
  data: { dayOfWeek: number | null; count: number | null }[];
}

const CompanyWeeklyActivity: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">No weekly activity data available.</p>;
  }

  const weekNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Weekly Activity
      </h2>

      <ul className="space-y-3">
        {data.map((item, index) => {
          const dayIndex =
            typeof item.dayOfWeek === "number" ? item.dayOfWeek : 0;

          const dayLabel = weekNames[dayIndex] || "Unknown";
          const countValue =
            typeof item.count === "number" ? item.count : 0;

          return (
            <li
              key={index}
              className="flex justify-between border-b pb-2"
            >
              <span>{dayLabel}</span>
              <span className="font-bold">{countValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CompanyWeeklyActivity;