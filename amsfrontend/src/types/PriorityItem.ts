export interface PriorityItem {
  id: number;
  assetId: number;
  code: string;
  title: string;
  issue: string;
  score: number;
  mitigation: string | null;
  status: string;
  asset?: {
    id: number;
    structure_name: string | null;
    location: string | null;
  };
}