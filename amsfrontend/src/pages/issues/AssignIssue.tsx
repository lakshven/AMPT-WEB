import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssues } from "../../hooks/useIssues";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";
import IssueService from "../../services/issueService";

const AssignIssue: React.FC = () => {
  const { id } = useParams();
  const issueId = Number(id);
  const navigate = useNavigate();

  const rbac = useRBAC();

  const {
    currentIssue,
    fetchIssueById,
    assignIssue,
    loading,
    error,
    message,
    clearError,
    clearMessage,
  } = useIssues();

  const [users, setUsers] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (issueId) fetchIssueById(issueId);
  }, [issueId, fetchIssueById]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await IssueService.getAssignableUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    loadUsers();
  }, []);

  if (!rbac.canAssignIssues) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have permission to assign issues.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await assignIssue(issueId, Number(assignedTo));
    if (updated) navigate(`/issues/${issueId}`);
  };

  if (!currentIssue) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading issue or you do not have permission to view it.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">

      {/* Page Header */}
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6 text-center">
        Assign Issue
      </h2>

      {/* Messages */}
      {message && (
        <MessageBanner type="success" text={message} onClose={clearMessage} />
      )}
      {error && (
        <MessageBanner type="error" text={error} onClose={clearError} />
      )}

      {/* Card Container */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E2E8F0]">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Assign To */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Assign To
            </label>

            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-white focus:ring-2 focus:ring-[#0989B1] outline-none"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstname} {u.lastname} — {u.role} — {u.clientGroup?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0989B1] hover:bg-[#066A6F] text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition w-full"
          >
            {loading ? "Assigning..." : "Assign Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignIssue;