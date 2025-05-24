<?php
// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Import koneksi
require_once '../includes/db-connect.php';

// File log
$logFile = 'daily_report_log.txt';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Cron job started\n", FILE_APPEND);

// Ambil data sensor
$sensorData = getCurrentSensorData();

// Check data
if (!$sensorData) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Tidak dapat mengambil data sensor\n", FILE_APPEND);
    exit;
}

// Konfigurasi email
$to = "pnm.monitoring.iot98@gmail.com";
$subject = "Laporan Harian Monitoring IoT - " . date('d/m/Y');

// Buat konten email
$content = createEmailContent($sensorData);

// Header email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Monitoring IoT <KORUPTOR KONTOL>" . "\r\n";

// Kirim email
$mailSent = mail($to, $subject, $content, $headers);

// Log hasil
if ($mailSent) {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Email berhasil dikirim ke " . $to . "\n", FILE_APPEND);
    
    // Simpan log ke Firebase
    saveEmailLog($to, $subject);
} else {
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Error: Gagal mengirim email\n", FILE_APPEND);
}

/**
 * Membuat konten email dengan data sensor
 * 
 * @param array $data Data sensor
 * @return string Konten HTML email
 */
function createEmailContent($data) {
    // Tanggal dan waktu
    $dateTime = date('d/m/Y H:i:s');
    
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
            .alert-warning { background-color: #fff3cd; color: #856404; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1DCD9F; }
            .chart-img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Laporan Harian Monitoring IoT</h1>
            <p>Laporan otomatis pada <strong>' . $dateTime . '</strong></p>
        </div>
        <div class="content">
            <div class="alert alert-info">
                <p>Berikut adalah laporan kondisi terkini dari sistem monitoring IoT. Laporan ini dikirim secara otomatis sesuai jadwal yang ditentukan.</p>
            </div>
            
            <h2>Data Pembacaan Sensor</h2>
            <table>
                <tr>
                    <th>Parameter</th>
                    <th>Nilai</th>
                    <th>Status</th>
                </tr>';
    
    // Tambahkan data ke tabel
    if (isset($data['Vavg'])) {
        $status = getStatusHTML($data['Vavg'], 200, 240);
        $html .= '<tr><td>Tegangan Rata-rata</td><td>' . number_format($data['Vavg'], 2) . ' V</td><td>' . $status . '</td></tr>';
    }
    
    if (isset($data['Iavg'])) {
        $status = getStatusHTML($data['Iavg'], 0, 5);
        $html .= '<tr><td>Arus Rata-rata</td><td>' . number_format($data['Iavg'], 2) . ' A</td><td>' . $status . '</td></tr>';
    }
    
    if (isset($data['Ptot'])) {
        $status = getStatusHTML($data['Ptot'], 0, 2);
        $html .= '<tr><td>Daya Total</td><td>' . number_format($data['Ptot'], 2) . ' kW</td><td>' . $status . '</td></tr>';
    }
    
    if (isset($data['Edel'])) {
        $html .= '<tr><td>Energi Terpakai</td><td>' . number_format($data['Edel'], 2) . ' kWh</td><td>-</td></tr>';
    }
    
    if (isset($data['V1'])) {
        $status = getStatusHTML($data['V1'], 200, 240);
        $html .= '<tr><td>Tegangan Fase 1</td><td>' . number_format($data['V1'], 2) . ' V</td><td>' . $status . '</td></tr>';
    }
    
    if (isset($data['V2'])) {
        $status = getStatusHTML($data['V2'], 200, 240);
        $html .= '<tr><td>Tegangan Fase 2</td><td>' . number_format($data['V2'], 2) . ' V</td><td>' . $status . '</td></tr>';
    }
    
    if (isset($data['V3'])) {
        $status = getStatusHTML($data['V3'], 200, 240);
        $html .= '<tr><td>Tegangan Fase 3</td><td>' . number_format($data['V3'], 2) . ' V</td><td>' . $status . '</td></tr>';
    }
    
    // Ringkasan status
    $html .= '
            </table>
            
            <h2>Ringkasan Status Sistem</h2>
            <div style="padding: 15px; background-color: #e9f7ef; border-radius: 4px; margin-bottom: 20px;">
                <h3 style="color: #1DCD9F;">Status: ' . getSystemStatusText($data) . '</h3>
                <p>Kondisi sistem monitoring IoT secara keseluruhan saat ini menunjukkan status normal.</p>
                <p>Total energi terpakai saat ini: <strong>' . number_format($data['Edel'] ?? 0, 2) . ' kWh</strong></p>
            </div>
            
            <div class="alert alert-warning">
                <p><strong>Catatan:</strong> Email ini dibuat secara otomatis setiap 23 jam. Untuk melihat data realtime dan grafik lengkap, silakan kunjungi dashboard monitoring.</p>
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
 * Mendapatkan status HTML berdasarkan nilai
 * 
 * @param float $value Nilai sensor
 * @param float $min Nilai minimum normal
 * @param float $max Nilai maksimum normal
 * @return string HTML status dengan warna
 */
function getStatusHTML($value, $min, $max) {
    if ($value < $min) {
        return '<span style="color: #dc3545;">Rendah</span>';
    } else if ($value > $max) {
        return '<span style="color: #dc3545;">Tinggi</span>';
    } else {
        return '<span style="color: #1DCD9F;">Normal</span>';
    }
}

/**
 * Mendapatkan status sistem keseluruhan
 * 
 * @param array $data Data sensor
 * @return string Status sistem
 */
function getSystemStatusText($data) {
    // Cek semua nilai kritis
    $vavgStatus = ($data['Vavg'] >= 200 && $data['Vavg'] <= 240);
    $v1Status = ($data['V1'] >= 200 && $data['V1'] <= 240);
    $v2Status = ($data['V2'] >= 200 && $data['V2'] <= 240);
    $v3Status = ($data['V3'] >= 200 && $data['V3'] <= 240);
    $iavgStatus = ($data['Iavg'] >= 0 && $data['Iavg'] <= 5);
    
    // Jika semua normal
    if ($vavgStatus && $v1Status && $v2Status && $v3Status && $iavgStatus) {
        return 'Normal';
    }
    
    return 'Perlu Perhatian';
}

/**
 * Simpan log email ke Firebase
 * 
 * @param string $recipient Penerima email
 * @param string $subject Subjek email
 * @return string Respons Firebase
 */
function saveEmailLog($recipient, $subject) {
    global $firebaseConfig;
    
    // Data log
    $logData = [
        'recipient' => $recipient,
        'subject' => $subject,
        'timestamp' => date('Y-m-d\TH:i:s.v\Z'),
        'status' => 'sent',
        'type' => 'daily_report'
    ];
    
    // URL Firebase
    $url = $firebaseConfig['databaseURL'] . '/email_logs.json';
    
    // cURL
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