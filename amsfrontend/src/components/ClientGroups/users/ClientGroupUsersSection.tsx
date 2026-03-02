import React, { useState } from "react";
import GroupUsersList from "./GroupUserList";
import AssignUserModal from "./AssignUserModal";
import MoveUserModal from "./MoveUserModal";

interface ClientGroupUsersSectionProps {
  clientGroupId: number;
}

export default function ClientGroupUsersSection({
  clientGroupId,
}: ClientGroupUsersSectionProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // This function will be passed to GroupUsersList
  const handleMoveUser = (user: any) => {
    setSelectedUser(user);
    setMoveModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* User List */}
      <GroupUsersList
        clientGroupId={clientGroupId}
      />

      {/* Assign User Modal */}
      <AssignUserModal
        clientGroupId={clientGroupId}
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={() => {}}
      />

      {/* Move User Modal */}
      <MoveUserModal
        user={selectedUser}
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        onMoved={() => {}}
      />
    </div>
  );
}