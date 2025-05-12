<?php
// File: includes/send-email.php
// Skrip untuk mengirim email laporan
// Status: [new]

// Import fungsi database
require_once 'db-connect.php';

// Terima request hanya jika POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data dari Firebase
    $sensorData = getCurrentSensorData();
    
    // Jika tidak ada data, kembalikan error
    if (!$sensorData) {
        echo json_encode([
            'success' => false, 
            'message' => 'Tidak dapat mengambil data sensor'
        ]);
        exit;
    }
    
    // Konfigurasi email
    $to = "pnm.monitoring.iot98@gmail.com";
    $subject = "Laporan Monitoring IoT - " . date('d/m/Y H:i');
    
    // Buat konten email
    $content = createEmailContent($sensorData);
    
    // Header email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Monitoring IoT <monitoring@example.com>" . "\r\n";
    
    // Coba kirim email
    $mailSent = mail($to, $subject, $content, $headers);
    
    // Kembalikan respons
    if ($mailSent) {
        // Simpan log pengiriman ke Firebase
        saveEmailLog($to, $subject);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Email berhasil dikirim ke ' . $to
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Gagal mengirim email'
        ]);
    }
} else {
    // Jika bukan POST request, tolak
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Method not allowed'
    ]);
}

// Fungsi untuk membuat konten email
function createEmailContent($data) {
    // Dapatkan tanggal dan waktu saat ini
    $dateTime = date('d/m/Y H:i:s');
    
    // Mulai HTML
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
            .header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #007bff; color: white; text-align: left; padding: 10px; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }
            .alert-info { background-color: #d1ecf1; color: #0c5460; }
            .alert-warning { background-color: #fff3cd; color: #856404; }
            .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .chart-img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Laporan Monitoring IoT</h1>
            <p>Laporan otomatis pada <strong>' . $dateTime . '</strong></p>
        </div>
        <div class="content">
            <div class="alert alert-info">
                <p>Berikut adalah laporan kondisi saat ini dari sistem monitoring IoT:</p>
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
    
    // Tutup tabel dan tambahkan pesan tambahan
    $html .= '
            </table>
            
            <div class="alert alert-warning">
                <p><strong>Catatan:</strong> Email ini dibuat secara otomatis. Untuk melihat data realtime dan grafik lengkap, silakan kunjungi dashboard monitoring.</p>
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

// Fungsi untuk mendapatkan status berdasarkan nilai 
function getStatusHTML($value, $min, $max) {
    if ($value < $min) {
        return '<span style="color: #dc3545;">Rendah</span>';
    } else if ($value > $max) {
        return '<span style="color: #dc3545;">Tinggi</span>';
    } else {
        return '<span style="color: #28a745;">Normal</span>';
    }
}

// Fungsi untuk menyimpan log pengiriman email ke Firebase
function saveEmailLog($recipient, $subject) {
    global $firebaseConfig;
    
    // Data log
    $logData = [
        'recipient' => $recipient,
        'subject' => $subject,
        'timestamp' => date('Y-m-d\TH:i:s.v\Z'),
        'status' => 'sent'
    ];
    
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