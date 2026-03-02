import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Issue } from "../../types/IssueTypes";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";
import IssueTable from "./IssueTable";
import { Link, useNavigate } from "react-router-dom";

const IssueListPage: React.FC = () => {
  const navigate = useNavigate();
  const rbac = useRBAC();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const [sortBy, setSortBy] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showDeleted, setShowDeleted] = useState(false);

  const fetchIssues = () => {
    setLoading(true);

    axiosInstance
      .get(`/issues?page=${page}&pageSize=${pageSize}&deleted=${showDeleted}`)
      .then((res) => {
        setIssues(res.data.items);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setError("Failed to load issues"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIssues();
  }, [page, showDeleted]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const restoreIssue = async (id: number) => {
    try {
      await axiosInstance.patch(`/issues/${id}/restore`);
      setMessage("Issue restored successfully");
      setTimeout(() => setMessage(""), 2000);
      fetchIssues();
    } catch (err) {
      setError("Failed to restore issue");
      setTimeout(() => setError(""), 2000);
    }
  };

  const processedIssues = issues
    .filter((i) => {
      const text = `${i.code} ${i.title} ${i.issue} ${i.asset?.location}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .filter((i) => {
      if (statusFilter === "all") return true;
      return i.status === statusFilter;
    })
    .filter((i) => {
      if (assignedFilter === "all") return true;
      if (assignedFilter === "assigned") return i.assignedTo !== null;
      if (assignedFilter === "unassigned") return i.assignedTo === null;
      return true;
    })
    .filter((i) => {
      if (scoreFilter === "all") return true;
      if (scoreFilter === "high") return (i.score ?? 0) >= 80;
      if (scoreFilter === "medium") return (i.score ?? 0) >= 50 && (i.score ?? 0) < 80;
      if (scoreFilter === "low") return (i.score ?? 0) < 50;
      return true;
    })
    .sort((a, b) => {
      const valA = (a as any)[sortBy];
      const valB = (b as any)[sortBy];

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6">

      {/* Page Header */}
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6 text-center">
        Issue List
      </h2>

      {message && (
        <MessageBanner type="success" text={message} onClose={() => setMessage("")} />
      )}
      {error && (
        <MessageBanner type="error" text={error} onClose={() => setError("")} />
      )}

      {/* Create Issue Button */}
      {rbac.canAddIssues && (
        <div className="mb-4 text-right">
          <Link
            to="/issues/create"
            className="bg-[#549E39] hover:bg-[#3E7A2C] text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition"
          >
            + Create Issue
          </Link>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-md p-5 border border-[#E2E8F0] mb-6">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 border border-[#E2E8F0] rounded-lg bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 border border-[#E2E8F0] rounded-lg bg-white focus:ring-2 focus:ring-[#0989B1]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="deleted">Deleted</option>
          </select>

          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="p-3 border border-[#E2E8F0] rounded-lg bg-white focus:ring-2 focus:ring-[#0989B1]"
          >
            <option value="all">All Assignments</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="p-3 border border-[#E2E8F0] rounded-lg bg-white focus:ring-2 focus:ring-[#0989B1]"
          >
            <option value="all">All Scores</option>
            <option value="high">High (≥ 80)</option>
            <option value="medium">Medium (50–79)</option>
            <option value="low">Low (&lt; 50)</option>
          </select>
        </div>

        {/* Show Deleted Toggle */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={() => setShowDeleted(!showDeleted)}
          />
          <span className="text-[#333]">Show deleted issues</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading issues...</p>
      ) : processedIssues.length === 0 ? (
        <p className="text-gray-600">No issues found</p>
      ) : (
        <IssueTable
          issues={processedIssues}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={(id) => navigate(`/issues/${id}`)}
          onEdit={(id) => navigate(`/issues/${id}/edit`)}
          onAssign={(id) => navigate(`/issues/${id}/assign`)}
          onComplete={(id) => navigate(`/issues/${id}/complete`)}
          onDelete={(id) => navigate(`/issues/${id}/delete`)}
          onRestore={restoreIssue}
          canEdit={rbac.canEditIssues}
          canAssign={rbac.canAssignIssues}
          canComplete={rbac.canCompleteIssues}
          canDelete={rbac.canDeleteIssues}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-5 py-2 bg-[#0989B1] text-white rounded-lg font-semibold shadow-sm transition disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="px-4 py-2 text-[#333]">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-5 py-2 bg-[#0989B1] text-white rounded-lg font-semibold shadow-sm transition disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default IssueListPage;