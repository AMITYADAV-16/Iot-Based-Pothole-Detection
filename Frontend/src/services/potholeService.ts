import { supabase, Pothole, Device } from '../lib/supabase';

export const potholeService = {
  async getPotholes(filters?: {
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    deviceId?: string;
  }): Promise<Pothole[]> {
    let query = supabase
      .from('potholes')
      .select('*')
      .order('detected_at', { ascending: false });

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.startDate) {
      query = query.gte('detected_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('detected_at', filters.endDate.toISOString());
    }

    if (filters?.deviceId) {
      query = query.eq('device_id', filters.deviceId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getPotholeById(id: string): Promise<Pothole | null> {
    const { data, error } = await supabase
      .from('potholes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPothole(pothole: Omit<Pothole, 'id' | 'created_at'>): Promise<Pothole> {
    const { data, error } = await supabase
      .from('potholes')
      .insert([pothole])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStatistics() {
    const { data: potholes, error } = await supabase
      .from('potholes')
      .select('severity, detected_at');

    if (error) throw error;

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const stats = {
      total: potholes?.length || 0,
      high: potholes?.filter((p) => p.severity === 'high').length || 0,
      medium: potholes?.filter((p) => p.severity === 'medium').length || 0,
      low: potholes?.filter((p) => p.severity === 'low').length || 0,
      last24Hours:
        potholes?.filter((p) => new Date(p.detected_at) > last24Hours).length || 0,
    };

    return stats;
  },

  async getDevices(): Promise<Device[]> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveDevicesCount(): Promise<number> {
    const { data, error } = await supabase
      .from('devices')
      .select('id')
      .eq('status', 'active');

    if (error) throw error;
    return data?.length || 0;
  },

  subscribeToNewPotholes(callback: (pothole: Pothole) => void) {
    return supabase
      .channel('potholes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'potholes',
        },
        (payload) => {
          callback(payload.new as Pothole);
        }
      )
      .subscribe();
  },

  exportToCSV(potholes: Pothole[]): string {
    const headers = [
      'ID',
      'Latitude',
      'Longitude',
      'Severity',
      'G-Force',
      'Device ID',
      'Detected At',
      'Address',
    ];

    const rows = potholes.map((p) => [
      p.id,
      p.latitude,
      p.longitude,
      p.severity,
      p.g_force,
      p.device_id,
      p.detected_at,
      p.address || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  },

  exportToJSON(potholes: Pothole[]): string {
    return JSON.stringify(potholes, null, 2);
  },

  downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
