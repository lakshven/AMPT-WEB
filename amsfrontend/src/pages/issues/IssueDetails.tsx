import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useIssues } from "../../hooks/useIssues";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";

const IssueDetails: React.FC = () => {
  const { id } = useParams();
  const issueId = Number(id);

  const {
    currentIssue,
    fetchIssueById,
    loading,
    error,
    message,
    clearError,
    clearMessage,
  } = useIssues();

  const rbac = useRBAC();

  useEffect(() => {
    if (issueId) fetchIssueById(issueId);
  }, [issueId, fetchIssueById]);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading issue...</p>;
  }

  if (!currentIssue) {
    return (
      <div className="p-6 text-center text-gray-600">
        Issue not found or you do not have permission to view it.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Page Header */}
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6 text-center">
        Issue Details
      </h2>

      {/* Messages */}
      {message && (
        <MessageBanner type="success" text={message} onClose={clearMessage} />
      )}
      {error && (
        <MessageBanner type="error" text={error} onClose={clearError} />
      )}

      {/* Details Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#E2E8F0]">

        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">ID:</strong> {currentIssue.id}
        </p>

        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Asset ID:</strong> {currentIssue.assetId}
        </p>

        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Title:</strong> {currentIssue.title}
        </p>

        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Description:</strong> {currentIssue.issue}
        </p>

        <p className="mb-3 text-[#333]">
          <strong className="text-[#0989B1]">Score:</strong> {currentIssue.score}
        </p>

        <p className="mb-3 text-[#333] capitalize">
          <strong className="text-[#0989B1]">Status:</strong> {currentIssue.status}
        </p>

        {currentIssue.assignedTo && (
          <p className="mb-3 text-[#333]">
            <strong className="text-[#0989B1]">Assigned To:</strong> {currentIssue.assignedTo}
          </p>
        )}

        {currentIssue.completedAt && (
          <p className="mb-3 text-[#333]">
            <strong className="text-[#0989B1]">Completed At:</strong> {currentIssue.completedAt}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-4">

        <Link
          to="/issues"
          className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          Back to List
        </Link>

        {rbac.canEditIssues && (
          <Link
            to={`/issues/${issueId}/edit`}
            className="bg-[#0989B1] hover:bg-[#066A6F] text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Edit
          </Link>
        )}

        {rbac.canAssignIssues && (
          <Link
            to={`/issues/${issueId}/assign`}
            className="bg-[#549E39] hover:bg-[#3E7A2C] text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Assign
          </Link>
        )}

        {rbac.canCompleteIssues && (
          <Link
            to={`/issues/${issueId}/complete`}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Complete
          </Link>
        )}

        {rbac.canDeleteIssues && (
          <Link
            to={`/issues/${issueId}/delete`}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Delete
          </Link>
        )}
      </div>
    </div>
  );
};

export default IssueDetails;