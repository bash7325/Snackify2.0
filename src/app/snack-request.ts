// snack-request.ts
export interface SnackRequest {
  id?: number;
  user_id: number;
  snack: string;
  drink: string;
  misc: string;
  link?: string;
  ordered_flag: number; // Make sure this matches the backend's property name and type
  user_name: string;
  created_at?: string;  
  ordered_at?: string;  
}