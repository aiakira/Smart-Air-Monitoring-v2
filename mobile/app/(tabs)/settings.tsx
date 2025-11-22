import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function Settings() {
  const openGitHub = () => {
    Linking.openURL('https://github.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💨 Tentang Aplikasi</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Smart Air Monitor adalah sistem monitoring kualitas udara real-time yang memantau kadar CO₂, CO, dan debu di lingkungan Anda.
          </Text>
          <Text style={styles.version}>Versi 1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌫️ Informasi Sensor</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CO₂ (Karbon Dioksida)</Text>
          <Text style={styles.cardText}>
            • Normal: &lt;700 ppm{'\n'}
            • Sedang: 700-1000 ppm{'\n'}
            • Buruk: &gt;1000 ppm{'\n\n'}
            Kadar CO₂ tinggi dapat menyebabkan sakit kepala, pusing, dan menurunkan konsentrasi.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>CO (Karbon Monoksida)</Text>
          <Text style={styles.cardText}>
            • Normal: &lt;2 ppm{'\n'}
            • Sedang: 2-5 ppm{'\n'}
            • Buruk: &gt;5 ppm{'\n\n'}
            CO sangat berbahaya karena mengikat oksigen dalam darah. Segera ventilasi ruangan jika kadar tinggi.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debu (PM2.5/PM10)</Text>
          <Text style={styles.cardText}>
            • Normal: &lt;75 µg/m³{'\n'}
            • Sedang: 75-100 µg/m³{'\n'}
            • Buruk: &gt;100 µg/m³{'\n\n'}
            Partikel debu dapat masuk ke paru-paru dan menyebabkan gangguan pernapasan.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Pengaturan</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔔 Notifikasi</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🌙 Mode Gelap</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔄 Interval Update</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Bantuan</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={openGitHub}>
          <Text style={styles.menuText}>📖 Dokumentasi</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🐛 Laporkan Bug</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⭐ Beri Rating</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 Smart Air Monitor{'\n'}
          Sistem monitoring kualitas udara untuk lingkungan yang lebih sehat
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
