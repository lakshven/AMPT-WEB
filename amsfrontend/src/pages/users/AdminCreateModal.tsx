import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminCreateModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/admin/create-admin", form);

      onSuccess(); // refresh user list
      onClose();   // close modal
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

        <h2 className="text-xl font-bold mb-4 text-[#066A6F]">
          Create App Admin
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            name="firstname"
            placeholder="First Name"
            value={form.firstname}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="lastname"
            placeholder="Last Name"
            value={form.lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded text-white shadow
                       bg-[#0989B1] hover:bg-[#066A6F]
                       disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateModal;