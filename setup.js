#!/usr/bin/env node

/**
 * Setup script untuk sistem pelaporan email ServerMonitor IoT
 * Script ini akan membantu pengguna mengkonfigurasi sistem pelaporan email
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n====================================================');
console.log('🚀 SETUP SISTEM PELAPORAN EMAIL SERVERMONITOR IOT 🚀');
console.log('====================================================\n');

console.log('Script ini akan membantu Anda mengkonfigurasi sistem pelaporan email.\n');

// Variabel untuk menyimpan konfigurasi
let config = {
  emailUser: 'Jokowi@raja.jawa',
  emailPassword: '',
  emailRecipient: 'pnm.monitoring.iot98@gmail.com',
  firebaseUrl: 'https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/',
  reportSchedule: '0 */23 * * *',
  historicalSchedule: '0 * * * *',
  dataRetention: '168'
};

// Langkah 1: Konfigurasi email
function setupEmailConfig() {
  console.log('📧 KONFIGURASI EMAIL\n');
  
  rl.question(`Email pengirim laporan [${config.emailUser}]: `, (answer) => {
    config.emailUser = answer || config.emailUser;
    
    rl.question('Password email (untuk autentikasi Gmail): ', (answer) => {
      config.emailPassword = answer || config.emailPassword;
      
      rl.question(`Email penerima laporan [${config.emailRecipient}]: `, (answer) => {
        config.emailRecipient = answer || config.emailRecipient;
        
        setupFirebaseConfig();
      });
    });
  });
}

// Langkah 2: Konfigurasi Firebase
function setupFirebaseConfig() {
  console.log('\n🔥 KONFIGURASI FIREBASE\n');
  
  rl.question(`URL Firebase Realtime Database [${config.firebaseUrl}]: `, (answer) => {
    config.firebaseUrl = answer || config.firebaseUrl;
    
    console.log('\nPerhatian: Pastikan file serviceAccountKey.json tersedia di folder js/');
    rl.question('Apakah Anda sudah memiliki file serviceAccountKey.json? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'n') {
        console.log('\n⚠️  Anda perlu mendapatkan file serviceAccountKey.json dari Firebase Console:');
        console.log('1. Buka https://console.firebase.google.com/');
        console.log('2. Pilih project Anda');
        console.log('3. Buka Project Settings > Service Accounts');
        console.log('4. Klik "Generate new private key"');
        console.log('5. Simpan file JSON yang diunduh sebagai "js/serviceAccountKey.json"');
        
        rl.question('\nTekan Enter setelah Anda menyiapkan file serviceAccountKey.json...', () => {
          setupScheduleConfig();
        });
      } else {
        setupScheduleConfig();
      }
    });
  });
}

// Langkah 3: Konfigurasi Jadwal
function setupScheduleConfig() {
  console.log('\n⏰ KONFIGURASI JADWAL\n');
  
  console.log('Format cron: menit jam hari bulan hari-minggu');
  console.log('Contoh: "0 */23 * * *" = setiap 23 jam pada menit ke-0');
  
  rl.question(`Jadwal pengiriman laporan [${config.reportSchedule}]: `, (answer) => {
    config.reportSchedule = answer || config.reportSchedule;
    
    console.log('\nFormat cron: menit jam hari bulan hari-minggu');
    console.log('Contoh: "0 * * * *" = setiap jam pada menit ke-0');
    
    rl.question(`Jadwal pengumpulan data historis [${config.historicalSchedule}]: `, (answer) => {
      config.historicalSchedule = answer || config.historicalSchedule;
      
      rl.question(`Retensi data historis (jam) [${config.dataRetention}]: `, (answer) => {
        config.dataRetention = answer || config.dataRetention;
        
        generateEnvFile();
      });
    });
  });
}

// Langkah 4: Buat file .env
function generateEnvFile() {
  console.log('\n📝 MEMBUAT FILE KONFIGURASI\n');
  
  const envContent = `# Konfigurasi email
EMAIL_USER=${config.emailUser}
EMAIL_PASSWORD=${config.emailPassword}

# Konfigurasi Firebase
FIREBASE_DATABASE_URL=${config.firebaseUrl}

# Konfigurasi email penerima
EMAIL_RECIPIENT=${config.emailRecipient}

# Konfigurasi jadwal
REPORT_CRON_SCHEDULE=${config.reportSchedule}
HISTORICAL_CRON_SCHEDULE=${config.historicalSchedule}

# Konfigurasi retensi data
HISTORICAL_DATA_RETENTION_HOURS=${config.dataRetention}
`;

  try {
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ File .env berhasil dibuat!');
    
    installDependencies();
  } catch (error) {
    console.error('❌ Gagal membuat file .env:', error);
    finishSetup();
  }
}

// Langkah 5: Instal dependensi
function installDependencies() {
  console.log('\n📦 INSTALASI DEPENDENSI\n');
  
  rl.question('Apakah Anda ingin menginstal dependensi yang diperlukan? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('Menginstal dependensi...');
      
      exec('npm install', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Gagal menginstal dependensi:', error);
        } else {
          console.log('✅ Dependensi berhasil diinstal!');
          console.log(stdout);
        }
        
        testConfiguration();
      });
    } else {
      testConfiguration();
    }
  });
}

// Langkah 6: Uji konfigurasi
function testConfiguration() {
  console.log('\n🧪 UJI KONFIGURASI\n');
  
  rl.question('Apakah Anda ingin mengirim email test? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('Mengirim email test...');
      
      exec('node js/test-email.js', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Gagal mengirim email test:', error);
          console.error(stderr);
        } else {
          console.log('✅ Email test berhasil dikirim!');
          console.log(stdout);
        }
        
        finishSetup();
      });
    } else {
      finishSetup();
    }
  });
}

// Selesai
function finishSetup() {
  console.log('\n🎉 SETUP SELESAI!\n');
  
  console.log('Untuk menjalankan sistem pelaporan:');
  console.log('npm run start       # Jalankan sistem pelaporan email');
  console.log('npm run historical  # Jalankan pengumpulan data historis');
  console.log('npm run all         # Jalankan keduanya sekaligus');
  console.log('npm run test        # Kirim email test\n');
  
  console.log('Untuk informasi lebih lanjut, silakan baca README-Reporter.md\n');
  
  rl.close();
}

// Mulai setup
setupEmailConfig();