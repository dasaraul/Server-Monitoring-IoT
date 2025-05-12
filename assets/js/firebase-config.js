const firebaseConfig = {
  apiKey: "AIzaSyDG-0wRwVgTPXj4UQvtbumkDR7EMoTl1qw",
  authDomain: "monitoringiotdashboard.firebaseapp.com",
  databaseURL: "https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoringiotdashboard",
  storageBucket: "monitoringiotdashboard.firebasestorage.app",
  messagingSenderId: "476099780519",
  appId: "1:476099780519:web:5a6c582bee65b33546a082",
  measurementId: "G-R4N0R78R3L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database references
const database = firebase.database();
const sensorDataRef = database.ref('sensor_data');

// Store last data and update time
let lastSensorData = null;
let lastUpdateTime = null;

// Update timestamp display
function updateTimestamp() {
  const now = new Date();
  const formattedTime = now.toLocaleString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  $('#last-update-time').text(formattedTime);
  lastUpdateTime = now;
}

// Monitor data changes
sensorDataRef.on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // Store last data
    lastSensorData = data;
    
    // Update timestamp
    updateTimestamp();
    
    // Update connection status
    updateConnectionStatus(true);
    
    // Trigger event for data update
    $(document).trigger('sensorDataUpdated', [data]);
  }
}, (error) => {
  console.error('Firebase Error:', error);
  updateConnectionStatus(false);
});

// Get last sensor data
function getLastSensorData() {
  return lastSensorData;
}

// Update connection status UI
function updateConnectionStatus(isConnected) {
  const statusElement = $('#connection-status');
  
  if (isConnected) {
    statusElement.removeClass('bg-danger bg-warning').addClass('bg-success');
    statusElement.html('<i class="fas fa-wifi"></i> Terhubung');
  } else {
    statusElement.removeClass('bg-success bg-warning').addClass('bg-danger');
    statusElement.html('<i class="fas fa-exclamation-triangle"></i> Terputus');
  }
}

// Check Firebase connection
firebase.database().ref('.info/connected').on('value', (snap) => {
  updateConnectionStatus(snap.val() === true);
});

// Check for data staleness (no updates for 30+ seconds)
setInterval(() => {
  if (lastUpdateTime) {
    const now = new Date();
    const diffSeconds = (now - lastUpdateTime) / 1000;
    
    if (diffSeconds > 30) {
      const statusElement = $('#connection-status');
      statusElement.removeClass('bg-success bg-danger').addClass('bg-warning');
      statusElement.html('<i class="fas fa-exclamation-triangle"></i> Tidak ada data baru');
    }
  }
}, 10000);