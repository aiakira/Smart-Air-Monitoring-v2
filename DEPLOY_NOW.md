# 🚀 Deploy ke Vercel - Langkah Mudah

## Langkah 1: Buka Vercel
Klik link ini: https://vercel.com/new

## Langkah 2: Login
- Klik **"Continue with GitHub"**
- Login dengan akun GitHub Anda (aiakira)

## Langkah 3: Import Repository
- Cari repository: **"Smart-Air-Monitoring-v2"**
- Klik **"Import"**

## Langkah 4: Configure Project
Vercel akan auto-detect Next.js. Biarkan semua default:
- ✅ Framework Preset: Next.js
- ✅ Root Directory: ./
- ✅ Build Command: pnpm build
- ✅ Output Directory: .next

**JANGAN UBAH APAPUN!**

## Langkah 5: Environment Variables (PENTING!)
Scroll ke bawah, klik **"Environment Variables"**

### Tambahkan Variable:

**Name:**
```
DATABASE_URL
```

**Value:**
```
postgresql://neondb_owner:npg_U7IHN4rFmCVs@ep-lucky-darkness-a15k13s2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Environment:** Centang semua (Production, Preview, Development)

Klik **"Add"**

## Langkah 6: Deploy!
- Klik tombol besar **"Deploy"**
- Tunggu 2-3 menit
- ☕ Ambil kopi sebentar...

## Langkah 7: Selesai! 🎉
Setelah selesai, Anda akan dapat URL seperti:
```
https://smart-air-monitoring-v2-xxx.vercel.app
```

Klik URL tersebut untuk membuka aplikasi!

## Test Aplikasi

### 1. Buka di Browser
Pastikan dashboard muncul dengan data sensor

### 2. Test API
Ganti URL dengan URL Vercel Anda:
```bash
curl https://smart-air-monitoring-v2-xxx.vercel.app/api/sensor/latest
```

### 3. Test Kirim Data (dari ESP32)
```bash
curl -X POST https://smart-air-monitoring-v2-xxx.vercel.app/api/sensor/ingest \
  -H "Content-Type: application/json" \
  -d '{"co2": 500, "co": 1.5, "dust": 70}'
```

## Update ESP32
Edit kode Arduino, ganti URL:
```cpp
const char* serverUrl = "https://smart-air-monitoring-v2-xxx.vercel.app/api/sensor/ingest";
```

## Troubleshooting

### Build Failed?
- Pastikan DATABASE_URL sudah ditambahkan
- Cek tidak ada typo di connection string
- Klik "Redeploy"

### Data Tidak Muncul?
- Buka Vercel Dashboard → Deployments → View Function Logs
- Cek error di logs
- Pastikan Neon database masih aktif

## Auto Deploy
Setiap kali push ke GitHub, Vercel otomatis deploy!
```bash
git add .
git commit -m "Update feature"
git push
```

---

**Selamat! Aplikasi Anda sudah live di internet! 🌍**
