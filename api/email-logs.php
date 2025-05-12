<?php
// File: api/email-logs.php
// API endpoint untuk mendapatkan log email

// Set header JSON
header('Content-Type: application/json');

// Default response
$response = [
    'success' => false,
    'logs' => [],
    'message' => 'No logs found'
];

// Set limit and offset
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// Pastikan nilai limit dan offset valid
$limit = max(1, min($limit, 100)); // Antara 1 dan 100
$offset = max(0, $offset);

// Fungsi untuk mendapatkan log email
function getEmailLogs($limit, $offset) {
    $logs = [];
    
    // Cek apakah file log ada
    $logFile = __DIR__ . '/../logs/email.log';
    if (!file_exists($logFile)) {
        return $logs;
    }
    
    // Baca file log
    $logContent = file_get_contents($logFile);
    $lines = explode("\n", $logContent);
    $lines = array_reverse(array_filter($lines)); // Reverse dan hapus baris kosong
    
    // Parse log lines
    $count = 0;
    foreach ($lines as $line) {
        if ($count >= $offset + $limit) {
            break;
        }
        
        if ($count >= $offset) {
            // Parse log line
            // Format: [2023-01-01 12:34:56] SUCCESS: Email scheduled to user@example.com - Subject
            if (preg_match('/\[(.*?)\] (SUCCESS|FAILED|ERROR): Email (.*?) to (.*?) - (.*)/', $line, $matches)) {
                $timestamp = $matches[1];
                $status = strtolower($matches[2]);
                $type = strtolower($matches[3]);
                $recipient = $matches[4];
                $subject = $matches[5];
                
                // Create log entry
                $logs[] = [
                    'timestamp' => $timestamp,
                    'status' => $status,
                    'type' => $type,
                    'recipient' => $recipient,
                    'subject' => $subject
                ];
            }
        }
        
        $count++;
    }
    
    return $logs;
}

// Fungsi untuk mendapatkan log dari Firebase
function getEmailLogsFromFirebase($limit, $offset) {
    global $firebaseConfig;
    
    // Jika tidak ada Firebase config, return empty
    if (!isset($firebaseConfig) || !$firebaseConfig) {
        return [];
    }
    
    // URL Firebase untuk email logs
    $url = $firebaseConfig['databaseURL'] . '/email_logs.json?limitToLast=' . ($limit + $offset);
    
    // Inisialisasi cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Kirim request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Parse response
    if ($httpCode >= 200 && $httpCode < 300) {
        $data = json_decode($response, true);
        
        // Jika tidak ada data, return empty
        if (!$data) {
            return [];
        }
        
        // Convert to array
        $logs = [];
        foreach ($data as $key => $log) {
            $logs[] = [
                'id' => $key,
                'timestamp' => $log['timestamp'],
                'status' => $log['status'],
                'type' => $log['type'],
                'recipient' => $log['recipient'],
                'subject' => $log['subject']
            ];
        }
        
        // Sort by timestamp, newest first
        usort($logs, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        // Apply offset
        $logs = array_slice($logs, $offset, $limit);
        
        return $logs;
    }
    
    return [];
}

// Get logs
try {
    // Try to get from Firebase first
    require_once '../includes/db-connect.php';
    $logs = getEmailLogsFromFirebase($limit, $offset);
    
    // If no logs from Firebase or error, try from local log file
    if (empty($logs)) {
        $logs = getEmailLogs($limit, $offset);
    }
    
    // Set response
    $response = [
        'success' => true,
        'logs' => $logs,
        'count' => count($logs),
        'limit' => $limit,
        'offset' => $offset
    ];
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ];
}

// Return response
echo json_encode($response);