import React from "react";
import EditClientGroupModal from "./EditClientGroupModal";
import DeleteClientGroupModal from "./DeleteClientGroupModal";
import RestoreClientGroupModal from "./RestoreClientGroupModal";

interface ClientGroup {
  id: number;
  name: string;
  department?: string | null;
  isDeleted?: boolean;
  accessCode: string;
  createdAt: string;
}

interface ClientGroupModalsProps {
  modalType: "edit" | "delete" | "restore" | null;
  selectedGroup: ClientGroup | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientGroupModals({
  modalType,
  selectedGroup,
  onClose,
  onSuccess,
}: ClientGroupModalsProps) {
  if (!modalType || !selectedGroup) return null;

  if (modalType === "edit") {
    return (
      <EditClientGroupModal
        group={selectedGroup}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (modalType === "delete") {
    return (
      <DeleteClientGroupModal
        group={selectedGroup}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (modalType === "restore") {
    return (
      <RestoreClientGroupModal
        group={selectedGroup}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return null;
}