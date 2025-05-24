<?php
// File: cron/email-checker.php
// Script untuk memeriksa dan mengirim email terjadwal dan alert

// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Import files
require_once __DIR__ . '/../includes/email-manager.php';
require_once __DIR__ . '/../includes/db-connect.php';

// Log file
$logFile = __DIR__ . '/email_checker.log';
$logMessage = date('Y-m-d H:i:s') . " - Email checker started\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Check if it's time for scheduled email
if (isTimeToSendScheduledEmail()) {
    // Get data
    $sensorData = getCurrentSensorData();
    
    if ($sensorData) {
        // Send scheduled email
        $result = sendEmailReport($sensorData, 'scheduled');
        
        // Log result
        $logMessage = date('Y-m-d H:i:s') . " - Scheduled email: " . ($result['success'] ? "Success" : "Failed") . " - " . $result['message'] . "\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    } else {
        // Log no data
        $logMessage = date('Y-m-d H:i:s') . " - Scheduled email: Failed - No sensor data available\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }
}

// Check for alert conditions
global $emailConfig;

if ($emailConfig['alert_enabled']) {
    // Get data
    $sensorData = getCurrentSensorData();
    
    if ($sensorData && checkForAlertConditions($sensorData)) {
        // Send alert email
        $result = sendEmailReport($sensorData, 'alert');
        
        // Log result
        $logMessage = date('Y-m-d H:i:s') . " - Alert email: " . ($result['success'] ? "Success" : "Failed") . " - " . $result['message'] . "\n";
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }
}

// Log completion
$logMessage = date('Y-m-d H:i:s') . " - Email checker completed\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);