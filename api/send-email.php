<?php
// File: api/send-email.php
// API endpoint untuk mengirim email secara manual

// Include email manager
require_once '../includes/email-manager.php';
require_once '../includes/db-connect.php';

// Set header JSON
header('Content-Type: application/json');

// Handle only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get data from request
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// If no JSON input, try POST data
if (!$input) {
    $input = $_POST;
}

// Get email type (manual, alert, scheduled)
$emailType = isset($input['type']) ? $input['type'] : 'manual';

// Default response
$response = [
    'success' => false,
    'message' => 'Failed to send email'
];

// Get sensor data
$sensorData = null;

// If data provided in request, use it
if (isset($input['data']) && is_array($input['data'])) {
    $sensorData = $input['data'];
} else {
    // Otherwise get from database
    $sensorData = getCurrentSensorData();
}

// If no data available
if (!$sensorData) {
    $response = [
        'success' => false,
        'message' => 'No sensor data available'
    ];
} else {
    // Send email
    $result = sendEmailReport($sensorData, $emailType);
    $response = $result;
}

// Return response
echo json_encode($response);