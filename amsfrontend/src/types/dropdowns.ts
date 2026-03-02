export interface DropdownOptions {
  structure_type?: string[];
  spans?: string[];
  carries?: string[];
  material_type?: string[];
  work_item?: string[];
  possible_consequence?: string[];
  current_likelihood?: string[];
  current_severity?: string[];
  current_rating?: string[];
  mitigation_likelihood?: string[];
  mitigation_severity?: string[];
  mitigation_rating?: string[];
  status?: string[];
  detailed_exam_years?: string[];
  [key: string]: string[] | undefined;
}