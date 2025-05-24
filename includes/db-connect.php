<?php
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

/**
 * Mendapatkan data dari Firebase dengan REST API
 * 
 * @param string $path Path di database
 * @return array|null Data dalam bentuk array
 */
function getFirebaseData($path = 'sensor_data') {
    global $firebaseConfig;
    
    $url = $firebaseConfig['databaseURL'] . '/' . $path . '.json';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Check if request successful
    if ($httpCode >= 200 && $httpCode < 300) {
        return json_decode($response, true);
    }
    
    // Log error
    error_log('Firebase Error: ' . $response . ' (HTTP ' . $httpCode . ')');
    return null;
}

/**
 * Mendapatkan semua data historis
 * 
 * @return array|null Data historis
 */
function getHistoricalData() {
    return getFirebaseData('sensor_history');
}

/**
 * Mendapatkan data sensor terkini
 * 
 * @return array|null Data sensor terkini
 */
function getCurrentSensorData() {
    return getFirebaseData('sensor_data');
}

/**
 * Mendapatkan log email
 * 
 * @param int $limit Batas jumlah log
 * @return array|null Data log email
 */
function getEmailLogs($limit = 10) {
    $logs = getFirebaseData('email_logs');
    
    if (!$logs) {
        return null;
    }
    
    // Sort logs by timestamp (newest first)
    usort($logs, function($a, $b) {
        $timeA = strtotime($a['timestamp'] ?? 0);
        $timeB = strtotime($b['timestamp'] ?? 0);
        return $timeB - $timeA; 
    });
    
    // Limit results
    return array_slice($logs, 0, $limit);
}