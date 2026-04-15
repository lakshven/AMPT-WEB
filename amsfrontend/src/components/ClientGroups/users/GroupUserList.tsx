import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import AssignUserModal from "./AssignUserModal";
import MoveUserModal from "./MoveUserModal";

interface GroupUsersListProps {
  clientGroupId: number;
}

export default function GroupUsersList({ clientGroupId }: GroupUsersListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ Search
  const [search, setSearch] = useState("");

  // ⭐ Sorting
  const [sort, setSort] = useState("firstname");
  const [order, setOrder] = useState("asc");

  // ⭐ Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [clientGroupId, page, search, sort, order]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/client-groups/${clientGroupId}/users`,
        {
          params: { page, limit, search, sort, order },
        }
      );

      setUsers(res.data.users || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch group users", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(userId: number) {
    try {
      await axiosInstance.post("/client-groups/remove-user", { userId });
      fetchUsers();
    } catch (err) {
      console.error("Failed to remove user", err);
    }
  }

  function openMoveModal(user: any) {
    setSelectedUser(user);
    setMoveModalOpen(true);
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Users in this Group</h3>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setAssignModalOpen(true)}
        >
          Assign User
        </button>
      </div>

      {/* Search + Sorting */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border p-2 rounded"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="firstname">Sort by First Name</option>
          <option value="lastname">Sort by Last Name</option>
          <option value="email">Sort by Email</option>
          <option value="role">Sort by Role</option>
        </select>

        <select
          className="border p-2 rounded"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users assigned to this group.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">
                  {u.firstname} {u.lastname}
                </td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    className="px-3 py-1 bg-yellow-600 text-white rounded"
                    onClick={() => openMoveModal(u)}
                  >
                    Move
                  </button>

                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    onClick={() => removeUser(u.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="px-3 py-1 bg-gray-300 rounded"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          className="px-3 py-1 bg-gray-300 rounded"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <AssignUserModal
        clientGroupId={clientGroupId}
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={fetchUsers}
      />

      <MoveUserModal
        user={selectedUser}
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        onMoved={fetchUsers}
      />
    </div>
  );
}