import { useState } from "react";
import GroupUsersList from "./GroupUserList";
import AssignUserModal from "./AssignUserModal";

interface ClientGroupUsersSectionProps {
  clientGroupId: number;
}

export default function ClientGroupUsersSection({
  clientGroupId,
}: ClientGroupUsersSectionProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  return (
    <div className="space-y-4">

      {/* Assign User Button */}
      <button
        onClick={() => setAssignModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Assign User
      </button>

      {/* User List */}
      <GroupUsersList clientGroupId={clientGroupId} />

      {/* Assign User Modal */}
      <AssignUserModal
        clientGroupId={clientGroupId}
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={() => {}}
      />
    </div>
  );
}
