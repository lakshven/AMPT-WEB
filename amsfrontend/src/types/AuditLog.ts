// src/types/AuditLog.ts

export interface AuditLog {
  id: number;
  action: string;
  targetType: string;
  targetId: number | null;
  performedBy: string;
  actorUserId: number | null;
  actor?: {
    id: number;
    username: string;
    role: string;
  } | null;
  clientGroupId: number | null;
  metadata: Record<string, any> | null;
  details: Record<string, any> | null;
  createdAt: string; // ISO string from backend
}