import React, { useState, useMemo } from "react";
import WorkItemRow from "./WorkItemRow";

interface WorkItemTableProps {
  workItems: any[];
  onEdit: (wi: any) => void;
  onDelete: (id: number | string) => void;
  onRestore: (id: number | string) => void;
  onPermanentDelete: (id: number | string) => void;
  isAdmin: boolean;
  isAssetManager: boolean;
  isEditor: boolean;
}

const WorkItemTable: React.FC<WorkItemTableProps> = ({
  workItems,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  isAdmin,
  isAssetManager,
  isEditor, 
}) => {
  const [sortBy, setSortBy] = useState<string>("current_rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const visibleItems = useMemo(() => {
    return showDeleted
      ? workItems.filter((wi) => wi.isDeleted === true)
      : workItems.filter((wi) => wi.isDeleted === false);
  }, [workItems, showDeleted]);

  const sortedItems = useMemo(() => {
    let items = [...visibleItems];

    items.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [visibleItems, sortBy, sortOrder]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((wi) => {
      const matchesStatus =
        statusFilter === "" || wi.status === statusFilter;

      const matchesSearch =
        searchFilter === "" ||
        wi.work_item.toLowerCase().includes(searchFilter.toLowerCase()) ||
        wi.possible_consequence
          .toLowerCase()
          .includes(searchFilter.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [sortedItems, statusFilter, searchFilter]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  if (!workItems || workItems.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic px-3 py-2">
        No work items found.
      </div>
    );
  }

  return (
    <div className="mt-3">

      {/* FILTER BAR */}
      <div className="flex gap-3 mb-2 items-center min-w-[1600px]">

        <input
          type="text"
          placeholder="Search work items..."
          className="border p-1 rounded"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />

        <select
          className="border p-1 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Mitigated">Mitigated</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>

        <label className="flex items-center gap-2 text-sm ml-auto">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => {
              setShowDeleted(e.target.checked);
              setPage(1);
            }}
          />
          Show Deleted Work Items
        </label>
      </div>

      {/* ⭐ SCROLL WRAPPER ADDED */}
      <div className="overflow-x-auto w-full">
        <table className="border-collapse border border-gray-300 shadow-sm min-w-[1600px]">
          <thead>
            <tr>
              <th style={{ width: 250 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("work_item")}>
                Work Item {sortBy === "work_item" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 250 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("possible_consequence")}>
                Possible Consequence {sortBy === "possible_consequence" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("current_likelihood")}>
                CL {sortBy === "current_likelihood" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("current_severity")}>
                CS {sortBy === "current_severity" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("current_rating")}>
                CR {sortBy === "current_rating" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 150 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("current_date_logged")}>
                Log Date {sortBy === "current_date_logged" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              
              <th style={{ width: 260 }}   className="p-2 border bg-[#0989B1] text-white cursor-pointer"
               onClick={() => handleSort("risk_mitigation_proposals")}
              >  Risk Mitigation Proposals {sortBy === "risk_mitigation_proposals" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("mitigation_likelihood")}>
                ML {sortBy === "mitigation_likelihood" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("mitigation_severity")}>
                MS {sortBy === "mitigation_severity" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 80 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("mitigation_rating")}>
                MR {sortBy === "mitigation_rating" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 150 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("mitigation_completion")}>
                Completion {sortBy === "mitigation_completion" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 120 }} className="p-2 border bg-[#0989B1] text-white cursor-pointer" onClick={() => handleSort("status")}>
                Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>

              <th style={{ width: 120 }} className="p-2 border bg-[#0989B1] text-white text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.map((wi) => (
              <WorkItemRow
                key={wi.id}
                workItem={wi}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
                isAdmin={isAdmin}
                isAssetManager={isAssetManager}
                isEditor={isEditor} 
             />
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4 text-sm min-w-[1600px]">
      <button
       disabled={page === 1}
       onClick={() => setPage(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
       >
        Previous
       </button>

      <span>
        Page {page} of {Math.max(1, totalPages)}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
       Next
     </button>
   </div>
 </div>
 );
};

export default WorkItemTable;
