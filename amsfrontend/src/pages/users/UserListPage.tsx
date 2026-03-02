import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, restoreUser } from "../../services/userService";
import { useNavigate, Link } from "react-router-dom";
import UserTable from "./UserTable";
import { useRBAC } from "../../hooks/useRBAC";
import AdminCreateModal from "./AdminCreateModal"; // ⭐ You will create this small modal

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false); // ⭐ NEW

  const navigate = useNavigate();
  const rbac = useRBAC();

  const loadUsers = () => {
    getUsers({
      page,
      pageSize,
      search,
      roleFilter,
      status: statusFilter
    })
      .then((res) => {
        setUsers(res.data.data);
        setTotal(res.data.pagination.total);
      })
      .catch(() => setError("Failed to load users"));
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Disable this user?")) return;

    deleteUser(id)
      .then(() => loadUsers())
      .catch(() => setError("Failed to disable user"));
  };

  const handleRestore = (id: string) => {
    if (!window.confirm("Restore this user?")) return;

    restoreUser(id)
      .then(() => loadUsers())
      .catch(() => setError("Failed to restore user"));
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#0989B1] border-b-4 border-[#549E39] pb-2 tracking-wide">Users</h2>
     <div className="flex justify-end gap-3 mb-6">
      {rbac.canManageUsers && (
          <Link
            to="/users/create"
            className="px-4 py-2 rounded shadow text-white 
                   bg-[#549E39] hover:bg-[#3E7A2C] transition"
          >
            + Add User
          </Link>
      )}
      {/* Add Admin (ONLY app_admin) */}
        {rbac.isAppAdmin && (
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="px-4 py-2 rounded shadow text-white 
                   bg-[#0989B1] hover:bg-[#066A6F] transition"
          >
            + Add Admin
          </button>
        )}

      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="p-2 border border-[#549E39] rounded w-full sm:w-1/3 focus:ring-2 focus:ring-[#0989B1] bg-[#E6F4F7]"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          className="p-2 border border-[#549E39] rounded  focus:ring-2 focus:ring-[#0989B1] bg-[#E6F4F7]"
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value);
          }}
        >
          <option value="">All Roles</option>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="company_admin">Company Admin</option>
          <option value="app_admin">App Admin</option>
        </select>

        <select
          className="p-2 border border-[#549E39] rounded focus:ring-2 focus:ring-[#0989B1] bg-[#E6F4F7]"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="active">Active Users</option>
          <option value="disabled">Disabled Users</option>
          <option value="all">All Users</option>
        </select>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        onEdit={(id) => navigate(`/users/${id}/edit`)}
        onDelete={handleDelete}
        onRestore={handleRestore}
        canEdit={rbac.canManageUsers}
        canDelete={rbac.canManageUsers}
      />

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-[#E6F4F7] border border-[#549E39] rounded disabled:opacity-50 hover:bg-[#D4EBEE]"
        >
          Prev
        </button>

        <span className="px-4 py-2 font-medium text-[#0989B1]">
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-[#E6F4F7] border border-[#549E39] rounded disabled:opacity-50 hover:bg-[#D4EBEE]"
        >
          Next
        </button>
      </div>
       {/* ⭐ Add Admin Modal */}
      {showCreateAdmin && (
        <AdminCreateModal
          onClose={() => setShowCreateAdmin(false)}
          onSuccess={loadUsers}
        />
      )}


    </div>
  );
};

export default UserListPage;