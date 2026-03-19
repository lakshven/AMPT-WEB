export interface ColumnDefinition {
  key: string;
  label: string;
  type?: "dropdown" | "date" | "file" | string;
  // ⭐ NEW — filter type for each column
  filterType?: "text" | "dropdown" | "dateRange" | "none";
  headerClass?: string;
  cellClass?: string;
}

export const columns: ColumnDefinition[] = [
  // ⭐ NEW — ELR column at the start
  { key: "elr", label: "ELR", filterType: "text" },
  { key: "structure_no", label: "Structure No", filterType: "text" },
  { key: "mileage", label: "Mileage", filterType: "text" },
  { key: "structure_type", label: "Structure Type", type: "dropdown", filterType: "dropdown" },
  { key: "spans", label: "Spans", type: "dropdown", filterType: "dropdown" },
  { key: "structure_name", label: "Structure Name", filterType: "text" },
  { key: "location", label: "Location \n(latitude, longitude)", filterType: "text" , headerClass: "whitespace-pre-line"},
  { key: "carries", label: "Carries", type: "dropdown", filterType: "dropdown" },
  { key: "material_type", label: "Material Type", type: "dropdown", filterType: "dropdown" },
  { key: "work_item", label: "Work Item", type: "dropdown", filterType: "dropdown" },
  { key: "possible_consequence", label: "Possible Consequence", type: "dropdown", filterType: "dropdown" },
  { key: "current_likelihood", label: "CL", type: "dropdown", filterType: "dropdown" },
  { key: "current_severity", label: "CS", type: "dropdown", filterType: "dropdown" },
  { key: "current_rating", label: "CR", type: "dropdown", filterType: "dropdown" },
  { key: "current_date_logged", label: "Log Date", type: "date", filterType: "dateRange" },
  { key: "risk_mitigation_proposals", label: "Risk Mitigation Proposals", filterType: "text" },
  { key: "mitigation_likelihood", label: "ML", type: "dropdown", filterType: "dropdown" },
  { key: "mitigation_severity", label: "MS", type: "dropdown", filterType: "dropdown" },
  { key: "mitigation_rating", label: "MR", type: "dropdown", filterType: "dropdown" },
  { key: "mitigation_completion", label: "Completion", type: "date", filterType: "dateRange" },
  { key: "status", label: "Status", type: "dropdown", filterType: "dropdown" },
  { key: "detailed_exam_years", label: "Exam Years", type: "dropdown", filterType: "dropdown" },
  { key: "last_exam", label: "Last Exam", type: "date", filterType: "dateRange" },
  { key: "next_exam", label: "Next Exam", type: "date", filterType: "dateRange" },
   // ⭐ NEW — replacing exam_report
  { key: "visual_report", label: "Visual Report", type: "file", filterType: "none" },
  { key: "detailed_report", label: "Detailed Report", type: "file", filterType: "none" },
  { key: "assessment", label: "Assessment", type: "file", filterType: "none" },
  { key: "records", label: "Records", type: "file", filterType: "none" }
];
