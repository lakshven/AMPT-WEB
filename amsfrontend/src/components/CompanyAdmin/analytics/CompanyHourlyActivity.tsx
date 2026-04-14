import React from "react";

interface Props {
  data: { hour: string | null; count: number | null }[];
}

const CompanyHourlyActivity: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">No hourly activity data available.</p>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Hourly Activity
      </h2>

      <ul className="space-y-3">
        {data.map((item, index) => {
          const hourLabel = item.hour?.trim() || "Unknown";
          const countValue = typeof item.count === "number" ? item.count : 0;

          return (
            <li
              key={index}
              className="flex justify-between border-b pb-2"
            >
              <span>{hourLabel}</span>
              <span className="font-bold">{countValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CompanyHourlyActivity;