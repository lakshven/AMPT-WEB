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
  risk_mitigation_proposals: string;
  score: number;
  status: string;
}
