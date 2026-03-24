export interface ColumnDefinition {
  key: string;
  label: string;
  type?: "dropdown" | "date" | "file" | string;
  filterType?: "text" | "dropdown" | "dateRange" | "none";
  headerClass?: string;
  cellClass?: string;
}

export const columns: ColumnDefinition[] = [
  { key: "elr", label: "ELR", filterType: "text", headerClass: "w-[120px]", cellClass: "w-[60px]" },
  { key: "structure_no", label: "Structure No", filterType: "text", headerClass: "w-[120px]", cellClass: "w-[60px]" },
  { key: "mileage", label: "Mileage", filterType: "text", headerClass: "w-[120px]", cellClass: "w-[60px]" },

  // ⭐ Wider dropdowns
  { key: "structure_type", label: "Structure Type", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },
  { key: "spans", label: "Spans", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },

  { key: "structure_name", label: "Structure Name", filterType: "text", headerClass: "w-[150px]", cellClass: "w-[200px]" },

  { key: "location", label: "Location \n(latitude, longitude)", filterType: "text", headerClass: "whitespace-pre-line w-[180px]" },

  { key: "carries", label: "Carries", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },
  { key: "over", label: "Over", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },
  { key: "material_type", label: "Material Type", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },

  { key: "work_item", label: "Work Item", filterType: "text", headerClass: "w-[120px]", cellClass: "w-[150px]" },
  { key: "possible_consequence", label: "Possible Consequence", filterType: "text", headerClass: "w-[150px]"},

  // ⭐ Risk scoring dropdowns (wider)
  { key: "current_likelihood", label: "CL", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },
  { key: "current_severity", label: "CS", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },
  { key: "current_rating", label: "CR", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },

  { key: "current_date_logged", label: "Log Date", type: "date", filterType: "dateRange", headerClass: "w-[320px]", cellClass: "w-[250px]" },

  { key: "risk_mitigation_proposals", label: "Risk Mitigation Proposals", filterType: "text",  headerClass: "w-[150px]", cellClass: "w-[100px]" },

  { key: "mitigation_likelihood", label: "ML", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },
  { key: "mitigation_severity", label: "MS", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },
  { key: "mitigation_rating", label: "MR", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },

  { key: "mitigation_completion", label: "Completion", type: "date", filterType: "dateRange", headerClass: "w-[320px]", cellClass: "w-[250px]" },

  { key: "status", label: "Status", type: "dropdown", filterType: "dropdown", headerClass: "w-[100px]", cellClass: "w-[60px]" },

  { key: "detailed_exam_years", label: "Exam Years", type: "dropdown", filterType: "dropdown", headerClass: "w-[80px]", cellClass: "w-[60px]" },

  { key: "last_exam", label: "Last Exam", type: "date", filterType: "dateRange", headerClass: "w-[320px]", cellClass: "w-[250px]" },
  { key: "next_exam", label: "Next Exam", type: "date", filterType: "dateRange", headerClass: "w-[320px]", cellClass: "w-[250px]" },

  { key: "visual_report", label: "Visual Report", type: "file", filterType: "none",  headerClass: "w-[250px] whitespace-nowrap", cellClass: "w-[230px]" },
  { key: "detailed_report", label: "Detailed Report", type: "file", filterType: "none", headerClass: "w-[250px] whitespace-nowrap", cellClass: "w-[230px]"  },
  { key: "assessment", label: "Assessment", type: "file", filterType: "none", headerClass: "w-[250px] whitespace-nowrap", cellClass: "w-[230px]"},
  { key: "records", label: "Records", type: "file", filterType: "none" , headerClass: "w-[250px] whitespace-nowrap", cellClass: "w-[230px]"}
];
