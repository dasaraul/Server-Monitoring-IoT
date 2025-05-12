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
    pass: 'password_email_anda' // Gunakan app password jika 2FA diaktifkan
  }
});

// Membaca template email
const emailTemplatePath = path.join(__dirname, 'email-template.html');
const source = fs.readFileSync(emailTemplatePath, 'utf-8');
const template = handlebars.compile(source);

// Fungsi untuk mendapatkan data dari Firebase
async function getServerData() {
  try {
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
    // Logika untuk mendapatkan data historis dari Firebase
    // Misalnya, data 24 jam terakhir untuk grafik
    const snapshot = await db.ref('/historical_data').limitToLast(24).once('value');
    return snapshot.val() || [];
  } catch (error) {
    console.error('Error mengambil data historis:', error);
    return [];
  }
}

// Fungsi untuk mengirim email laporan
async function sendReport() {
  console.log('Mempersiapkan pengiriman laporan...');
  
  // Mendapatkan data server terbaru
  const serverData = await getServerData();
  if (!serverData) {
    console.error('Tidak dapat mengirim laporan: data tidak tersedia');
    return;
  }
  
  // Mendapatkan data historis untuk grafik
  const historicalData = await getHistoricalData();
  
  // Buat folder tmp jika belum ada
  const tmpDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  
  // Generate grafik untuk disematkan dalam email
  const voltageChartPath = path.join(tmpDir, 'voltage-chart.png');
  const currentPowerChartPath = path.join(tmpDir, 'current-power-chart.png');
  
  await createVoltageChart(historicalData, voltageChartPath);
  await createCurrentPowerChart(historicalData, currentPowerChartPath);
  
  // Persiapkan data untuk template
  const templateData = {
    timestamp: moment().format('dddd, D MMMM YYYY, HH:mm:ss'),
    server_name: serverData.server_info?.name || 'Server-DB-01',
    server_location: serverData.server_info?.location || 'Rack 3, Data Center Jakarta',
    uptime: serverData.server_info?.uptime || 'N/A',
    
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
    cpu_load: '68%', // Contoh nilai hardcoded, ganti dengan data aktual
    temperature: '45°C', // Contoh nilai hardcoded, ganti dengan data aktual
    efficiency: '92%', // Contoh nilai hardcoded, ganti dengan data aktual
    
    // Data konsumsi daya
    power_metrics: {
      daily: serverData.power_metrics?.dailyAvg || 'N/A',
      weekly: serverData.power_metrics?.weeklyAvg || 'N/A',
      monthly: serverData.power_metrics?.monthlyAvg || 'N/A'
    },
    
    // Data historis untuk grafik
    historical_data: JSON.stringify(historicalData),
    
    // Alert data
    alerts: serverData.alerts || []
  };
  
  // Render email HTML dengan template
  const html = template(templateData);
  
  // Konfigurasi email
  const mailOptions = {
    from: 'Jokowi@raja.jawa',
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
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Laporan berhasil dikirim:', info.messageId);
  } catch (error) {
    console.error('Error mengirim email:', error);
  }
}

// Jadwalkan pengiriman laporan setiap 23 jam
// Format cron: minute hour * * * 
// Misalnya 0 */23 * * * akan dijalankan setiap 23 jam dimulai dari jam 00:00
cron.schedule('0 */23 * * *', sendReport);

// Untuk testing, kirim laporan saat aplikasi dimulai
console.log('Sistem pelaporan email dimulai...');
sendReport();