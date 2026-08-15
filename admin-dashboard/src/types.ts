export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

export interface Analytics {
  total_users: number;
  active_users_today: number;
  attendance_today: { auto_marked: number; manual_marked: number; total: number };
  ocr_accuracy_percent: number | null;
  geo_tracking_health_percent: number | null;
  average_attendance_percent: number | null;
  total_geofences: number;
}

export interface AttendanceLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  subject_id: string;
  subject_name: string;
  timestamp: string;
  marking_method: 'manual' | 'automatic';
  latitude: number | null;
  longitude: number | null;
  room_number: string | null;
}

export interface GeofenceEntry {
  id: string;
  room_number: string | null;
  building: string | null;
  subject_name: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  usage_count: number;
  last_used: string | null;
}

export interface OcrStats {
  total_scans: number;
  successful_scans: number;
  accuracy_percent: number | null;
  common_misclassifications: { misclassified_as: string; actual_type: string; count: number }[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
  subjects_count: number;
  attendance_percent: number | null;
  last_activity: string | null;
}
