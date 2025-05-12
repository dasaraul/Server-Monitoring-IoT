<?php
// File: api/check-email.php
// API endpoint untuk memeriksa status pengiriman email dan jadwal

// Include email manager
require_once '../includes/email-manager.php';

// Set header JSON
header('Content-Type: application/json');

// Handle only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get global email config
global $emailConfig;

// Generate response
$response = [
    'success' => true,
    'enabled' => $emailConfig['enabled'],
    'recipient' => $emailConfig['recipient'],
    'schedule' => $emailConfig['schedule'],
    'custom_interval' => $emailConfig['custom_interval'],
    'last_sent' => $emailConfig['last_sent'],
    'alert_enabled' => $emailConfig['alert_enabled'],
    'email_method' => $emailConfig['email_method'],
    'next_scheduled' => calculateNextScheduledTime($emailConfig),
    'should_send' => isTimeToSendScheduledEmail()
];

// Return response
echo json_encode($response);

/**
 * Calculate the next scheduled time based on configuration
 * 
 * @param array $config Email configuration
 * @return string|null Next scheduled time in Y-m-d H:i:s format or null if not applicable
 */
function calculateNextScheduledTime($config) {
    // If email is disabled or no last sent time
    if (!$config['enabled'] || $config['last_sent'] === null) {
        return null;
    }
    
    // Get interval in seconds
    $interval = 0;
    switch ($config['schedule']) {
        case '6_hours':
            $interval = 6 * 3600; // 6 hours in seconds
            break;
        case '12_hours':
            $interval = 12 * 3600; // 12 hours in seconds
            break;
        case '23_hours':
            $interval = 23 * 3600; // 23 hours in seconds
            break;
        case '24_hours':
            $interval = 24 * 3600; // 24 hours in seconds
            break;
        case 'custom':
            $interval = $config['custom_interval']; // Custom interval in seconds
            break;
    }
    
    // Calculate next time
    $lastSentTimestamp = strtotime($config['last_sent']);
    $nextTimestamp = $lastSentTimestamp + $interval;
    
    // Return as formatted date
    return date('Y-m-d H:i:s', $nextTimestamp);
}