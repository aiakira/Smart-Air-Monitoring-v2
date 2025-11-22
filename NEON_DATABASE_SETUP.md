# Setup Neon Database untuk Smart Air Monitor

## Langkah-langkah Setup

### 1. Buat Akun Neon Database
1. Kunjungi [https://neon.tech](https://neon.tech)
2. Daftar atau login dengan akun GitHub/Google
3. Buat project baru dengan nama "smart-air-monitor"

### 2. Dapatkan Connection String
1. Setelah project dibuat, copy **Connection String** dari dashboard
2. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### 3. Setup Environment Variable
1. Buat file `.env.local` di root project (jika belum ada)
2. Tambahkan connection string:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Contoh:**
```env
DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 4. Jalankan SQL Schema
1. Buka **Neon Console** → pilih project Anda
2. Klik tab **SQL Editor**
3. Copy seluruh isi file `database-schema.sql`
4. Paste ke SQL Editor
5. Klik **Run** untuk menjalankan script

### 5. Verifikasi Database
Jalankan query berikut di SQL Editor untuk memastikan tabel sudah dibuat:

```sql
-- Cek tabel yang ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Cek data sensor
SELECT * FROM sensor_readings ORDER BY ts DESC LIMIT 5;

-- Cek settings
SELECT * FROM settings ORDER BY updated_at DESC LIMIT 1;

-- Cek fan state
SELECT * FROM fan_state ORDER BY updated_at DESC LIMIT 1;
```

### 6. Test Koneksi dari Aplikasi
1. Restart development server:
```bash
pnpm dev
```

2. Buka browser ke `http://localhost:3000`
3. Data sensor seharusnya muncul di dashboard

## Struktur Database

### Tabel: `sensor_readings`
Menyimpan data pembacaan sensor secara real-time.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | SERIAL | Primary key |
| co2 | NUMERIC(10,2) | Kadar CO₂ (ppm) |
| co | NUMERIC(10,2) | Kadar CO (ppm) |
| dust | NUMERIC(10,2) | Kadar debu (µg/m³) |
| ts | TIMESTAMP | Waktu pembacaan |

### Tabel: `settings`
Menyimpan konfigurasi aplikasi.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | SERIAL | Primary key |
| co2_threshold | NUMERIC(10,2) | Batas aman CO₂ |
| co_threshold | NUMERIC(10,2) | Batas aman CO |
| dust_threshold | NUMERIC(10,2) | Batas aman debu |
| auto_mode | BOOLEAN | Mode otomatis |
| notifications_enabled | BOOLEAN | Status notifikasi |
| updated_at | TIMESTAMP | Waktu update |

### Tabel: `fan_state`
Menyimpan status exhaust fan.

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | SERIAL | Primary key |
| desired | BOOLEAN | Status fan (on/off) |
| updated_at | TIMESTAMP | Waktu update |

## API Endpoints yang Menggunakan Database

- `GET /api/sensor/latest` - Ambil data sensor terbaru
- `GET /api/sensor/history?limit=24` - Ambil riwayat data sensor
- `GET /api/settings` - Ambil pengaturan aplikasi
- `POST /api/settings` - Update pengaturan
- `GET /api/fan/state` - Ambil status fan
- `POST /api/fan/toggle` - Toggle status fan
- `GET /api/notifications` - Ambil notifikasi

## Tips

### Menambah Data Sensor Baru
```sql
INSERT INTO sensor_readings (co2, co, dust) 
VALUES (450, 1.5, 65);
```

### Update Settings
```sql
UPDATE settings 
SET co2_threshold = 800, 
    auto_mode = true,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

### Hapus Data Lama (lebih dari 30 hari)
```sql
DELETE FROM sensor_readings 
WHERE ts < NOW() - INTERVAL '30 days';
```

### Lihat Statistik Data
```sql
SELECT 
  COUNT(*) as total_readings,
  AVG(co2) as avg_co2,
  MAX(co2) as max_co2,
  MIN(co2) as min_co2
FROM sensor_readings
WHERE ts > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Pastikan file `.env.local` ada di root project
- Pastikan variabel `DATABASE_URL` sudah diisi dengan benar
- Restart development server

### Error: "Neon connection failed"
- Cek connection string sudah benar
- Pastikan internet connection aktif
- Cek di Neon Console apakah database masih aktif

### Data tidak muncul
- Jalankan query di SQL Editor untuk cek apakah ada data
- Cek console browser untuk error
- Cek terminal server untuk error log

## Neon Database Free Tier Limits
- Storage: 0.5 GB
- Compute: 191.9 compute hours/month
- Branches: 10
- Databases: Unlimited

Untuk monitoring aplikasi ini, free tier sudah lebih dari cukup!
