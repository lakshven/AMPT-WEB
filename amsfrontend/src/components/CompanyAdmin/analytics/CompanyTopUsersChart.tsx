import React from "react";

interface Props {
  data: { userName: string | null; totalActions: number | null }[];
}

const CompanyTopUsersChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600">No top user data available.</p>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-[#0989B1] mb-4">
        Top Users
      </h2>

      <ul className="space-y-3">
        {data.map((item, index) => {
          const name = item.userName?.trim() || "Unknown User";
          const count = typeof item.totalActions === "number" ? item.totalActions : 0;

          return (
            <li
              key={index}
              className="flex justify-between border-b pb-2"
            >
              <span>{name}</span>
              <span className="font-bold">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CompanyTopUsersChart;