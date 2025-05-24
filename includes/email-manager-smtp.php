<?php
// Updated SMTP function untuk Gmail
function sendEmailViaSmtp($to, $subject, $content, $headers) {
    global $emailConfig;
    
    // Load PHPMailer
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/PHPMailer.php';
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/SMTP.php';
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/Exception.php';
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;
    
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $emailConfig['smtp_settings']['username']; // Gmail address
        $mail->Password   = $emailConfig['smtp_settings']['password']; // App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // Recipients
        $mail->setFrom($emailConfig['smtp_settings']['username'], 'IoT Monitoring System');
        $mail->addAddress($to);
        
        // Add CC if exists
        if (!empty($emailConfig['cc'])) {
            $mail->addCC($emailConfig['cc']);
        }
        
        // Add BCC if exists  
        if (!empty($emailConfig['bcc'])) {
            $mail->addBCC($emailConfig['bcc']);
        }
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $content;
        
        // Send
        $result = $mail->send();
        return $result;
        
    } catch (Exception $e) {
        error_log('PHPMailer Error: ' . $mail->ErrorInfo);
        return false;
    }
}
