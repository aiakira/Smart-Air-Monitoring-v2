import axios from 'axios';

// GANTI URL INI SETELAH DEPLOY NEXT.JS KE VERCEL
// Untuk development lokal, gunakan IP komputer Anda (bukan localhost)
// Contoh: http://192.168.1.100:3000
const API_URL = 'http://192.168.1.100:3000'; // GANTI DENGAN IP ANDA

export interface SensorData {
  co2: number;
  co: number;
  dust: number;
  ts: string;
}

export interface HistoryData {
  id: number;
  tanggal: string;
  waktu: string;
  co2: number;
  co: number;
  dust: number;
  status: 'baik' | 'sedang' | 'buruk';
}

export const api = {
  // Get latest sensor data
  getLatest: async (): Promise<{ data: SensorData | null }> => {
    try {
      const response = await axios.get(`${API_URL}/api/sensor/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest data:', error);
      throw error;
    }
  },

  // Get history
  getHistory: async (limit = 30): Promise<{ data: any[] }> => {
    try {
      const response = await axios.get(`${API_URL}/api/sensor/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Control fan
  setFanState: async (desired: boolean): Promise<{ ok: boolean }> => {
    try {
      const response = await axios.post(`${API_URL}/api/fan/state`, { desired });
      return response.data;
    } catch (error) {
      console.error('Error setting fan state:', error);
      throw error;
    }
  },

  // Get fan state
  getFanState: async (): Promise<{ data: { desired: boolean; actual: boolean } }> => {
    try {
      const response = await axios.get(`${API_URL}/api/fan/state`);
      return response.data;
    } catch (error) {
      console.error('Error getting fan state:', error);
      throw error;
    }
  },

  // Get settings
  getSettings: async (): Promise<{ data: { mode: string } }> => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      return response.data;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },
};
