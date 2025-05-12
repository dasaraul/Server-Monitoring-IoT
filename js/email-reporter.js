const cron = require('node-cron');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment');
const { registerHandlebarsHelpers, createVoltageChart, createCurrentPowerChart } = require('./chart-utils');

// Konfigurasi moment untuk Bahasa Indonesia
moment.locale('id');

// Register helper Handlebars
registerHandlebarsHelpers();

// Inisialisasi Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Jokowi@raja.jawa',
    pass: process.env.EMAIL_PASSWORD || 'password_email_anda' // Gunakan variabel lingkungan untuk keamanan
  }
});

// Membaca template email
const emailTemplatePath = path.join(__dirname, '../email-template.html');
const source = fs.readFileSync(emailTemplatePath, 'utf-8');
const template = handlebars.compile(source);

// Fungsi untuk mendapatkan data dari Firebase
async function getServerData() {
  try {
    console.log('Mengambil data server dari Firebase...');
    const snapshot = await db.ref('/').once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error mengambil data dari Firebase:', error);
    return null;
  }
}

// Fungsi untuk mendapatkan data historis
async function getHistoricalData() {
  try {
    console.log('Mengambil data historis dari Firebase...');
    const snapshot = await db.ref('/historical_data').limitToLast(24).once('value');
    const data = snapshot.val();
    
    if (!data) {
      console.log('Tidak ada data historis ditemukan, menggunakan data simulasi...');
      return generateSimulatedHistoricalData();
    }
    
    // Konversi dari object ke array dan urutkan berdasarkan timestamp
    const dataArray = Object.entries(data).map(([key, value]) => {
      return { ...value, key };
    });
    
    dataArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log(`Berhasil mendapatkan ${dataArray.length} entri data historis`);
    return dataArray;
  } catch (error) {
    console.error('Error mengambil data historis:', error);
    console.log('Menggunakan data simulasi sebagai fallback...');
    return generateSimulatedHistoricalData();
  }
}

// Fungsi untuk menghasilkan data historis simulasi jika data tidak tersedia
function generateSimulatedHistoricalData() {
  console.log('Membuat data historis simulasi...');
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 3600000);
    data.push({
      timestamp: timestamp.toISOString(),
      datetime: timestamp.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      V1: 99.5 + Math.random() * 1.5,
      V2: 101 + Math.random() * 1,
      V3: 99 + Math.random() * 1.5,
      Iavg: 0.06 + Math.random() * 0.01,
      Ptot: 0.01 + Math.random() * 0.005,
      Edel: 1.85 + i * 0.01
    });
  }
  
  return data;
}

// Fungsi untuk mengirim email laporan
async function sendReport() {
  console.log('Mempersiapkan pengiriman laporan email...');
  
  try {
    // Mendapatkan data server terbaru
    const serverData = await getServerData();
    if (!serverData) {
      console.error('Tidak dapat mengirim laporan: data server tidak tersedia');
      return;
    }
    
    // Mendapatkan data historis untuk grafik
    const historicalData = await getHistoricalData();
    
    // Buat folder tmp jika belum ada
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    
    // Generate grafik untuk disematkan dalam email
    const voltageChartPath = path.join(tmpDir, 'voltage-chart.png');
    const currentPowerChartPath = path.join(tmpDir, 'current-power-chart.png');
    
    await createVoltageChart(historicalData, voltageChartPath);
    await createCurrentPowerChart(historicalData, currentPowerChartPath);
    
    // Format timestamp saat ini
    const currentTimestamp = moment().format('dddd, D MMMM YYYY, HH:mm:ss');
    
    // Persiapkan data untuk template
    const templateData = {
      timestamp: currentTimestamp,
      server_name: serverData.server_info?.name || 'Server-DB-01',
      server_location: serverData.server_info?.location || 'Rack 3, Data Center Jakarta',
      uptime: serverData.server_info?.uptime || 'Data tidak tersedia',
      
      // Data sensor terbaru
      voltage: {
        v1: serverData.sensor_data?.V1?.toFixed(2) || 'N/A',
        v2: serverData.sensor_data?.V2?.toFixed(2) || 'N/A',
        v3: serverData.sensor_data?.V3?.toFixed(2) || 'N/A',
        vavg: serverData.sensor_data?.Vavg?.toFixed(2) || 'N/A'
      },
      current: serverData.sensor_data?.Iavg?.toFixed(5) || 'N/A',
      power: serverData.sensor_data?.Ptot?.toFixed(5) || 'N/A',
      energy: serverData.sensor_data?.Edel?.toFixed(2) || 'N/A',
      
      // Data beban, suhu, dan efisiensi
      cpu_load: '68%', // Gunakan nilai statik atau bisa diambil dari Firebase
      temperature: '45°C', // Gunakan nilai statik atau bisa diambil dari Firebase
      efficiency: '92%', // Gunakan nilai statik atau bisa diambil dari Firebase
      
      // Data konsumsi daya
      power_metrics: {
        daily: (serverData.power_metrics?.dailyAvg || 1.08).toFixed(2),
        weekly: (serverData.power_metrics?.weeklyAvg || 1.10).toFixed(2),
        monthly: (serverData.power_metrics?.monthlyAvg || 1.07).toFixed(2)
      },
      
      // Alert data - terbaru dahulu
      alerts: (serverData.alerts || []).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ).slice(0, 5) // Ambil 5 alert terbaru saja
    };
    
    // Render email HTML dengan template
    const html = template(templateData);
    
    // Konfigurasi email
    const mailOptions = {
      from: '"ServerMonitor IoT" <Jokowi@raja.jawa>',
      to: 'pnm.monitoring.iot98@gmail.com',
      subject: `Laporan Monitoring Server - ${moment().format('DD/MM/YYYY HH:mm')}`,
      html: html,
      attachments: [
        {
          filename: 'voltage-chart.png',
          path: voltageChartPath,
          cid: 'voltage-chart' // Digunakan untuk menyematkan gambar dalam email
        },
        {
          filename: 'current-power-chart.png',
          path: currentPowerChartPath,
          cid: 'current-power-chart' // Digunakan untuk menyematkan gambar dalam email
        }
      ]
    };
    
    // Kirim email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Laporan berhasil dikirim:', info.messageId);
    console.log(`📧 Laporan dikirim ke: ${mailOptions.to}`);
    console.log(`⏰ Laporan berikutnya akan dikirim dalam 23 jam`);
    
    // Hapus file gambar setelah email terkirim
    fs.unlinkSync(voltageChartPath);
    fs.unlinkSync(currentPowerChartPath);
    
  } catch (error) {
    console.error('❌ Error mengirim email:', error);
  }
}

// Jadwalkan pengiriman laporan setiap 23 jam
// Format cron: minute hour * * * 
// 0 */23 * * * akan dijalankan setiap 23 jam dimulai dari jam 00:00
cron.schedule('0 */23 * * *', sendReport);

// Log status awal
console.log('🚀 Sistem pelaporan email dimulai...');
console.log(`⏱️  Jadwal: setiap 23 jam sekali`);
console.log(`📧 Email tujuan: pnm.monitoring.iot98@gmail.com`);
console.log(`📤 Pengirim: Jokowi@raja.jawa`);

// Untuk testing, langsung kirim laporan saat aplikasi dimulai
// Hapus atau komentari baris ini jika tidak ingin mengirim email saat startup
sendReport();

module.exports = { sendReport };