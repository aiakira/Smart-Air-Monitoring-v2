import { View, Text, StyleSheet } from 'react-native';

interface SensorCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
  status: 'good' | 'moderate' | 'poor';
}

export function SensorCard({ label, value, unit, icon, status }: SensorCardProps) {
  const statusColors = {
    good: '#10b981',
    moderate: '#f59e0b',
    poor: '#ef4444',
  };

  const statusBg = {
    good: '#d1fae5',
    moderate: '#fef3c7',
    poor: '#fee2e2',
  };

  return (
    <View style={[styles.card, { backgroundColor: statusBg[status] }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: statusColors[status] }]}>
          {value}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColors[status] }]}>
        <Text style={styles.statusText}>
          {status === 'good' ? '🟢 Baik' : status === 'moderate' ? '🟡 Sedang' : '🔴 Buruk'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 8,
  },
  unit: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
