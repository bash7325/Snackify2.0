// snack-request.ts
export interface SnackRequest {
  id?: number;
  user_id: number;
  snack?: string;
  drink?: string;
  misc?: string;
  link?: string;
  ordered_flag?: number; // Make optional
  created_at?: string;
  ordered_at?: string;
  user_name?: string; // Make optional
}
