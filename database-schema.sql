-- Smart Air Monitor Database Schema untuk Neon Database
-- Jalankan script ini di Neon SQL Editor untuk membuat tabel-tabel yang diperlukan

-- Tabel untuk menyimpan data pembacaan sensor
CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  co2 NUMERIC(10, 2) NOT NULL,           -- Kadar CO2 dalam ppm
  co NUMERIC(10, 2) NOT NULL,            -- Kadar CO dalam ppm
  dust NUMERIC(10, 2) NOT NULL,          -- Kadar debu dalam µg/m³
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Waktu pembacaan
);

-- Index untuk mempercepat query berdasarkan timestamp
CREATE INDEX IF NOT EXISTS idx_sensor_readings_ts ON sensor_readings(ts DESC);

-- Tabel untuk menyimpan pengaturan aplikasi
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  co2_threshold NUMERIC(10, 2) DEFAULT 1000,  -- Threshold CO2 dalam ppm
  co_threshold NUMERIC(10, 2) DEFAULT 5,      -- Threshold CO dalam ppm
  dust_threshold NUMERIC(10, 2) DEFAULT 100,  -- Threshold debu dalam µg/m³
  auto_mode BOOLEAN DEFAULT true,             -- Mode otomatis fan
  notifications_enabled BOOLEAN DEFAULT true, -- Notifikasi aktif/tidak
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk mempercepat query pengaturan terbaru
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at DESC);

-- Insert data default untuk settings
INSERT INTO settings (co2_threshold, co_threshold, dust_threshold, auto_mode, notifications_enabled)
VALUES (1000, 5, 100, true, true)
ON CONFLICT DO NOTHING;

-- Insert beberapa data sample untuk sensor_readings (opsional)
INSERT INTO sensor_readings (co2, co, dust, ts) VALUES
  (412, 1.2, 58, NOW() - INTERVAL '1 hour'),
  (450, 1.5, 62, NOW() - INTERVAL '50 minutes'),
  (520, 1.8, 68, NOW() - INTERVAL '40 minutes'),
  (580, 2.1, 72, NOW() - INTERVAL '30 minutes'),
  (650, 2.4, 78, NOW() - INTERVAL '20 minutes'),
  (720, 2.8, 85, NOW() - INTERVAL '10 minutes'),
  (412, 1.2, 58, NOW());

-- Query untuk melihat data
-- SELECT * FROM sensor_readings ORDER BY ts DESC LIMIT 10;
-- SELECT * FROM settings ORDER BY updated_at DESC LIMIT 1;
