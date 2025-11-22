# Integrasi ESP32 dengan Smart Air Monitor

## Endpoint API untuk ESP32

### POST /api/sensor/ingest

Endpoint ini digunakan untuk mengirim data sensor dari ESP32 ke database.

**URL:** `https://your-domain.com/api/sensor/ingest`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Request Headers

```
Content-Type: application/json
x-api-key: YOUR_API_KEY (opsional, jika diset di .env.local)
```

### Request Body

```json
{
  "co2": 450.5,
  "co": 1.2,
  "dust": 65.3,
  "ts": "2024-01-15T10:30:00Z"
}
```

**Parameter:**
- `co2` (number, required) - Kadar CO₂ dalam ppm
- `co` (number, required) - Kadar CO dalam ppm
- `dust` (number, required) - Kadar debu dalam µg/m³
- `ts` (string, optional) - Timestamp ISO 8601, jika tidak diisi akan menggunakan waktu server

### Response Success

```json
{
  "ok": true
}
```

### Response Error

```json
{
  "error": "invalid payload"
}
```

## Setup API Key (Opsional)

Untuk keamanan, tambahkan API key di file `.env.local`:

```env
SENSOR_API_KEY=your-secret-key-here-12345
```

ESP32 harus mengirim header `x-api-key` dengan nilai yang sama.

## Contoh Kode Arduino untuk ESP32

### 1. Install Library yang Diperlukan

Di Arduino IDE, install library berikut:
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson

### 2. Kode Lengkap ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint
const char* serverUrl = "https://your-domain.vercel.app/api/sensor/ingest";
const char* apiKey = "your-secret-key-here-12345"; // Kosongkan jika tidak pakai API key

// Pin sensor (sesuaikan dengan hardware Anda)
#define MQ135_PIN 34  // CO2 sensor (analog)
#define MQ7_PIN 35    // CO sensor (analog)
#define DUST_PIN 32   // Dust sensor (analog)

// Interval pengiriman data (ms)
const unsigned long sendInterval = 3000; // 3 detik
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  
  // Setup pin sensor
  pinMode(MQ135_PIN, INPUT);
  pinMode(MQ7_PIN, INPUT);
  pinMode(DUST_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentTime = millis();
  
  // Kirim data setiap interval
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    
    // Baca sensor
    float co2 = readCO2Sensor();
    float co = readCOSensor();
    float dust = readDustSensor();
    
    // Kirim ke server
    sendSensorData(co2, co, dust);
  }
}

// Fungsi membaca sensor CO2 (MQ-135)
float readCO2Sensor() {
  int rawValue = analogRead(MQ135_PIN);
  // Konversi ke ppm (sesuaikan dengan kalibrasi sensor Anda)
  float voltage = rawValue * (3.3 / 4095.0);
  float co2ppm = voltage * 100; // Contoh konversi sederhana
  
  Serial.print("CO2: ");
  Serial.print(co2ppm);
  Serial.println(" ppm");
  
  return co2ppm;
}

// Fungsi membaca sensor CO (MQ-7)
float readCOSensor() {
  int rawValue = analogRead(MQ7_PIN);
  // Konversi ke ppm (sesuaikan dengan kalibrasi sensor Anda)
  float voltage = rawValue * (3.3 / 4095.0);
  float coppm = voltage * 10; // Contoh konversi sederhana
  
  Serial.print("CO: ");
  Serial.print(coppm);
  Serial.println(" ppm");
  
  return coppm;
}

// Fungsi membaca sensor Debu (GP2Y1010AU0F atau sejenisnya)
float readDustSensor() {
  int rawValue = analogRead(DUST_PIN);
  // Konversi ke µg/m³ (sesuaikan dengan kalibrasi sensor Anda)
  float voltage = rawValue * (3.3 / 4095.0);
  float dustDensity = voltage * 170 / 3.3; // Contoh konversi
  
  Serial.print("Dust: ");
  Serial.print(dustDensity);
  Serial.println(" µg/m³");
  
  return dustDensity;
}

// Fungsi mengirim data ke server
void sendSensorData(float co2, float co, float dust) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Tambahkan API key jika digunakan
    if (strlen(apiKey) > 0) {
      http.addHeader("x-api-key", apiKey);
    }
    
    // Buat JSON payload
    StaticJsonDocument<200> doc;
    doc["co2"] = co2;
    doc["co"] = co;
    doc["dust"] = dust;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.println("Sending data: " + jsonString);
    
    // Kirim POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      Serial.println("Failed to send data");
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}
```

## Konfigurasi yang Perlu Diubah

### 1. WiFi Credentials
```cpp
const char* ssid = "YOUR_WIFI_SSID";        // Ganti dengan nama WiFi Anda
const char* password = "YOUR_WIFI_PASSWORD"; // Ganti dengan password WiFi
```

### 2. Server URL
```cpp
const char* serverUrl = "https://your-domain.vercel.app/api/sensor/ingest";
```

Ganti dengan URL aplikasi Anda setelah deploy ke Vercel atau hosting lain.

**Untuk testing lokal:**
```cpp
const char* serverUrl = "http://192.168.1.12:3000/api/sensor/ingest";
```

### 3. API Key (jika digunakan)
```cpp
const char* apiKey = "your-secret-key-here-12345";
```

### 4. Pin Sensor
Sesuaikan dengan wiring hardware Anda:
```cpp
#define MQ135_PIN 34  // Pin untuk sensor CO2
#define MQ7_PIN 35    // Pin untuk sensor CO
#define DUST_PIN 32   // Pin untuk sensor debu
```

## Sensor yang Direkomendasikan

### 1. Sensor CO₂
- **MQ-135** - Sensor gas untuk CO₂, NH₃, NOx, alkohol, benzene, smoke
- **MH-Z19B** - Sensor CO₂ NDIR (lebih akurat)

### 2. Sensor CO
- **MQ-7** - Sensor karbon monoksida (CO)
- **MQ-9** - Sensor CO dan gas mudah terbakar

### 3. Sensor Debu
- **GP2Y1010AU0F** - Sharp Dust Sensor
- **DSM501A** - Dust Sensor Module
- **PMS5003** - Particulate Matter Sensor

## Wiring Diagram (Contoh)

```
ESP32          MQ-135 (CO2)
-----          ------------
3.3V    --->   VCC
GND     --->   GND
GPIO34  --->   AOUT

ESP32          MQ-7 (CO)
-----          ---------
5V      --->   VCC
GND     --->   GND
GPIO35  --->   AOUT

ESP32          GP2Y1010AU0F (Dust)
-----          --------------------
5V      --->   VCC
GND     --->   GND
GPIO32  --->   VO (output)
150Ω    --->   LED (dengan kapasitor 220µF)
```

## Testing

### 1. Test dengan Serial Monitor
Buka Serial Monitor di Arduino IDE (115200 baud) untuk melihat:
- Status koneksi WiFi
- Nilai sensor yang dibaca
- Response dari server

### 2. Test dengan Postman/cURL

```bash
curl -X POST https://your-domain.vercel.app/api/sensor/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key-here-12345" \
  -d '{
    "co2": 450,
    "co": 1.2,
    "dust": 65
  }'
```

### 3. Cek Data di Dashboard
Buka dashboard web di browser dan lihat apakah data sensor muncul.

## Troubleshooting

### ESP32 tidak bisa connect ke WiFi
- Pastikan SSID dan password benar
- Cek jarak ESP32 ke router
- Pastikan WiFi 2.4GHz (ESP32 tidak support 5GHz)

### Data tidak masuk ke database
- Cek Serial Monitor untuk error code
- Pastikan URL server benar
- Cek API key jika digunakan
- Pastikan database sudah di-setup dengan benar

### Nilai sensor tidak akurat
- Lakukan kalibrasi sensor
- Baca datasheet sensor untuk formula konversi yang tepat
- Beri waktu warm-up untuk sensor (biasanya 24-48 jam untuk MQ series)

## Tips Optimasi

1. **Power Management** - Gunakan deep sleep jika tidak perlu monitoring real-time
2. **Buffering** - Simpan data di SPIFFS jika WiFi terputus
3. **Kalibrasi** - Kalibrasi sensor secara berkala untuk akurasi
4. **Error Handling** - Tambahkan retry mechanism jika gagal kirim data
5. **Watchdog Timer** - Gunakan watchdog untuk auto-restart jika ESP32 hang

## Contoh Kalibrasi Sensor MQ-135

```cpp
// Kalibrasi di udara bersih (outdoor)
float R0 = 10.0; // Resistance di udara bersih (harus dikalibrasi)

float readCO2Sensor() {
  int rawValue = analogRead(MQ135_PIN);
  float voltage = rawValue * (3.3 / 4095.0);
  
  // Hitung resistance sensor
  float RS = ((3.3 * 10.0) / voltage) - 10.0;
  
  // Hitung ratio
  float ratio = RS / R0;
  
  // Konversi ke ppm menggunakan kurva karakteristik
  float co2ppm = 116.6020682 * pow(ratio, -2.769034857);
  
  return co2ppm;
}
```

## Lisensi & Support

Untuk pertanyaan lebih lanjut, silakan buka issue di repository atau hubungi tim development.
