<?php
// API endpoint untuk mengatur dan mengelola konfigurasi email

// Include email manager
require_once '../includes/email-manager.php';

// Set header JSON
header('Content-Type: application/json');

// Buat directory jika belum ada
if (!is_dir('../config')) {
    mkdir('../config', 0755, true);
}

// Izinkan akses hanya dengan request POST, PUT, atau GET
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Ambil konfigurasi email
        global $emailConfig;
        echo json_encode($emailConfig);
        break;
        
    case 'POST':
    case 'PUT':
        // Perbarui konfigurasi email
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);
        
        // Jika input tidak valid
        if (!$input) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON input'
            ]);
            exit;
        }
        
        // Validasi input
        validateEmailConfig($input);
        
        // Simpan konfigurasi
        $result = saveEmailConfig($input);
        
        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Konfigurasi email berhasil disimpan' : 'Gagal menyimpan konfigurasi email'
        ]);
        break;
        
    case 'DELETE':
        // Reset konfigurasi email ke default
        $configFile = __DIR__ . '/../config/email-config.json';
        
        if (file_exists($configFile)) {
            $result = unlink($configFile);
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Konfigurasi email berhasil direset' : 'Gagal mereset konfigurasi email'
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Konfigurasi email sudah dalam keadaan default'
            ]);
        }
        break;
        
    default:
        // Method tidak diizinkan
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
}

/**
 * Validasi konfigurasi email
 * 
 * @param array $config Konfigurasi yang akan divalidasi
 */
function validateEmailConfig(&$config) {
    // Validasi enabled
    if (isset($config['enabled'])) {
        $config['enabled'] = (bool)$config['enabled'];
    }
    
    // Validasi recipient
    if (isset($config['recipient'])) {
        if (!filter_var($config['recipient'], FILTER_VALIDATE_EMAIL)) {
            $config['recipient'] = 'pnm.monitoring.iot98@gmail.com'; // Default jika tidak valid
        }
    }
    
    // Validasi cc dan bcc
    if (isset($config['cc']) && !empty($config['cc'])) {
        if (!filter_var($config['cc'], FILTER_VALIDATE_EMAIL)) {
            $config['cc'] = ''; // Kosongkan jika tidak valid
        }
    }
    
    if (isset($config['bcc']) && !empty($config['bcc'])) {
        if (!filter_var($config['bcc'], FILTER_VALIDATE_EMAIL)) {
            $config['bcc'] = ''; // Kosongkan jika tidak valid
        }
    }
    
    // Validasi schedule
    if (isset($config['schedule'])) {
        $validSchedules = ['6_hours', '12_hours', '23_hours', '24_hours', 'custom'];
        if (!in_array($config['schedule'], $validSchedules)) {
            $config['schedule'] = '23_hours'; // Default jika tidak valid
        }
    }
    
    // Validasi custom interval
    if (isset($config['custom_interval'])) {
        $interval = intval($config['custom_interval']);
        if ($interval < 1) { // Minimal 1 detik
            $config['custom_interval'] = 1;
        } else {
            $config['custom_interval'] = $interval;
        }
    }
    
    // Validasi alert_enabled
    if (isset($config['alert_enabled'])) {
        $config['alert_enabled'] = (bool)$config['alert_enabled'];
    }
    
    // Validasi email_method
    if (isset($config['email_method'])) {
        $validMethods = ['php_mail', 'smtp', 'api'];
        if (!in_array($config['email_method'], $validMethods)) {
            $config['email_method'] = 'php_mail'; // Default jika tidak valid
        }
    }
    
    // Validasi SMTP settings jika metode SMTP
    if (isset($config['smtp_settings'])) {
        // Validasi host
        if (empty($config['smtp_settings']['host'])) {
            $config['smtp_settings']['host'] = '';
        }
        
        // Validasi port
        if (isset($config['smtp_settings']['port'])) {
            $port = intval($config['smtp_settings']['port']);
            if ($port < 1 || $port > 65535) {
                $config['smtp_settings']['port'] = 587; // Default port
            } else {
                $config['smtp_settings']['port'] = $port;
            }
        }
        
        // Validasi encryption
        if (isset($config['smtp_settings']['encryption'])) {
            $validEncryption = ['tls', 'ssl', ''];
            if (!in_array($config['smtp_settings']['encryption'], $validEncryption)) {
                $config['smtp_settings']['encryption'] = 'tls'; // Default encryption
            }
        }
    }
    
    // Validasi API settings jika metode API
    if (isset($config['api_settings'])) {
        // Validasi provider
        if (isset($config['api_settings']['provider'])) {
            $validProviders = ['sendgrid', 'mailgun', 'custom'];
            if (!in_array($config['api_settings']['provider'], $validProviders)) {
                $config['api_settings']['provider'] = 'sendgrid'; // Default provider
            }
        }
    }
}