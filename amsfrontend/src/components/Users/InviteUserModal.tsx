// src/components/Users/InviteUserModal.tsx

import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function InviteUserModal({ groupId, onClose }) {
  const [role, setRole] = useState("viewer");
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const generateInvite = async () => {
    try {
      setLoading(true);
      setInviteLink("");
      setSent(false);

      const res = await axiosInstance.post("/client-groups/invite-token", {
        groupId,
        role,
        email: email.trim() || null,
      });

      if (res.data.success) {
        setInviteLink(res.data.inviteLink);
      }
    } catch (err) {
      console.error("Error generating invite:", err);
      alert("Failed to generate invite");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied");
  };

  const sendEmail = async () => {
    try {
      if (!email.trim()) {
        alert("Enter an email first");
        return;
      }

      const res = await axiosInstance.post("/client-groups/send-invite", {
        email,
        link: inviteLink,
      });

      if (res.data.success) {
        setSent(true);
      }
    } catch (err) {
      console.error("Error sending email:", err);
      alert("Failed to send email");
    }
  };

  return (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Invite User</h2>

      <label className="text-sm font-medium text-gray-700">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full mt-1 mb-3 border rounded-md px-3 py-2 text-sm"
      >
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
      </select>

      <label className="text-sm font-medium text-gray-700">Email (optional)</label>
      <input
        type="email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mt-1 mb-4 border rounded-md px-3 py-2 text-sm"
      />

      <button
        onClick={generateInvite}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {loading ? "Generating..." : "Generate Invite"}
      </button>

      {inviteLink && (
        <div className="mt-4">
          <div className="bg-gray-100 p-3 rounded-md text-sm break-all">
            {inviteLink}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={copyLink}
              className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800"
            >
              Copy Link
            </button>

            <button
              onClick={sendEmail}
              disabled={sent}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-green-400"
            >
              {sent ? "Email Sent" : "Send Email"}
            </button>
          </div>
        </div>
      )}

      <button
        className="w-full mt-5 text-gray-600 hover:text-gray-800 text-sm"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);
}