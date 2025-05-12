# Sistem Pelaporan Email - Dashboard Monitoring IoT

Sistem ini mengirimkan laporan berkala melalui email untuk Dashboard Monitoring IoT. Laporan berisi informasi terkini tentang status server, data tegangan, arus, daya, serta grafik-grafik untuk visualisasi.

## 📋 Fitur

- **Pengiriman Otomatis:** Laporan dikirim setiap 23 jam ke email yang ditentukan
- **Grafik Visual:** Visualisasi data tegangan, arus, dan daya dengan Chart.js
- **Data Historis:** Menyimpan dan mengelola data historis di Firebase
- **Email Responsif:** Template email yang menarik dan responsif di berbagai perangkat
- **Mode Test:** Kemampuan untuk mengirim email test tanpa menunggu jadwal

## 🔧 Instalasi

### Prasyarat

- Node.js (versi 14.x atau lebih tinggi)
- Akun Firebase dengan Realtime Database
- Akun Gmail untuk mengirim email

### Langkah Instalasi

1. **Kloning repositori:**
   ```bash
   git clone https://github.com/dasaraul/Monitoring-IoT.git
   cd Monitoring-IoT
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Firebase:**
   - Pastikan file `js/serviceAccountKey.json` sudah berisi kredensial Firebase Admin SDK
   - Tetapkan URL Firebase Realtime Database di file `.env`

4. **Konfigurasi Email:**
   - Edit file `.env` dan atur alamat email pengirim serta password
   - Tetapkan alamat email penerima

## 🚀 Penggunaan

### Menjalankan Sistem

```bash
# Jalankan sistem pelaporan email
npm run start

# Jalankan pengumpulan data historis saja
npm run historical

# Jalankan keduanya sekaligus
npm run all
```

### Mengirim Email Test

```bash
# Kirim email test tanpa menunggu jadwal
npm run test
```

## 📁 Struktur Sistem

```
Monitoring-IoT/
├── js/
│   ├── email-reporter.js     # Sistem pelaporan email utama
│   ├── chart-utils.js        # Utilitas untuk membuat grafik
│   ├── historical-data.js    # Pengumpulan data historis
│   ├── test-email.js         # Skrip pengujian email
│   └── serviceAccountKey.json # Kredensial Firebase (tidak disertakan di repo)
├── email-template.html       # Template HTML untuk email
├── .env                      # File konfigurasi lingkungan
├── tmp/                      # Folder sementara untuk grafik (dibuat otomatis)
├── package.json              # Konfigurasi proyek dan dependensi
└── README-Reporter.md        # Dokumentasi sistem pelaporan
```

## ⚙️ Konfigurasi

### File `.env`

```
# Konfigurasi email
EMAIL_USER=Jokowi@raja.jawa
EMAIL_PASSWORD=password_email_anda

# Konfigurasi Firebase
FIREBASE_DATABASE_URL=https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/

# Konfigurasi email penerima
EMAIL_RECIPIENT=pnm.monitoring.iot98@gmail.com

# Konfigurasi jadwal
REPORT_CRON_SCHEDULE=0 */23 * * *
HISTORICAL_CRON_SCHEDULE=0 * * * *

# Konfigurasi retesi data
HISTORICAL_DATA_RETENTION_HOURS=168
```

### Jadwal (Cron)

- `REPORT_CRON_SCHEDULE=0 */23 * * *` - Mengirim laporan setiap 23 jam (pada menit ke-0)
- `HISTORICAL_CRON_SCHEDULE=0 * * * *` - Mengumpulkan data historis setiap jam (pada menit ke-0)

## 🧪 Pengembangan

### Menyesuaikan Template Email

Template email menggunakan [Handlebars](https://handlebarsjs.com/) untuk menyisipkan data dinamis. Anda dapat mengedit file `email-template.html` untuk menyesuaikan tampilan laporan.

### Menyesuaikan Grafik

Grafik dibuat menggunakan [Chart.js](https://www.chartjs.org/) melalui library [chartjs-node-canvas](https://github.com/SeanSobey/ChartjsNodeCanvas). Anda dapat menyesuaikan pengaturan grafik di file `js/chart-utils.js`.

### Menyesuaikan Data Historis

Pengumpulan data historis dilakukan di file `js/historical-data.js`. Anda dapat menyesuaikan struktur data dan periode penyimpanan.

## 📜 Lisensi

MIT License - Lihat file `LICENSE` untuk detail.

## 👥 Kontak

Diky Aditia ([@dasaraul](https://github.com/dasaraul))