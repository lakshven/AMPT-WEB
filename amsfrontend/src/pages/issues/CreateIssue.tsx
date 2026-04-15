import React, { useState, useEffect } from "react";
import { useIssues } from "../../hooks/useIssues";
import { useRBAC } from "../../hooks/useRBAC";
import MessageBanner from "../../components/common/MessageBanner";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const CreateIssue: React.FC = () => {
  const navigate = useNavigate();
  const rbac = useRBAC();

  const {
    createIssue,
    loading,
    error,
    message,
    clearError,
    clearMessage,
  } = useIssues();

  const [form, setForm] = useState({
    assetId: "",
    title: "",
    issue: "",
    score: "",
    mitigation: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [assets, setAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axiosInstance.get("/assets");
        const data = await res.data;

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.assets)
            ? data.assets
            : Array.isArray(data.data)
            ? data.data
            : [];

        setAssets(list);
      } catch (err) {
        console.error("Failed to load assets", err);
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  if (!rbac.canAddIssues) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have permission to create issues.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!form.assetId) errors.assetId = "Asset is required.";
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.issue.trim()) errors.issue = "Issue description is required.";
    if (!form.score) errors.score = "Score is required.";
    else if (Number(form.score) < 0 || Number(form.score) > 100)
      errors.score = "Score must be between 0 and 100.";

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload = {
      assetId: Number(form.assetId),
      title: form.title,
      issue: form.issue,
      score: Number(form.score),
      mitigation: form.mitigation,
    };

    const created = await createIssue(payload);

    if (created) {
      navigate("/issues");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Page Header */}
      <h2 className="text-2xl font-bold text-[#0989B1] border-b-4 border-[#549E39] pb-2 mb-6 text-center">
        Create Issue
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

          {/* Asset Dropdown */}
          <div>
            <label className="block font-semibold text-[#0989B1] mb-1">
              Select Asset
            </label>

            <select
              name="assetId"
              value={form.assetId}
              onChange={handleChange}
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-white focus:ring-2 focus:ring-[#0989B1] outline-none"
            >
              <option value="">Select an Asset</option>

              {loadingAssets && <option>Loading assets...</option>}

              {!loadingAssets &&
                Array.isArray(assets) &&
                assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.structure_name ||
                      asset.structure_no ||
                      `Asset ${asset.id}`}{" "}
                    {asset.location ? `— ${asset.location}` : ""}
                  </option>
                ))}
            </select>

            {formErrors.assetId && (
              <p className="text-red-600 text-sm mt-1">{formErrors.assetId}</p>
            )}
          </div>

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
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
            {formErrors.title && (
              <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
            )}
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
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] min-h-[120px] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
            {formErrors.issue && (
              <p className="text-red-600 text-sm mt-1">{formErrors.issue}</p>
            )}
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
              className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
            />
            {formErrors.score && (
              <p className="text-red-600 text-sm mt-1">{formErrors.score}</p>
            )}
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
            {loading ? "Creating..." : "Create Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;