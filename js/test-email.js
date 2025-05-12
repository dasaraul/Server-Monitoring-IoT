const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');
require('dotenv').config();

// Konfigurasi moment untuk Bahasa Indonesia
moment.locale('id');

// Register helper Handlebars
handlebars.registerHelper('eq', function (v1, v2) {
  return v1 === v2;
});

// Membaca template email
const emailTemplatePath = path.join(__dirname, '../email-template-simple.html');
const source = fs.readFileSync(emailTemplatePath, 'utf-8');
const template = handlebars.compile(source);

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'Jokowi@raja.jawa',
    pass: process.env.EMAIL_PASSWORD || 'password_email_anda'
  }
});

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

// Data contoh untuk testing
const sampleData = {
  sensor_data: {
    Edel: 1.88,
    Iavg: 0.06249,
    Ptot: 0.01056,
    V1: 99.98767,
    V2: 101.4014,
    V3: 99.57052,
    Vavg: 57.92268,
  }
};

// Buat tabel untuk data sensor
const sensorTable = generateDataTable(
  sampleData.sensor_data,
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

// Data contoh untuk alerts
const alertsData = [
  { timestamp: moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss'), type: "WARNING", message: "Suhu server melebihi 50°C" },
  { timestamp: moment().subtract(5, 'hours').format('YYYY-MM-DD HH:mm:ss'), type: "INFO", message: "Voltase fase 2 fluktuatif" },
  { timestamp: moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss'), type: "ERROR", message: "Connection timeout pada database endpoint" }
];

// Buat tabel untuk alert
const alertsTable = generateDataTable(
  alertsData,
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

// Data contoh lengkap untuk template
const templateData = {
  timestamp: moment().format('dddd, D MMMM YYYY, HH:mm:ss'),
  server_name: 'Server-DB-01',
  server_location: 'Rack 3, Data Center Jakarta',
  uptime: '23d 14h 35m',
  
  voltage: {
    v1: '99.99',
    v2: '101.40',
    v3: '99.57',
    vavg: '57.92'
  },
  current: '0.06249',
  power: '0.01056',
  energy: '1.88',
  
  cpu_load: '68%',
  temperature: '45°C',
  efficiency: '92%',
  
  power_metrics: {
    daily: '1.08',
    weekly: '1.10',
    monthly: '1.07'
  },
  
  // Tabel tambahan
  sensorTable: sensorTable,
  alertsTable: alertsTable
};

async function sendTestEmail() {
  try {
    console.log('Persiapan pengiriman email test...');
    
    // Render email HTML dengan template
    const html = template(templateData);
    
    // Konfigurasi email
    const recipient = process.env.EMAIL_RECIPIENT || 'pnm.monitoring.iot98@gmail.com';
    const mailOptions = {
      from: `"ServerMonitor IoT" <${process.env.EMAIL_USER || 'Jokowi@raja.jawa'}>`,
      to: recipient,
      subject: `[TEST] Laporan Monitoring Server - ${moment().format('DD/MM/YYYY HH:mm')}`,
      html: html
    };
    
    // Kirim email
    console.log(`Mengirim email test ke ${recipient}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email test berhasil dikirim:', info.messageId);
    console.log(`📧 Email dikirim ke: ${recipient}`);
    
  } catch (error) {
    console.error('❌ Error mengirim email test:', error.message);
    console.error(error);
  }
}

// Jalankan fungsi test
console.log('🚀 Memulai pengiriman email test...');
sendTestEmail();