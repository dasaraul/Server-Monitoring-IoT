<?php
echo "<h2> Simple Email Test</h2>";

// Test basic PHP
echo "<p> PHP working</p>";

// Test config file
if (file_exists('config/email-config.json')) {
    echo "<p> Config file exists</p>";
    $config = json_decode(file_get_contents('config/email-config.json'), true);
    echo "<p>Gmail: " . $config['smtp_settings']['username'] . "</p>";
    echo "<p>Method: " . $config['email_method'] . "</p>";
} else {
    echo "<p> Config file missing</p>";
}

// Test PHPMailer
if (file_exists('vendor/phpmailer/phpmailer/PHPMailer.php')) {
    echo "<p> PHPMailer installed</p>";
} else {
    echo "<p> PHPMailer missing</p>";
}

// Test sending simple email
echo "<hr>";
echo "<h3> Test Kirim Email</h3>";

if (isset($_GET['send'])) {
    echo "<p> Mencoba kirim email...</p>";
    
    // Load email manager
    require_once 'includes/email-manager.php';
    
    // Simple test data
    $testData = [
        'Vavg' => 220.5,
        'Iavg' => 1.2,
        'Ptot' => 0.8,
        'Edel' => 15.6
    ];
    
    // Send email
    $result = sendEmailReport($testData, 'manual');
    
    if ($result['success']) {
        echo "<p style='color: green;'> " . $result['message'] . "</p>";
    } else {
        echo "<p style='color: red;'> " . $result['message'] . "</p>";
    }
} else {
    echo "<p><a href='?send=1' style='background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;'> Kirim Test Email</a></p>";
}

echo "<hr>";
echo "<p><strong> Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Update config: <code>sudo nano config/email-config.json</code></li>";
echo "<li>Ganti YOUR_EMAIL dan YOUR_APP_PASSWORD</li>";
echo "<li>Klik tombol 'Kirim Test Email' di atas</li>";
echo "</ol>";
?>
