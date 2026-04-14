import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIssues } from "../../hooks/useIssues";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";

const UpdateIssue: React.FC = () => {
  const { id } = useParams();
  const issueId = Number(id);
  const navigate = useNavigate();

  const rbac = useRBAC();

  const {
    currentIssue,
    fetchIssueById,
    updateIssue,
    loading,
    error,
    message,
    clearError,
    clearMessage,
  } = useIssues();

  const [form, setForm] = useState({
    title: "",
    issue: "",
    score: "",
    mitigation: "",
  });

  useEffect(() => {
    if (issueId) fetchIssueById(issueId);
  }, [issueId, fetchIssueById]);

  useEffect(() => {
    if (currentIssue) {
      setForm({
        title: currentIssue.title || "",
        issue: currentIssue.issue || "",
        score: String(currentIssue.score || ""),
        mitigation: currentIssue.mitigation || "",
      });
    }
  }, [currentIssue]);

  if (!rbac.canEditIssues) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have permission to edit issues.
      </div>
    );
  }

  if (!currentIssue) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading issue or you do not have permission to view it.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      issue: form.issue,
      score: Number(form.score),
      mitigation: form.mitigation,
    };

    const updated = await updateIssue(issueId, payload);

    if (updated) {
      navigate(`/issues/${issueId}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Page Header */}
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6 text-center">
        Edit Issue
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

          {/* Title */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
          </div>

          {/* Issue Description */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Issue Description
            </label>
            <textarea
              name="issue"
              value={form.issue}
              onChange={handleChange}
              required
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] min-h-[120px] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
          </div>

          {/* Score */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Score
            </label>
            <input
              type="number"
              name="score"
              value={form.score}
              onChange={handleChange}
              required
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
          </div>

          {/* Mitigation */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Mitigation
            </label>
            <textarea
              name="mitigation"
              value={form.mitigation}
              onChange={handleChange}
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] min-h-[100px] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0989B1] hover:bg-[#066A6F] text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition w-full"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateIssue;