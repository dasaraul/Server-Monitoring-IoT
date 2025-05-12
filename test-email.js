// Skrip test untuk mengirim email tanpa cron job
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const moment = require('moment');

// Konfigurasi moment untuk Bahasa Indonesia
moment.locale('id');

// Konfigurasi email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Jokowi@raja.jawa',
    pass: 'password_email_anda' // Gunakan app password jika 2FA diaktifkan
  }
});

// Fungsi helper untuk handlebars
handlebars.registerHelper('eq', function (v1, v2) {
  return v1 === v2;
});

// Membaca template email
const emailTemplatePath = path.join(__dirname, 'email-template.html');
const source = fs.readFileSync(emailTemplatePath, 'utf-8');
const template = handlebars.compile(source);

// Data contoh untuk testing
const sampleData = {
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
  
  alerts: [
    { id: 1, timestamp: '2025-05-11 03:45:22', type: 'WARNING', message: 'Suhu server melebihi 50°C' },
    { id: 2, timestamp: '2025-05-10 22:12:04', type: 'INFO', message: 'Voltase fase 2 fluktuatif' },
    { id: 3, timestamp: '2025-05-09 14:30:16', type: 'ERROR', message: 'Connection timeout pada database endpoint' }
  ]
};

// Render template dengan data contoh
const html = template(sampleData);

// Konfigurasi email
const mailOptions = {
  from: 'Jokowi@raja.jawa',
  to: 'pnm.monitoring.iot98@gmail.com',
  subject: `[TEST] Laporan Monitoring Server - ${moment().format('DD/MM/YYYY HH:mm')}`,
  html: html
};

// Kirim email test
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error mengirim email test:', error);
  } else {
    console.log('Email test berhasil dikirim:', info.messageId);
  }
});