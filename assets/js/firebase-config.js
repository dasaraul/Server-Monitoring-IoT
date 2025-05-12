// File: assets/js/firebase-config.js
// Konfigurasi Firebase untuk client-side
// Status: [new]

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDG-0wRwVgTPXj4UQvtbumkDR7EMoTl1qw",
    authDomain: "monitoringiotdashboard.firebaseapp.com", 
    databaseURL: "https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "monitoringiotdashboard",
    storageBucket: "monitoringiotdashboard.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
  };
  
  // Inisialisasi Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Referensi ke database 
  const database = firebase.database();
  const sensorDataRef = database.ref('sensor_data');
  
  // Simpan data terakhir
  let lastSensorData = null;
  let lastUpdateTime = null;
  
  // Fungsi untuk memperbarui timestamp
  function updateTimestamp() {
    const now = new Date();
    const formattedTime = `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    $('#last-update-time').text(formattedTime);
    lastUpdateTime = now;
  }
  
  // Memantau perubahan data
  sensorDataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Simpan data terakhir
      lastSensorData = data;
      
      // Perbarui timestamp
      updateTimestamp();
      
      // Perbarui status koneksi
      $('#connection-status').removeClass('bg-danger').addClass('bg-success');
      $('#connection-status i').removeClass('fa-exclamation-triangle').addClass('fa-wifi');
      $('#connection-status').html('<i class="fas fa-wifi"></i> Terhubung');
      
      // Trigger event untuk pembaruan data
      $(document).trigger('sensorDataUpdated', [data]);
    }
  }, (error) => {
    console.error('Error:', error);
    $('#connection-status').removeClass('bg-success').addClass('bg-danger');
    $('#connection-status i').removeClass('fa-wifi').addClass('fa-exclamation-triangle');
    $('#connection-status').html('<i class="fas fa-exclamation-triangle"></i> Terputus');
  });
  
  // Fungsi untuk mendapatkan data sensor terakhir
  function getLastSensorData() {
    return lastSensorData;
  }
  
  // Cek koneksi Firebase
  firebase.database().ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
      $('#connection-status').removeClass('bg-danger').addClass('bg-success');
      $('#connection-status i').removeClass('fa-exclamation-triangle').addClass('fa-wifi');
      $('#connection-status').html('<i class="fas fa-wifi"></i> Terhubung');
    } else {
      $('#connection-status').removeClass('bg-success').addClass('bg-danger');
      $('#connection-status i').removeClass('fa-wifi').addClass('fa-exclamation-triangle');
      $('#connection-status').html('<i class="fas fa-exclamation-triangle"></i> Terputus');
    }
  });