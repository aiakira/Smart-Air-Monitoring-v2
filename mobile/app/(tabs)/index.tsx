import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { api, SensorData } from '../../services/api';
import { SensorCard } from '../../components/SensorCard';
import { FanControl } from '../../components/FanControl';

export default function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    co2: 412,
    co: 1.2,
    dust: 58,
    ts: new Date().toISOString(),
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const result = await api.getLatest();
      if (result.data) {
        setSensorData(result.data);
        setLastUpdate(new Date(result.data.ts));
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal mengambil data. Pastikan server berjalan.');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusFromCO2 = (value: number): 'good' | 'moderate' | 'poor' => {
    if (value > 1000) return 'poor';
    if (value > 700) return 'moderate';
    return 'good';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Sensor Cards */}
      <View style={styles.section}>
        <SensorCard
          label="CO₂"
          value={Math.round(sensorData.co2)}
          unit="ppm"
          icon="🌫️"
          status={getStatusFromCO2(sensorData.co2)}
        />
        <SensorCard
          label="CO"
          value={Number(sensorData.co.toFixed(1))}
          unit="ppm"
          icon="💨"
          status={sensorData.co > 5 ? 'poor' : sensorData.co > 2 ? 'moderate' : 'good'}
        />
        <SensorCard
          label="Debu"
          value={Math.round(sensorData.dust)}
          unit="µg/m³"
          icon="🏭"
          status={sensorData.dust > 100 ? 'poor' : sensorData.dust > 75 ? 'moderate' : 'good'}
        />
      </View>

      {/* Fan Control */}
      <View style={styles.section}>
        <FanControl />
      </View>

      {/* Last Update */}
      <View style={styles.updateCard}>
        <Text style={styles.updateIcon}>⏱️</Text>
        <Text style={styles.updateText}>
          Update terakhir: {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '--:--'}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Tips</Text>
        <Text style={styles.infoText}>
          • Tarik ke bawah untuk refresh data{'\n'}
          • Data diperbarui otomatis setiap 3 detik{'\n'}
          • Pastikan koneksi internet stabil
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 16,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  updateCard: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  updateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
