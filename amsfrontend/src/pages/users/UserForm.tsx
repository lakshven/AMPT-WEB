import React, { useState } from "react";

interface Props {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const UserForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [firstname, setFirstname] = useState(initialData?.firstname || "");
  const [lastname, setLastname] = useState(initialData?.lastname || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(initialData?.role || "viewer");
  const [clientGroupId, setClientGroupId] = useState(initialData?.clientGroupId || "");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      firstname,
      lastname,
      username,
      email,
      role,
      clientGroupId: Number(clientGroupId)
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
    >
      {/* First Name */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">First Name</label>
        <input
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">Last Name</label>
        <input
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        />
      </div>

      {/* Username */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">Username</label>
        <input
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">Email</label>
        <input
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Role */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">Role</label>
        <select
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-white focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="company_admin">Company Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
          <option value="single_user">Single User</option>
        </select>
      </div>

      {/* Client Group ID */}
      <div>
        <label className="block font-semibold text-[#0989B1] mb-1">Client Group ID</label>
        <input
          type="number"
          className="p-3 border border-[#E2E8F0] rounded-lg w-full bg-[#E6F4F7] focus:ring-2 focus:ring-[#0989B1] outline-none"
          value={clientGroupId}
          onChange={(e) => setClientGroupId(e.target.value)}
        />
      </div>

      {/* Submit Button (full width on mobile, right aligned on desktop) */}
      <div className="md:col-span-2 flex justify-end">
        <button
          className="bg-[#0989B1] hover:bg-[#066A6F] text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default UserForm;