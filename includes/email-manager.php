<?php
// File: includes/email-manager.php
// Script untuk mengelola pengiriman email

// Konfigurasi email default
$emailConfig = [
    'enabled' => true,
    'recipient' => 'pnm.monitoring.iot98@gmail.com',
    'cc' => '',
    'bcc' => '',
    'schedule' => '23_hours', // 6_hours, 12_hours, 23_hours, 24_hours, custom
    'custom_interval' => 0, // Dalam detik, untuk pengaturan kustom
    'alert_enabled' => true,
    'last_sent' => null,
    'email_method' => 'php_mail', // php_mail, smtp, api
    'smtp_settings' => [
        'host' => '',
        'port' => 587,
        'username' => '',
        'password' => '',
        'encryption' => 'tls' // tls, ssl
    ],
    'api_settings' => [
        'provider' => 'sendgrid', // sendgrid, mailgun, etc.
        'api_key' => '',
        'api_url' => ''
    ]
];

/**
 * Inisialisasi konfigurasi email
 */
function initEmailConfig() {
    global $emailConfig;
    
    // Coba load konfigurasi dari database atau file
    $configFile = __DIR__ . '/../config/email-config.json';
    
    if (file_exists($configFile)) {
        $savedConfig = json_decode(file_get_contents($configFile), true);
        if ($savedConfig) {
            // Gabungkan konfigurasi yang disimpan dengan default
            $emailConfig = array_merge($emailConfig, $savedConfig);
        }
    }
}

/**
 * Simpan konfigurasi email
 * 
 * @param array $newConfig Konfigurasi baru
 * @return bool Sukses/gagal
 */
function saveEmailConfig($newConfig) {
    global $emailConfig;
    
    // Gabungkan konfigurasi baru dengan yang ada
    $emailConfig = array_merge($emailConfig, $newConfig);
    
    // Simpan ke file
    $configFile = __DIR__ . '/../config/email-config.json';
    $configDir = dirname($configFile);
    
    // Buat direktori jika belum ada
    if (!is_dir($configDir)) {
        mkdir($configDir, 0755, true);
    }
    
    // Tulis ke file
    $result = file_put_contents($configFile, json_encode($emailConfig, JSON_PRETTY_PRINT));
    
    return $result !== false;
}

/**
 * Cek apakah saatnya mengirim email terjadwal
 * 
 * @return bool True jika saatnya mengirim email
 */
function isTimeToSendScheduledEmail() {
    global $emailConfig;
    
    // Jika fitur email dinonaktifkan
    if (!$emailConfig['enabled']) {
        return false;
    }
    
    // Jika belum pernah mengirim
    if ($emailConfig['last_sent'] === null) {
        return true;
    }
    
    // Waktu sekarang
    $now = time();
    $lastSent = strtotime($emailConfig['last_sent']);
    $diff = $now - $lastSent;
    
    // Tentukan interval berdasarkan jadwal
    $interval = 0;
    switch ($emailConfig['schedule']) {
        case '6_hours':
            $interval = 6 * 3600; // 6 jam dalam detik
            break;
        case '12_hours':
            $interval = 12 * 3600; // 12 jam dalam detik
            break;
        case '23_hours':
            $interval = 23 * 3600; // 23 jam dalam detik
            break;
        case '24_hours':
            $interval = 24 * 3600; // 24 jam dalam detik
            break;
        case 'custom':
            $interval = $emailConfig['custom_interval']; // Interval kustom dalam detik
            break;
    }
    
    // Cek apakah waktu yang berlalu lebih besar dari interval
    return $diff >= $interval;
}

/**
 * Kirim email laporan
 * 
 * @param array $data Data sensor untuk laporan
 * @param string $type Tipe laporan (scheduled, manual, alert)
 * @return array Status pengiriman (success, message)
 */
function sendEmailReport($data, $type = 'scheduled') {
    global $emailConfig;
    
    // Jika email dinonaktifkan dan ini bukan alert atau bukan email manual
    if (!$emailConfig['enabled'] && $type === 'scheduled') {
        return [
            'success' => false,
            'message' => 'Pengiriman email nonaktif'
        ];
    }
    
    // Jika ini email alert tapi alert dinonaktifkan
    if ($type === 'alert' && !$emailConfig['alert_enabled']) {
        return [
            'success' => false,
            'message' => 'Notifikasi email untuk kondisi kritis dinonaktifkan'
        ];
    }
    
    // Set penerima
    $to = $emailConfig['recipient'];
    
    // Set subject berdasarkan tipe
    switch ($type) {
        case 'scheduled':
            $subject = "Laporan Terjadwal Monitoring IoT - " . date('d/m/Y H:i');
            break;
        case 'manual':
            $subject = "Laporan Manual Monitoring IoT - " . date('d/m/Y H:i');
            break;
        case 'alert':
            $subject = "ALERT! Kondisi Kritis Terdeteksi - " . date('d/m/Y H:i');
            break;
        default:
            $subject = "Laporan Monitoring IoT - " . date('d/m/Y H:i');
    }
    
    // Buat konten email
    $content = createEmailContent($data, $type);
    
    // Header email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Monitoring IoT <KORUPTOR KONTOL>" . "\r\n";
    
    // Tambahkan CC jika ada
    if (!empty($emailConfig['cc'])) {
        $headers .= "Cc: " . $emailConfig['cc'] . "\r\n";
    }
    
    // Tambahkan BCC jika ada
    if (!empty($emailConfig['bcc'])) {
        $headers .= "Bcc: " . $emailConfig['bcc'] . "\r\n";
    }
    
    // Pilih metode pengiriman
    $result = false;
    $errorMessage = '';
    
    switch ($emailConfig['email_method']) {
        case 'php_mail':
            $result = mail($to, $subject, $content, $headers);
            break;
            
        case 'smtp':
            $result = sendEmailViaSmtp($to, $subject, $content, $headers);
            break;
            
        case 'api':
            $result = sendEmailViaApi($to, $subject, $content);
            break;
    }
    
    // Update waktu pengiriman terakhir jika berhasil dan ini adalah email terjadwal
    if ($result && $type === 'scheduled') {
        $emailConfig['last_sent'] = date('Y-m-d H:i:s');
        saveEmailConfig(['last_sent' => $emailConfig['last_sent']]);
        
        // Simpan log ke database atau file
        logEmailSent($to, $subject, 'success', $type);
    } elseif (!$result) {
        // Log error
        logEmailSent($to, $subject, 'failed', $type, $errorMessage);
    }
    
    return [
        'success' => $result,
        'message' => $result ? 'Email berhasil dikirim ke ' . $to : 'Gagal mengirim email: ' . $errorMessage
    ];
}

/**
 * Kirim email menggunakan SMTP
 * 
 * @param string $to Penerima
 * @param string $subject Subjek
 * @param string $content Konten HTML
 * @param string $headers Header email
 * @return bool Sukses/gagal
 */
function sendEmailViaSmtp($to, $subject, $content, $headers) {
    global $emailConfig;
    
    // Untuk implementasi sebenarnya, gunakan library seperti PHPMailer
    // Berikut adalah contoh kerangka kode untuk koneksi SMTP
    
    try {
        // Contoh menggunakan PHPMailer
        // require 'vendor/autoload.php';
        // $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        // $mail->isSMTP();
        // $mail->Host = $emailConfig['smtp_settings']['host'];
        // $mail->SMTPAuth = true;
        // $mail->Username = $emailConfig['smtp_settings']['username'];
        // $mail->Password = $emailConfig['smtp_settings']['password'];
        // $mail->SMTPSecure = $emailConfig['smtp_settings']['encryption'];
        // $mail->Port = $emailConfig['smtp_settings']['port'];
        // $mail->setFrom('KORUPTOR KONTOL', 'Monitoring IoT');
        // $mail->addAddress($to);
        // $mail->Subject = $subject;
        // $mail->isHTML(true);
        // $mail->Body = $content;
        // return $mail->send();
        
        // Untuk demo, gunakan mail() sebagai fallback
        return mail($to, $subject, $content, $headers);
        
    } catch (Exception $e) {
        error_log('Error sending SMTP email: ' . $e->getMessage());
        return false;
    }
}

/**
 * Kirim email menggunakan API (Sendgrid, Mailgun, dll)
 * 
 * @param string $to Penerima
 * @param string $subject Subjek
 * @param string $content Konten HTML
 * @return bool Sukses/gagal
 */
function sendEmailViaApi($to, $subject, $content) {
    global $emailConfig;
    
    // Untuk implementasi sebenarnya, gunakan API vendor email
    // Berikut adalah contoh kerangka kode untuk API Sendgrid
    
    try {
        switch ($emailConfig['api_settings']['provider']) {
            case 'sendgrid':
                // Contoh kode untuk Sendgrid
                // require 'vendor/autoload.php';
                // $email = new \SendGrid\Mail\Mail();
                // $email->setFrom("KORUPTOR KONTOL", "Monitoring IoT");
                // $email->setSubject($subject);
                // $email->addTo($to);
                // $email->addContent("text/html", $content);
                // $sendgrid = new \SendGrid($emailConfig['api_settings']['api_key']);
                // $response = $sendgrid->send($email);
                // return $response->statusCode() >= 200 && $response->statusCode() < 300;
                
            case 'mailgun':
                // Contoh kode untuk Mailgun
                // $ch = curl_init();
                // curl_setopt($ch, CURLOPT_URL, $emailConfig['api_settings']['api_url']);
                // curl_setopt($ch, CURLOPT_USERPWD, 'api:' . $emailConfig['api_settings']['api_key']);
                // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                // curl_setopt($ch, CURLOPT_POST, true);
                // curl_setopt($ch, CURLOPT_POSTFIELDS, [
                //     'from' => 'Monitoring IoT <KORUPTOR KONTOL>',
                //     'to' => $to,
                //     'subject' => $subject,
                //     'html' => $content
                // ]);
                // $result = json_decode(curl_exec($ch));
                // curl_close($ch);
                // return isset($result->id);
                
            default:
                // Fallback ke mail() untuk demo
                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= "From: Monitoring IoT <KORUPTOR KONTOL>" . "\r\n";
                return mail($to, $subject, $content, $headers);
        }
    } catch (Exception $e) {
        error_log('Error sending API email: ' . $e->getMessage());
        return false;
    }
}

/**
 * Buat konten email HTML
 * 
 * @param array $data Data sensor
 * @param string $type Tipe laporan
 * @return string Konten HTML
 */
function createEmailContent($data, $type = 'scheduled') {
    // Tanggal dan waktu
    $dateTime = date('d/m/Y H:i:s');
    
    // Header email berdasarkan tipe
    $headerText = '';
    $alertClass = '';
    $alertMessage = '';
    
    switch ($type) {
        case 'scheduled':
            $headerText = 'Laporan Terjadwal Monitoring IoT';
            $alertClass = 'alert-info';
            $alertMessage = 'Berikut adalah laporan terjadwal dari sistem monitoring IoT pada tanggal dan waktu yang ditentukan.';
            break;
        case 'manual':
            $headerText = 'Laporan Manual Monitoring IoT';
            $alertClass = 'alert-info';
            $alertMessage = 'Berikut adalah laporan manual dari sistem monitoring IoT pada saat ini.';
            break;
        case 'alert':
            $headerText = 'ALERT! Kondisi Kritis Terdeteksi';
            $alertClass = 'alert-danger';
            $alertMessage = 'Perhatian! Sistem mendeteksi kondisi kritis yang memerlukan penanganan segera. Silakan periksa detail dibawah ini.';
            break;
    }
    
    // Mulai HTML
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
            .header { background-color: #000000; padding: 20px; border-bottom: 3px solid #1DCD9F; color: #ffffff; }
            .content { padding: 20px; }
            .footer { background-color: #000000; padding: 20px; text-align: center; font-size: 12px; color: #ffffff; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #1DCD9F; color: white; text-align: left; padding: 10px; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }
            .alert-info { background-color: #d1ecf1; color: #0c5460; }
            .alert-danger { background-color: #f8d7da; color: #721c24; }
            .alert-warning { background-color: #fff3cd; color: #856404; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1DCD9F; }
            .chart-img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .status-normal { color: #28a745; }
            .status-warning { color: #ffc107; }
            .status-danger { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>' . $headerText . '</h1>
            <p>Laporan pada <strong>' . $dateTime . '</strong></p>
        </div>
        <div class="content">
            <div class="alert ' . $alertClass . '">
                <p>' . $alertMessage . '</p>
            </div>
            
            <h2>Data Pembacaan Sensor</h2>
            <table>
                <tr>
                    <th>Parameter</th>
                    <th>Nilai</th>
                    <th>Status</th>
                </tr>';
    
    // Cek parameter dan batas untuk alert
    $thresholds = [
        'Vavg' => ['min' => 200, 'max' => 240, 'unit' => 'V'],
        'Iavg' => ['min' => 0, 'max' => 5, 'unit' => 'A'],
        'Ptot' => ['min' => 0, 'max' => 3, 'unit' => 'kW'],
        'V1' => ['min' => 200, 'max' => 240, 'unit' => 'V'],
        'V2' => ['min' => 200, 'max' => 240, 'unit' => 'V'],
        'V3' => ['min' => 200, 'max' => 240, 'unit' => 'V']
    ];
    
    // Tambahkan data ke tabel
    $alertParams = [];
    
    foreach ($thresholds as $param => $limits) {
        if (isset($data[$param])) {
            $value = floatval($data[$param]);
            $formatted = number_format($value, 2);
            $unit = $limits['unit'];
            
            // Cek status
            $status = '';
            $statusColor = '';
            
            if ($value < $limits['min']) {
                $status = 'Rendah';
                $statusColor = 'status-danger';
                if ($type === 'alert') {
                    $alertParams[] = "$param: $formatted $unit (di bawah batas minimum {$limits['min']} $unit)";
                }
            } else if ($value > $limits['max']) {
                $status = 'Tinggi';
                $statusColor = 'status-danger';
                if ($type === 'alert') {
                    $alertParams[] = "$param: $formatted $unit (di atas batas maksimum {$limits['max']} $unit)";
                }
            } else {
                $status = 'Normal';
                $statusColor = 'status-normal';
            }
            
            // Label parameter
            $paramLabel = $param;
            switch ($param) {
                case 'Vavg': $paramLabel = 'Tegangan Rata-rata'; break;
                case 'Iavg': $paramLabel = 'Arus Rata-rata'; break;
                case 'Ptot': $paramLabel = 'Daya Total'; break;
                case 'Edel': $paramLabel = 'Energi Terpakai'; break;
                case 'V1': $paramLabel = 'Tegangan Fase 1'; break;
                case 'V2': $paramLabel = 'Tegangan Fase 2'; break;
                case 'V3': $paramLabel = 'Tegangan Fase 3'; break;
            }
            
            $html .= '<tr><td>' . $paramLabel . '</td><td>' . $formatted . ' ' . $unit . '</td><td><span class="' . $statusColor . '">' . $status . '</span></td></tr>';
        }
    }
    
    // Tambahkan info energi jika ada
    if (isset($data['Edel'])) {
        $html .= '<tr><td>Energi Terpakai</td><td>' . number_format($data['Edel'], 2) . ' kWh</td><td>-</td></tr>';
    }
    
    // Tambahkan detail alert jika tipe email adalah alert
    if ($type === 'alert' && count($alertParams) > 0) {
        $html .= '
            </table>
            
            <h2>Detail Kondisi Kritis</h2>
            <div style="padding: 15px; background-color: #f8d7da; border-radius: 4px; margin-bottom: 20px; color: #721c24;">
                <h3>Parameter yang melebihi batas:</h3>
                <ul>';
        
        foreach ($alertParams as $param) {
            $html .= '<li>' . $param . '</li>';
        }
        
        $html .= '
                </ul>
                <p><strong>Tindakan yang disarankan:</strong> Periksa perangkat dan parameter yang berada di luar batas normal.</p>
            </div>';
    } else {
        $html .= '
            </table>
            
            <h2>Ringkasan Status Sistem</h2>
            <div style="padding: 15px; background-color: #e9f7ef; border-radius: 4px; margin-bottom: 20px;">
                <h3 style="color: #1DCD9F;">Status: ' . getSystemStatusText($data) . '</h3>
                <p>Kondisi sistem monitoring IoT secara keseluruhan saat ini menunjukkan status normal.</p>
                <p>Total energi terpakai saat ini: <strong>' . number_format($data['Edel'] ?? 0, 2) . ' kWh</strong></p>
            </div>';
    }
    
    // Tambahkan catatan
    $html .= '
            <div class="alert alert-warning">
                <p><strong>Catatan:</strong> ';
    
    if ($type === 'scheduled') {
        $html .= 'Email ini dibuat secara otomatis sesuai jadwal yang ditentukan.';
    } else if ($type === 'manual') {
        $html .= 'Email ini dibuat secara manual oleh administrator.';
    } else if ($type === 'alert') {
        $html .= 'Email ini dikirim otomatis karena sistem mendeteksi kondisi kritis.';
    }
    
    $html .= ' Untuk melihat data realtime dan grafik lengkap, silakan kunjungi dashboard monitoring.</p>
            </div>
        </div>
        <div class="footer">
            <p>Monitoring IoT by Diky Aditia &copy; ' . date('Y') . '</p>
            <p>Email ini dikirim secara otomatis, harap jangan membalas email ini.</p>
        </div>
    </body>
    </html>';
    
    return $html;
}

/**
 * Cek apakah ada kondisi yang memerlukan email alert
 * 
 * @param array $data Data sensor
 * @return bool True jika ada kondisi alert
 */
function checkForAlertConditions($data) {
    // Cek parameter dan batas untuk alert
    $thresholds = [
        'Vavg' => ['min' => 200, 'max' => 240],
        'Iavg' => ['min' => 0, 'max' => 5],
        'Ptot' => ['min' => 0, 'max' => 3],
        'V1' => ['min' => 200, 'max' => 240],
        'V2' => ['min' => 200, 'max' => 240],
        'V3' => ['min' => 200, 'max' => 240]
    ];
    
    foreach ($thresholds as $param => $limits) {
        if (isset($data[$param])) {
            $value = floatval($data[$param]);
            
            // Cek apakah nilai di luar batas
            if ($value < $limits['min'] || $value > $limits['max']) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Mendapatkan status sistem keseluruhan
 * 
 * @param array $data Data sensor
 * @return string Status sistem
 */
function getSystemStatusText($data) {
    // Cek nilai-nilai kritis
    $criticalParams = ['Vavg', 'Iavg', 'Ptot', 'V1', 'V2', 'V3'];
    $thresholds = [
        'Vavg' => ['min' => 200, 'max' => 240],
        'Iavg' => ['min' => 0, 'max' => 5],
        'Ptot' => ['min' => 0, 'max' => 3],
        'V1' => ['min' => 200, 'max' => 240],
        'V2' => ['min' => 200, 'max' => 240],
        'V3' => ['min' => 200, 'max' => 240]
    ];
    
    $normalCount = 0;
    $criticalCount = 0;
    
    foreach ($criticalParams as $param) {
        if (isset($data[$param])) {
            $value = floatval($data[$param]);
            $limits = $thresholds[$param];
            
            if ($value >= $limits['min'] && $value <= $limits['max']) {
                $normalCount++;
            } else {
                $criticalCount++;
            }
        }
    }
    
    // Tentukan status berdasarkan jumlah parameter normal dan kritis
    if ($criticalCount == 0) {
        return 'Normal';
    } else if ($criticalCount <= 2) {
        return 'Perhatian';
    } else {
        return 'Kritis';
    }
}

/**
 * Simpan log pengiriman email
 * 
 * @param string $recipient Penerima
 * @param string $subject Subjek
 * @param string $status Status pengiriman (success, failed)
 * @param string $type Tipe email
 * @param string $error Pesan error (jika ada)
 */
function logEmailSent($recipient, $subject, $status, $type, $error = '') {
    // Log data
    $logData = [
        'recipient' => $recipient,
        'subject' => $subject,
        'timestamp' => date('Y-m-d H:i:s'),
        'status' => $status,
        'type' => $type,
        'error' => $error
    ];
    
    // Simpan ke file log
    $logFile = __DIR__ . '/../logs/email.log';
    $logDir = dirname($logFile);
    
    // Buat direktori jika belum ada
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Format log entry
    $logEntry = "[" . $logData['timestamp'] . "] " . strtoupper($status) . ": " . 
                "Email " . $type . " to " . $recipient . " - " . $subject;
    
    if (!empty($error)) {
        $logEntry .= " - ERROR: " . $error;
    }
    
    $logEntry .= PHP_EOL;
    
    // Tulis ke file log
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // Jika ada Firebase, simpan juga ke Firebase
    saveEmailLogToFirebase($logData);
}

/**
 * Simpan log email ke Firebase
 * 
 * @param array $logData Data log
 */
function saveEmailLogToFirebase($logData) {
    global $firebaseConfig;
    
    // Jika tidak ada Firebase, keluar
    if (!isset($firebaseConfig) || empty($firebaseConfig)) {
        return;
    }
    
    // URL Firebase untuk menyimpan log
    $url = $firebaseConfig['databaseURL'] . '/email_logs.json';
    
    // Inisialisasi cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($logData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    // Kirim request
    $response = curl_exec($ch);
    curl_close($ch);
    
    return $response;
}

// Inisialisasi konfigurasi email
initEmailConfig();