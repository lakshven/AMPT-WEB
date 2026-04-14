import React from "react";
import PermissionGate from "../auth/PermissionGate";

export const ReportsPage: React.FC = () => {
  return (
    <div>
      <h1>Reports</h1>

      <PermissionGate permission="VIEW_REPORTS">
        <div>Report list...</div>
      </PermissionGate>

      <PermissionGate permission="EDIT_REPORTS">
        <button>Edit selected report</button>
      </PermissionGate>

      <PermissionGate permission="DELETE_REPORTS">
        <button>Delete selected report</button>
      </PermissionGate>
    </div>
  );
};