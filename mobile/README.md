# 📱 Smart Air Monitor - Mobile App (Expo)

Aplikasi mobile untuk monitoring kualitas udara menggunakan Expo & React Native.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Konfigurasi API URL

Edit file `services/api.ts` dan ganti `API_URL`:

```typescript
// Untuk development lokal (gunakan IP komputer, bukan localhost)
const API_URL = 'http://192.168.1.100:3000';

// Untuk production (setelah deploy Next.js)
const API_URL = 'https://your-app.vercel.app';
```

**Cara cek IP komputer:**
- Windows: `ipconfig` → cari IPv4 Address
- Mac/Linux: `ifconfig` → cari inet

### 3. Jalankan Aplikasi

```bash
# Start Expo development server
npx expo start

# Pilih platform:
# - Press 'a' untuk Android emulator
# - Press 'i' untuk iOS simulator
# - Scan QR code dengan Expo Go app
```

### 4. Install Expo Go di HP

Download Expo Go:
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

Scan QR code dari terminal untuk membuka app.

---

## 📦 Build APK

### Menggunakan EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login ke Expo
eas login

# Configure project
eas build:configure

# Build APK untuk Android
eas build --platform android --profile preview

# Download APK setelah build selesai
```

### Build Lokal (Tanpa EAS)

```bash
# Build APK lokal
npx expo run:android --variant release
```

APK akan ada di: `android/app/build/outputs/apk/release/`

---

## 🎯 Fitur Aplikasi

✅ **Dashboard**
- Real-time monitoring CO₂, CO, dan Debu
- Auto-refresh setiap 3 detik
- Pull-to-refresh manual
- Kontrol exhaust fan

✅ **Riwayat**
- Lihat 30 data terakhir
- Filter berdasarkan status (Baik/Sedang/Buruk)
- Detail waktu dan nilai sensor

✅ **Pengaturan**
- Informasi aplikasi
- Panduan sensor
- Link dokumentasi

---

## 🔧 Troubleshooting

### Error: Network Request Failed

**Penyebab:** Aplikasi tidak bisa connect ke API

**Solusi:**
1. Pastikan Next.js server berjalan (`npm run dev`)
2. Gunakan IP komputer, bukan `localhost`
3. HP dan komputer harus di WiFi yang sama
4. Disable firewall sementara

### Error: Unable to resolve module

**Solusi:**
```bash
# Clear cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Aplikasi crash saat dibuka

**Solusi:**
1. Check console error di terminal
2. Pastikan semua dependencies terinstall
3. Restart Expo server

---

## 📱 Testing di Real Device

### Android:
1. Install Expo Go dari Play Store
2. Pastikan HP dan komputer di WiFi sama
3. Scan QR code dari terminal
4. App akan terbuka di Expo Go

### iOS:
1. Install Expo Go dari App Store
2. Scan QR code dengan Camera app
3. Tap notifikasi untuk buka di Expo Go

---

## 🌐 Deploy ke Production

### 1. Deploy Next.js API

```bash
# Di root project (bukan folder mobile)
cd ..
vercel
```

Copy URL deployment (contoh: `https://smart-air-monitor.vercel.app`)

### 2. Update API URL di Mobile

Edit `mobile/services/api.ts`:
```typescript
const API_URL = 'https://smart-air-monitor.vercel.app';
```

### 3. Build APK Production

```bash
eas build --platform android --profile production
```

### 4. Publish ke Google Play Store

1. Buat akun Google Play Developer ($25 sekali bayar)
2. Upload APK dari EAS Build
3. Isi informasi aplikasi
4. Submit untuk review

---

## 📂 Struktur Project

```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard screen
│   │   ├── history.tsx        # History screen
│   │   ├── settings.tsx       # Settings screen
│   │   └── _layout.tsx        # Tab navigation
│   └── _layout.tsx            # Root layout
├── components/
│   ├── SensorCard.tsx         # Sensor display card
│   └── FanControl.tsx         # Fan control component
├── services/
│   └── api.ts                 # API calls
├── app.json                   # Expo config
└── package.json
```

---

## 🔐 Environment Variables

Untuk production, simpan API key di environment:

```bash
# .env
API_URL=https://your-api.vercel.app
API_KEY=your-secret-key
```

Load dengan:
```typescript
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

---

## 💡 Tips Development

1. **Hot Reload**: Shake device atau press 'r' untuk reload
2. **Debug Menu**: Shake device atau press 'd' untuk debug menu
3. **Console Logs**: Lihat di terminal Expo
4. **Network Inspector**: Enable di debug menu

---

## 📚 Resources

- Expo Docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Router: https://docs.expo.dev/router/introduction/

---

## 🐛 Known Issues

1. **Chart tidak muncul**: Install `react-native-svg` dan restart
2. **Font tidak load**: Tunggu beberapa detik saat pertama buka
3. **API timeout**: Increase timeout di axios config

---

## 📞 Support

Jika ada masalah:
1. Check console error
2. Baca dokumentasi Expo
3. Search di Stack Overflow
4. Tanya di Expo Discord

---

## ✅ Checklist Sebelum Deploy

- [ ] Update API_URL ke production URL
- [ ] Test semua fitur di real device
- [ ] Build APK berhasil
- [ ] Test APK di device
- [ ] Buat icon & splash screen
- [ ] Update app.json (name, version, etc)
- [ ] Siapkan screenshot untuk Play Store
- [ ] Tulis deskripsi aplikasi

---

## 🎉 Selamat!

Aplikasi mobile Anda siap digunakan! 🚀
