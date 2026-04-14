import React from "react";

interface Props {
  users: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const UserTable: React.FC<Props> = ({
  users,
  onEdit,
  onDelete,
  onRestore,
  canEdit,
  canDelete
}) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden border border-[#E2E8F0]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#0989B1] text-white border-b-4 border-[#549E39]">
            <th className="p-3 border border-[#E2E8F0] font-semibold text-left">Name</th>
            <th className="p-3 border border-[#E2E8F0] text-left">Email</th>
            <th className="p-3 border border-[#E2E8F0] text-left">Role</th>
            <th className="p-3 border border-[#E2E8F0] text-left">Status</th>
            <th className="p-3 border border-[#E2E8F0] text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => {
            const isDisabled = u.disabled === true;

            return (
              <tr
                key={u.id}
                className={
                  isDisabled
                    ? "bg-[#F5F5F5] text-gray-500"
                    : "hover:bg-[#E6F4F7] transition-colors"
                }
              >
                <td className="p-3 border border-[#E2E8F0] text-[#333]">
                  {u.firstname} {u.lastname}
                </td>

                <td className="p-3 border border-[#E2E8F0] text-[#333]">
                  {u.email}
                </td>

                <td className="p-3 border border-[#E2E8F0] capitalize text-[#333]">
                  {u.role}
                </td>

                <td className="p-3 border border-[#E2E8F0]">
                  {isDisabled ? (
                    <span className="text-red-600 font-semibold">Disabled</span>
                  ) : (
                    <span className="text-green-700 font-semibold">Active</span>
                  )}
                </td>

                <td className="p-3 border border-[#E2E8F0]">
                  {canEdit && !isDisabled && (
                    <button
                      className="text-[#0989B1] font-medium mr-4 hover:underline"
                      onClick={() => onEdit(u.id)}
                    >
                      Edit
                    </button>
                  )}

                  {canDelete && !isDisabled && (
                    <button
                      className="text-red-600 font-medium mr-4 hover:underline"
                      onClick={() => onDelete(u.id)}
                    >
                      Disable
                    </button>
                  )}

                  {canDelete && isDisabled && (
                    <button
                      className="text-[#549E39] font-medium hover:underline"
                      onClick={() => onRestore(u.id)}
                    >
                      Restore
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;