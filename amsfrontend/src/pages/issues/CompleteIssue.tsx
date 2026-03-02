import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssues } from "../../hooks/useIssues";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";

const CompleteIssue: React.FC = () => {
  const { id } = useParams();
  const issueId = Number(id);
  const navigate = useNavigate();

  const rbac = useRBAC();

  const {
    currentIssue,
    fetchIssueById,
    completeIssue,
    loading,
    error,
    message,
    clearError,
    clearMessage,
  } = useIssues();

  useEffect(() => {
    if (issueId) fetchIssueById(issueId);
  }, [issueId, fetchIssueById]);

  if (!rbac.canCompleteIssues) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have permission to complete issues.
      </div>
    );
  }

  const handleComplete = async () => {
    const updated = await completeIssue(issueId);
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
        Complete Issue
      </h2>

      {/* Messages */}
      {message && (
        <MessageBanner type="success" text={message} onClose={clearMessage} />
      )}
      {error && (
        <MessageBanner type="error" text={error} onClose={clearError} />
      )}

      {/* Issue Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E2E8F0] mb-6">
        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">ID:</strong> {currentIssue.id}
        </p>
        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Title:</strong> {currentIssue.title}
        </p>
        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Status:</strong> {currentIssue.status}
        </p>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={loading}
        className="bg-[#0989B1] hover:bg-[#066A6F] text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition w-full"
      >
        {loading ? "Completing..." : "Mark as Completed"}
      </button>

      {/* Cancel Button */}
      <button
        onClick={() => navigate(`/issues/${issueId}`)}
        className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold w-full transition"
      >
        Cancel
      </button>
    </div>
  );
};

export default CompleteIssue;