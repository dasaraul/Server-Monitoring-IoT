<?php
require_once 'vendor/phpmailer/phpmailer/PHPMailer.php';
require_once 'vendor/phpmailer/phpmailer/SMTP.php';
require_once 'vendor/phpmailer/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load config
$config = json_decode(file_get_contents('config/email-config.json'), true);

echo "<h2>Test Gmail SMTP</h2>";
echo "<p>Testing email dengan konfigurasi:</p>";
echo "<ul>";
echo "<li>SMTP Host: " . $config['smtp_settings']['host'] . "</li>";
echo "<li>SMTP Port: " . $config['smtp_settings']['port'] . "</li>";
echo "<li>Username: " . $config['smtp_settings']['username'] . "</li>";
echo "<li>Recipient: " . $config['recipient'] . "</li>";
echo "</ul>";

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = $config['smtp_settings']['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_settings']['username'];
    $mail->Password   = $config['smtp_settings']['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $config['smtp_settings']['port'];
    
    // Enable verbose debug output
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->Debugoutput = 'html';

    // Recipients
    $mail->setFrom($config['smtp_settings']['username'], 'IoT Monitoring Test');
    $mail->addAddress($config['recipient']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Test Email dari IoT Monitoring - ' . date('Y-m-d H:i:s');
    $mail->Body    = '<h2>Test Email Berhasil!</h2><p>Jika Anda menerima email ini, konfigurasi SMTP Gmail sudah benar.</p><p>Waktu pengiriman: ' . date('Y-m-d H:i:s') . '</p>';

    $mail->send();
    echo '<div style="color: green; font-weight: bold; margin-top: 20px;"> Email berhasil dikirim!</div>';
} catch (Exception $e) {
    echo '<div style="color: red; font-weight: bold; margin-top: 20px;"> Email gagal dikirim.</div>';
    echo '<div style="color: red;">Error: ' . $mail->ErrorInfo . '</div>';
}
?>
