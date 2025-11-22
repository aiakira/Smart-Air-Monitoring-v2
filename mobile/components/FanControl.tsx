import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function FanControl() {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFanState();
  }, []);

  const loadFanState = async () => {
    try {
      const [fanRes, settingsRes] = await Promise.all([
        api.getFanState(),
        api.getSettings(),
      ]);
      
      if (fanRes?.data?.desired !== undefined) {
        setIsActive(Boolean(fanRes.data.desired));
      }
      if (settingsRes?.data?.mode) {
        setMode(settingsRes.data.mode === 'manual' ? 'manual' : 'auto');
      }
    } catch (error) {
      console.error('Error loading fan state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (mode !== 'manual') return;
    
    const newState = !isActive;
    setIsActive(newState);
    
    try {
      await api.setFanState(newState);
    } catch (error) {
      console.error('Failed to set fan state:', error);
      setIsActive(!newState); // Revert on error
    }
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>💨</Text>
        <Text style={styles.title}>Exhaust Fan</Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: isActive ? '#d1fae5' : '#f3f4f6' }]}>
        <Text style={[styles.statusText, { color: isActive ? '#10b981' : '#6b7280' }]}>
          {isActive ? '🟢 Aktif' : '⚪ Mati'}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isActive ? '#10b981' : '#ef4444' },
          mode !== 'manual' && styles.buttonDisabled,
        ]}
        onPress={handleToggle}
        disabled={mode !== 'manual'}
      >
        <Text style={styles.buttonText}>
          {isActive ? '⚡ Matikan Fan' : '⚡ Nyalakan Fan'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.modeText}>
        {mode === 'auto' 
          ? '⚡ Mode Auto: Fan menyala otomatis saat kualitas udara menurun' 
          : '🎮 Mode Manual: Kontrol fan secara manual'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
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
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
