const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const cron = require('node-cron');

// Inisialisasi Firebase Admin SDK jika belum diinisialisasi
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app/"
  });
}

const db = admin.database();

/**
 * Script untuk menyimpan data historis ke Firebase
 * Data ini akan digunakan untuk menampilkan grafik dalam email laporan
 * Jalankan script ini dari cron job setiap jam untuk menyimpan data historis
 */
async function saveHistoricalData() {
  try {
    console.log('Menyimpan data historis ke Firebase...');
    
    // Dapatkan data sensor terbaru
    const sensorSnapshot = await db.ref('/sensor_data').once('value');
    const sensorData = sensorSnapshot.val();
    
    if (!sensorData) {
      console.error('Tidak dapat menyimpan data historis: data sensor tidak tersedia');
      return;
    }
    
    // Siapkan data historis untuk disimpan
    const timestamp = new Date().toISOString();
    const historicalEntry = {
      timestamp: timestamp,
      datetime: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      V1: sensorData.V1 || 0,
      V2: sensorData.V2 || 0,
      V3: sensorData.V3 || 0,
      Iavg: sensorData.Iavg || 0,
      Ptot: sensorData.Ptot || 0,
      Edel: sensorData.Edel || 0
    };
    
    // Simpan data ke path historical_data dengan timestamp sebagai key
    const result = await db.ref('/historical_data').push(historicalEntry);
    
    console.log('Data historis berhasil disimpan dengan key:', result.key);
    
    // Opsional: Batasi jumlah data historis yang disimpan
    // Misalnya, hanya menyimpan 7 hari (168 jam) data terakhir
    await cleanupHistoricalData(168);
    
  } catch (error) {
    console.error('Error menyimpan data historis:', error);
  }
}

/**
 * Fungsi untuk membersihkan data historis lama
 * @param {number} keepHours - Jumlah jam data yang akan dipertahankan
 */
async function cleanupHistoricalData(keepHours) {
  try {
    // Dapatkan semua data historis
    const snapshot = await db.ref('/historical_data').once('value');
    const data = snapshot.val();
    
    if (!data) return;
    
    const entries = Object.entries(data);
    console.log(`Total data historis: ${entries.length}`);
    
    // Jika jumlah data kurang dari batas, tidak perlu membersihkan
    if (entries.length <= keepHours) return;
    
    // Urutkan berdasarkan timestamp
    entries.sort((a, b) => {
      return new Date(a[1].timestamp) - new Date(b[1].timestamp);
    });
    
    // Tentukan berapa banyak data yang akan dihapus
    const deleteCount = entries.length - keepHours;
    const toDelete = entries.slice(0, deleteCount);
    
    console.log(`Menghapus ${deleteCount} data historis lama...`);
    
    // Hapus data lama
    for (const [key] of toDelete) {
      await db.ref(`/historical_data/${key}`).remove();
    }
    
    console.log('Pembersihan data historis selesai');
  } catch (error) {
    console.error('Error membersihkan data historis:', error);
  }
}

// Jalankan penyimpanan data historis setiap jam
cron.schedule('0 * * * *', saveHistoricalData);

// Untuk testing, jalankan sekali saat memulai script
console.log('Sistem pencatatan data historis dimulai...');
saveHistoricalData();

module.exports = { saveHistoricalData };