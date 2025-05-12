const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Konfigurasi moment untuk Bahasa Indonesia
moment.locale('id');

// Register helper Handlebars
handlebars.registerHelper('eq', function (v1, v2) {
  return v1 === v2;
});

// Membaca template HTML
const templatePath = path.join(__dirname, '../email-template-simple.html');
const source = fs.readFileSync(templatePath, 'utf-8');
const template = handlebars.compile(source);

// Pastikan folder laporan ada
const reportsDir = path.join(__dirname, '../laporan');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// BARU: Konfigurasi transporter email dengan Ethereal (layanan email tes gratis)
let transporter = null;

// Fungsi untuk menghasilkan tabel HTML dari data
function generateDataTable(data, title, headers, rowsGenerator) {
  let tableHtml = `
    <div style="margin-top: 20px; margin-bottom: 20px;">
      <h3 style="color: #2563eb; font-size: 18px;">${title}</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
  `;
  
  // Add table headers
  headers.forEach(header => {
    tableHtml += `<th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">${header}</th>`;
  });
  
  tableHtml += `
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add table rows
  const rows = rowsGenerator(data);
  rows.forEach(row => {
    tableHtml += `<tr>`;
    row.forEach(cell => {
      tableHtml += `<td style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">${cell}</td>`;
    });
    tableHtml += `</tr>`;
  });
  
  tableHtml += `
        </tbody>
      </table>
    </div>
  `;
  
  return tableHtml;
}

// Fungsi untuk menghasilkan data simulasi
function generateSimulatedData() {
  console.log('Membuat data simulasi...');
  
  return {
    sensor_data: {
      Edel: 1.88 + Math.random() * 0.1,
      Iavg: 0.06249 + Math.random() * 0.005,
      Ptot: 0.01056 + Math.random() * 0.001,
      V1: 99.98767 + Math.random() * 0.5,
      V2: 101.4014 + Math.random() * 0.5,
      V3: 99.57052 + Math.random() * 0.5,
      Vavg: 57.92268 + Math.random() * 0.2,
    },
    server_info: {
      name: "Server-DB-01",
      location: "Rack 3, Data Center Jakarta",
      ip: "192.168.1.105",
      os: "Ubuntu Server 24.04 LTS",
      uptime: "23d 14h 35m",
      lastReboot: "2025-04-18 10:23:45"
    },
    power_metrics: {
      lastHour: [
        { time: "04:00", power: 1.02 },
        { time: "04:10", power: 1.05 },
        { time: "04:20", power: 1.08 },
        { time: "04:30", power: 1.06 },
        { time: "04:40", power: 1.12 },
        { time: "04:50", power: 1.15 },
      ],
      dailyAvg: 1.08,
      weeklyAvg: 1.10,
      monthlyAvg: 1.07
    },
    alerts: [
      { id: 1, timestamp: moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'), type: "WARNING", message: "Suhu server melebihi 50°C" },
      { id: 2, timestamp: moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss'), type: "INFO", message: "Voltase fase 2 fluktuatif" },
      { id: 3, timestamp: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'), type: "ERROR", message: "Connection timeout pada database endpoint" },
    ]
  };
}

// BARU: Fungsi untuk membuat akun email tes dengan Ethereal
async function createTestEmailAccount() {
  try {
    // Buat akun tes Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    // Konfigurasikan transporter dengan akun tes
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Akun email tes Ethereal berhasil dibuat');
    console.log('📧 Username: ' + testAccount.user);
    console.log('🔑 Password: ' + testAccount.pass);
    console.log('🌐 Message URL: https://ethereal.email/messages');
    console.log('Anda bisa melihat email yang dikirim di https://ethereal.email');
    console.log('Login dengan kredensial di atas\n');
    
    // Simpan kredensial untuk penggunaan selanjutnya
    fs.writeFileSync(path.join(__dirname, '../ethereal-credentials.json'), JSON.stringify({
      user: testAccount.user,
      pass: testAccount.pass,
      host: 'smtp.ethereal.email',
      port: 587
    }, null, 2));
    
    return testAccount;
  } catch (error) {
    console.error('❌ Gagal membuat akun email tes:', error.message);
    throw error;
  }
}

// BARU: Fungsi untuk mengambil atau membuat kredensial email
async function getEmailTransporter() {
  // Jika transporter sudah ada, gunakan yang ada
  if (transporter) {
    return transporter;
  }
  
  // Coba baca kredensial yang sudah tersimpan
  const credentialPath = path.join(__dirname, '../ethereal-credentials.json');
  if (fs.existsSync(credentialPath)) {
    try {
      const credentials = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
      transporter = nodemailer.createTransport({
        host: credentials.host,
        port: credentials.port,
        secure: false,
        auth: {
          user: credentials.user,
          pass: credentials.pass
        }
      });
      
      console.log('✅ Menggunakan kredensial Ethereal yang sudah ada');
      console.log('📧 Username: ' + credentials.user);
      console.log('🌐 Lihat email di: https://ethereal.email/messages');
      
      return transporter;
    } catch (error) {
      console.error('❌ Error saat membaca kredensial:', error.message);
      console.log('Membuat kredensial baru...');
    }
  }
  
  // Jika tidak bisa menggunakan kredensial yang ada, buat baru
  await createTestEmailAccount();
  return transporter;
}

// Fungsi untuk membuat laporan dan mengirimkan via email
async function generateAndSendReport() {
  console.log(`\n${moment().format('YYYY-MM-DD HH:mm:ss')} - Membuat dan mengirim laporan...`);
  
  try {
    // Mendapatkan data simulasi
    const serverData = generateSimulatedData();
    
    // Format timestamp saat ini
    const currentTimestamp = moment().format('dddd, D MMMM YYYY, HH:mm:ss');
    const fileTimestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    
    // Buat tabel untuk data sensor
    const sensorTable = generateDataTable(
      serverData.sensor_data,
      'Data Sensor Terkini',
      ['Parameter', 'Nilai'],
      (data) => {
        return Object.entries(data).map(([key, value]) => {
          let formattedValue = value;
          if (typeof value === 'number') {
            if (key === 'Edel') formattedValue = value.toFixed(2) + ' kWh';
            else if (key === 'Iavg') formattedValue = value.toFixed(5) + ' A';
            else if (key === 'Ptot') formattedValue = value.toFixed(5) + ' kW';
            else formattedValue = value.toFixed(2) + ' V';
          }
          return [key, formattedValue];
        });
      }
    );
    
    // Buat tabel untuk alert
    const alertsTable = generateDataTable(
      serverData.alerts,
      'Peringatan Terbaru',
      ['Waktu', 'Tipe', 'Pesan'],
      (data) => {
        return data.map(alert => {
          let typeWithStyle = alert.type;
          
          // Style untuk tipe alert
          if (alert.type === 'WARNING') {
            typeWithStyle = `<span style="background-color: #fff3c4; color: #92400e; padding: 3px 6px; border-radius: 4px; font-size: 12px;">WARNING</span>`;
          } else if (alert.type === 'ERROR') {
            typeWithStyle = `<span style="background-color: #fee2e2; color: #b91c1c; padding: 3px 6px; border-radius: 4px; font-size: 12px;">ERROR</span>`;
          } else if (alert.type === 'INFO') {
            typeWithStyle = `<span style="background-color: #dbeafe; color: #1d4ed8; padding: 3px 6px; border-radius: 4px; font-size: 12px;">INFO</span>`;
          }
          
          return [alert.timestamp, typeWithStyle, alert.message];
        });
      }
    );
    
    // Persiapkan data untuk template
    const templateData = {
      timestamp: currentTimestamp,
      server_name: serverData.server_info?.name || 'Server-DB-01',
      server_location: serverData.server_info?.location || 'Rack 3, Data Center Jakarta',
      uptime: serverData.server_info?.uptime || 'Data tidak tersedia',
      
      // Data sensor terbaru
      voltage: {
        v1: (serverData.sensor_data?.V1 || 99.99).toFixed(2),
        v2: (serverData.sensor_data?.V2 || 101.40).toFixed(2),
        v3: (serverData.sensor_data?.V3 || 99.57).toFixed(2),
        vavg: (serverData.sensor_data?.Vavg || 57.92).toFixed(2)
      },
      current: (serverData.sensor_data?.Iavg || 0.06249).toFixed(5),
      power: (serverData.sensor_data?.Ptot || 0.01056).toFixed(5),
      energy: (serverData.sensor_data?.Edel || 1.88).toFixed(2),
      
      // Data beban, suhu, dan efisiensi
      cpu_load: '68%',
      temperature: '45°C',
      efficiency: '92%',
      
      // Data konsumsi daya
      power_metrics: {
        daily: (serverData.power_metrics?.dailyAvg || 1.08).toFixed(2),
        weekly: (serverData.power_metrics?.weeklyAvg || 1.10).toFixed(2),
        monthly: (serverData.power_metrics?.monthlyAvg || 1.07).toFixed(2)
      },
      
      // Tabel tambahan
      sensorTable: sensorTable,
      alertsTable: alertsTable
    };
    
    // Render HTML dengan template
    const html = template(templateData);
    
    // Simpan ke file
    const reportPath = path.join(reportsDir, `laporan_${fileTimestamp}.html`);
    fs.writeFileSync(reportPath, html);
    console.log(`✅ Laporan HTML disimpan: ${reportPath}`);
    
    // Dapatkan transporter email
    const mailer = await getEmailTransporter();
    
    // Kirim email
    const info = await mailer.sendMail({
      from: '"ServerMonitor IoT" <Jokowi@raja.jawa>',
      to: 'pnm.monitoring.iot98@gmail.com',
      subject: `Laporan Monitoring Server - ${moment().format('DD/MM/YYYY HH:mm')}`,
      html: html
    });
    
    console.log(`✅ Email terkirim: ${info.messageId}`);
    console.log(`📧 Laporan berhasil dikirim ke: pnm.monitoring.iot98@gmail.com`);
    console.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`⏰ Laporan berikutnya akan dibuat dalam 23 jam`);
    
    return {
      reportPath,
      emailInfo: info
    };
  } catch (error) {
    console.error('❌ Error saat membuat/mengirim laporan:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    
    // Jika gagal mengirim email tapi berhasil membuat laporan, buka laporan
    try {
      const reportPath = path.join(reportsDir, `laporan_${moment().format('YYYY-MM-DD_HH-mm-ss')}.html`);
      if (fs.existsSync(reportPath)) {
        console.log(`📂 Laporan masih tersimpan di: ${reportPath}`);
        console.log('🔍 Mencoba membuka laporan di browser...');
        
        const open = require('open');
        open(reportPath);
      }
    } catch (e) {
      console.error('Gagal membuka laporan:', e.message);
    }
  }
}

// Jadwalkan pembuatan dan pengiriman laporan setiap 23 jam
// Format cron: minute hour * * * 
// 0 */23 * * * akan dijalankan setiap 23 jam dimulai dari jam 00:00
const cronSchedule = '0 */23 * * *';
cron.schedule(cronSchedule, generateAndSendReport);

// Log status awal
console.log('🚀 Sistem pembuatan dan pengiriman laporan dimulai...');
console.log(`⏱️  Jadwal: ${cronSchedule}`);
console.log(`📂 Lokasi laporan lokal: ${reportsDir}`);
console.log(`📧 Email tujuan: pnm.monitoring.iot98@gmail.com`);
console.log(`📤 Pengirim: Jokowi@raja.jawa (melalui Ethereal Email)`);

// Untuk testing, langsung buat dan kirim laporan saat aplikasi dimulai jika flag diberikan
if (process.argv.includes('--send-now')) {
  console.log('Flag --send-now terdeteksi. Membuat dan mengirim laporan sekarang...');
  generateAndSendReport();
} else {
  console.log('Untuk membuat dan mengirim laporan sekarang, jalankan:');
  console.log('node js/send-report.js --send-now');
}

module.exports = { generateAndSendReport };