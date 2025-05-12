<?php
// File: includes/db-connect.php
// Digunakan untuk koneksi ke Firebase
// Status: [new]

// Konfigurasi Firebase
$firebaseConfig = [
    'apiKey' => "AIzaSyDG-0wRwVgTPXj4UQvtbumkDR7EMoTl1qw",
    'authDomain' => "monitoringiotdashboard.firebaseapp.com",
    'databaseURL' => "https://monitoringiotdashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
    'projectId' => "monitoringiotdashboard",
    'storageBucket' => "monitoringiotdashboard.firebasestorage.app",
    'messagingSenderId' => "476099780519",
    'appId' => "1:476099780519:web:5a6c582bee65b33546a082",
    'measurementId' => "G-R4N0R78R3L"
];

// Fungsi untuk mendapatkan data dari Firebase menggunakan REST API
function getFirebaseData($path = 'sensor_data') {
    global $firebaseConfig;
    
    $url = $firebaseConfig['databaseURL'] . '/' . $path . '.json';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Fungsi untuk mendapatkan semua data historis (jika ada)
function getHistoricalData() {
    return getFirebaseData('sensor_history');
}

// Fungsi untuk mendapatkan data sensor terkini
function getCurrentSensorData() {
    return getFirebaseData('sensor_data');
}