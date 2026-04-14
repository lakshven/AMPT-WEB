export interface PriorityItem {
  id: number;
  assetId: number;

  code: string;
  title: string;
  asset?: {
    id: number;
    structure_name: string | null;
    location: string | null;
  };
  issue: string;
  consequence: string;
  score: number;
  status: string;
}
