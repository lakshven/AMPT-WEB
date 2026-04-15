import React from "react";

interface Props {
  data: { category: string | null; count: number | null }[];
}

const CompanyCategoryChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">No category usage data available.</p>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Category Usage
      </h2>

      <ul className="space-y-3">
        {data.map((item, index) => {
          const categoryName = item.category?.trim() || "Unknown";
          const countValue = typeof item.count === "number" ? item.count : 0;

          return (
            <li
              key={index}
              className="flex justify-between border-b pb-2"
            >
              <span>{categoryName}</span>
              <span className="font-bold">{countValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CompanyCategoryChart;