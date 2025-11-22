// Script untuk setup database Neon
const { Client } = require('@neondatabase/serverless');
const fs = require('fs');

// Read DATABASE_URL from .env.local
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) DATABASE_URL = match[1].trim();
}

const schema = `
-- Smart Air Monitor Database Schema untuk Neon Database

-- Tabel untuk menyimpan data pembacaan sensor
CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  co2 NUMERIC(10, 2) NOT NULL,
  co NUMERIC(10, 2) NOT NULL,
  dust NUMERIC(10, 2) NOT NULL,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_ts ON sensor_readings(ts DESC);

-- Tabel untuk menyimpan pengaturan aplikasi
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  co2_threshold NUMERIC(10, 2) DEFAULT 1000,
  co_threshold NUMERIC(10, 2) DEFAULT 5,
  dust_threshold NUMERIC(10, 2) DEFAULT 100,
  auto_mode BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at DESC);

-- Tabel untuk menyimpan status fan
CREATE TABLE IF NOT EXISTS fan_state (
  id SERIAL PRIMARY KEY,
  desired BOOLEAN NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fan_state_updated_at ON fan_state(updated_at DESC);
`;

const seedData = `
-- Insert data default
INSERT INTO settings (co2_threshold, co_threshold, dust_threshold, auto_mode, notifications_enabled)
SELECT 1000, 5, 100, true, true
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

INSERT INTO fan_state (desired)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM fan_state LIMIT 1);

-- Insert sample data
INSERT INTO sensor_readings (co2, co, dust, ts) VALUES
  (412, 1.2, 58, NOW() - INTERVAL '1 hour'),
  (450, 1.5, 62, NOW() - INTERVAL '50 minutes'),
  (520, 1.8, 68, NOW() - INTERVAL '40 minutes'),
  (580, 2.1, 72, NOW() - INTERVAL '30 minutes'),
  (650, 2.4, 78, NOW() - INTERVAL '20 minutes'),
  (720, 2.8, 85, NOW() - INTERVAL '10 minutes'),
  (412, 1.2, 58, NOW());
`;

async function setupDatabase() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to Neon Database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('\n📋 Creating tables and indexes...');
    await client.query(schema);
    console.log('✅ Tables created successfully!');

    console.log('\n📊 Inserting default data...');
    await client.query(seedData);
    console.log('✅ Data inserted successfully!');

    console.log('\n🔍 Verifying setup...');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\n📁 Tables created:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    const sensorCount = await client.query('SELECT COUNT(*) FROM sensor_readings');
    console.log(`\n📈 Sensor readings: ${sensorCount.rows[0].count} records`);

    const latestSensor = await client.query('SELECT * FROM sensor_readings ORDER BY ts DESC LIMIT 1');
    if (latestSensor.rows[0]) {
      const data = latestSensor.rows[0];
      console.log(`   Latest: CO₂=${data.co2}ppm, CO=${data.co}ppm, Dust=${data.dust}µg/m³`);
    }

    const settings = await client.query('SELECT * FROM settings LIMIT 1');
    console.log(`\n⚙️  Settings configured: ${settings.rows.length > 0 ? '✅' : '❌'}`);

    const fanState = await client.query('SELECT * FROM fan_state LIMIT 1');
    console.log(`🌀 Fan state configured: ${fanState.rows.length > 0 ? '✅' : '❌'}`);

    console.log('\n✨ Database setup completed successfully!');
    console.log('\n🚀 You can now run: pnpm dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
