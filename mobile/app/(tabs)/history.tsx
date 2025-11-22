import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function History() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'semua' | 'baik' | 'sedang' | 'buruk'>('semua');
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const result = await api.getHistory(30);
      if (result.data) {
        const rows = result.data.map((row: any, idx: number) => {
          const d = new Date(row.ts);
          return {
            id: idx,
            tanggal: d.toLocaleDateString('id-ID'),
            waktu: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
            co2: row.co2,
            co: row.co,
            dust: row.dust,
            status: row.co2 > 1000 ? 'buruk' : row.co2 > 700 ? 'sedang' : 'baik',
          };
        });
        setHistoryData(rows);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const filteredData = filterStatus === 'semua' 
    ? historyData 
    : historyData.filter(item => item.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'baik': return '#10b981';
      case 'sedang': return '#f59e0b';
      case 'buruk': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'baik': return '#d1fae5';
      case 'sedang': return '#fef3c7';
      case 'buruk': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['semua', 'baik', 'sedang', 'buruk'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status as any)}
          >
            <Text style={[
              styles.filterText,
              filterStatus === status && styles.filterTextActive,
            ]}>
              {status === 'semua' ? 'Semua' : 
               status === 'baik' ? '🟢 Baik' : 
               status === 'sedang' ? '🟡 Sedang' : '🔴 Buruk'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* History List */}
      <View style={styles.listContainer}>
        {filteredData.slice(0, 20).map((row) => (
          <View key={row.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>
                {row.tanggal} <Text style={styles.timeText}>{row.waktu}</Text>
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBg(row.status) }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(row.status) }
                ]}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>CO₂</Text>
                <Text style={styles.dataValue}>{row.co2} ppm</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>CO</Text>
                <Text style={styles.dataValue}>{row.co} ppm</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Debu</Text>
                <Text style={styles.dataValue}>{row.dust} µg/m³</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {filteredData.length > 20 && (
        <Text style={styles.infoText}>
          Menampilkan 20 dari {filteredData.length} entri
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeText: {
    color: '#6b7280',
    fontWeight: '400',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    padding: 16,
  },
});
