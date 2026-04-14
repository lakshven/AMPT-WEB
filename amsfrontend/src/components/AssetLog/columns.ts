export interface ColumnDefinition {
  key: string;
  label: string;
  width: number; // NEW
  type?: "dropdown" | "date" | "file" | "statusDropdown" | string;
  filterType?: "text" | "dropdown" | "dateRange" | "none";
  headerClass?: string;
  cellClass?: string;
}

//  1️⃣ ASSET COLUMNS
export const assetColumns: ColumnDefinition[] = [
  { key: "elr", label: "ELR", width: 120, filterType: "text" },
  { key: "structure_no", label: "Structure No", width: 120, filterType: "text" },
  { key: "mileage", label: "Mileage", width: 100, filterType: "text" },

  { key: "structure_type", label: "Structure Type", width: 140, type: "dropdown", filterType: "dropdown" },
  { key: "spans", label: "Spans", width: 100, type: "dropdown", filterType: "dropdown" },

  { key: "structure_name", label: "Structure Name", width: 180, filterType: "text" },

  { key: "location", label: "Location (lat, long)", width: 180, filterType: "text" },

  { key: "carries", label: "Carries", width: 120, type: "dropdown", filterType: "dropdown" },
  { key: "over", label: "Over", width: 120, type: "dropdown", filterType: "dropdown" },
  { key: "material_type", label: "Material Type", width: 140, type: "dropdown", filterType: "dropdown" },

  { key: "last_exam", label: "Last Exam", width: 150, type: "date", filterType: "dateRange" },
  { key: "next_exam", label: "Next Exam", width: 150, type: "date", filterType: "dateRange" },
];

//  2️⃣ WORK ITEM COLUMNS
export const workItemColumns: ColumnDefinition[] = [
  { key: "work_item", label: "Work Item", width: 260, filterType: "text" },
  { key: "possible_consequence", label: "Possible Consequence", width: 260, filterType: "text" },

  { key: "current_likelihood", label: "CL", width: 60, type: "dropdown", filterType: "dropdown" },
  { key: "current_severity", label: "CS", width: 60, type: "dropdown", filterType: "dropdown" },
  { key: "current_rating", label: "CR", width: 60, filterType: "none" },

  { key: "current_date_logged", label: "Log Date", width: 150, type: "date", filterType: "dateRange" },

  { key: "risk_mitigation_proposals", label: "Risk Mitigation Proposals", width: 260, filterType: "text" },

  { key: "mitigation_likelihood", label: "ML", width: 60, type: "dropdown", filterType: "dropdown" },
  { key: "mitigation_severity", label: "MS", width: 60, type: "dropdown", filterType: "dropdown" },
  { key: "mitigation_rating", label: "MR", width: 60, filterType: "none" },

  { key: "mitigation_completion", label: "Completion", width: 150, type: "date", filterType: "dateRange" },

  { key: "status", label: "Status", width: 100, type: "statusDropdown", filterType: "dropdown" },
];

//  3️⃣ FILE COLUMNS
export const fileColumns: ColumnDefinition[] = [
  { key: "visual_report", label: "Visual Report", width: 150, type: "file", filterType: "none" },
  { key: "detailed_report", label: "Detailed Report", width: 150, type: "file", filterType: "none" },
  { key: "assessment", label: "Assessment", width: 150, type: "file", filterType: "none" },
  { key: "records", label: "Records", width: 150, type: "file", filterType: "none" },
];
