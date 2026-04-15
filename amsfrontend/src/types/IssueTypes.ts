export interface Issue {
  id: number;
  code: string;
  title: string;
  issue: string;
  score: number | null;
  mitigation: string | null;
  status: string;
  assignedTo: number | null;

  assignedUser?: {
    id: number;
    firstname: string;
    lastname: string;
  } | null;

  completedUser?: {
    id: number;
    firstname: string;
    lastname: string;
  } | null;

  asset?: {
    id: number;
    structure_name: string | null;
    location: string | null;
  } | null;
}