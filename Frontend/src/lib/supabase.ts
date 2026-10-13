import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  g_force: number;
  device_id: string;
  detected_at: string;
  created_at: string;
  address?: string;
  notes?: string;
}

export interface Device {
  id: string;
  device_id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_seen: string;
  created_at: string;
}
