import React, { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import ClientGroupForm from "./ClientGroupForm";
import { useAuth } from "../../../context/AuthContext";

interface ClientGroupCreateFormProps {
  onCreated: () => void;
}

export default function ClientGroupCreateForm({ onCreated }: ClientGroupCreateFormProps) {
  const { role, companyId } = useAuth();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateSecureCode = () => {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    setAccessCode(`${part()}-${part()}-${part()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) return setError("Client group name is required");
    if (!accessCode.trim()) return setError("Access code is required");

    try {
      setLoading(true);

      const payload: any = {
        name: name.trim(),
        department: department.trim() || null,
        accessCode: accessCode.trim(),
      };

      // ⭐ Only send companyId for company_admin
      if (role === "company_admin") {
        payload.companyId = companyId;
      }

      const res = await axiosInstance.post("/client-groups", payload);

      if (res.data.success) {
        setSuccess("Client group created successfully");
        setName("");
        setDepartment("");
        setAccessCode("");
        onCreated();
      } else {
        setError(res.data.message || "Failed to create client group");
      }
    } catch {
      setError("Server error while creating client group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Create Client Group</h3>

      <ClientGroupForm
        name={name}
        department={department}
        setName={setName}
        setDepartment={setDepartment}
        error={error}
      />

      <div>
        <label className="text-sm font-medium">Access Code</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
            placeholder="Type or generate access code"
          />
          <button
            type="button"
            onClick={generateSecureCode}
            className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Generate
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Client Group"}
      </button>

      {success && <p className="text-green-600 text-sm">{success}</p>}
    </form>
  );
}