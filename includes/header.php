<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring IoT by Diky Aditia</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/img/favicon.png" id="dynamic-favicon">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Monitoring IoT Dashboard" id="og-title">
    <meta property="og:description" content="Sistem Monitoring IoT untuk pemantauan parameter elektrik dengan visualisasi realtime" id="og-description">
    <meta property="og:image" content="assets/img/og-image.png" id="og-image">
    <meta property="og:url" content="https://monitoring-iot.example.com" id="og-url">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Monitoring IoT Dashboard" id="twitter-title">
    <meta name="twitter:description" content="Sistem Monitoring IoT untuk pemantauan parameter elektrik dengan visualisasi realtime" id="twitter-description">
    <meta name="twitter:image" content="assets/img/og-image.png" id="twitter-image">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dark-mode.css">
    
    <!-- Description Meta Tag -->
    <meta name="description" content="Sistem Monitoring IoT untuk pemantauan parameter elektrik dengan visualisasi realtime" id="meta-description">
    <meta name="author" content="Diky Aditia">
    
    <!-- Icon Animations Support -->
    <style>
        /* Support for animated icons */
        .animated-icon {
            width: 40px;
            height: 40px;
            object-fit: contain;
        }
        
        /* Custom icon containers */
        .icon-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(29, 205, 159, 0.1);
            color: var(--primary-color);
            transition: all 0.3s ease;
        }
        
        .icon-container:hover {
            transform: scale(1.1);
            background-color: rgba(29, 205, 159, 0.2);
        }
        
        /* Improved contrasts for dark mode */
        body.dark-mode {
            --text-muted: #adb5bd;
            --chart-label: #e9ecef;
            --input-bg: #333333;
            --input-text: #f8f9fa;
            --input-border: #4b5563;
            --hover-bg: rgba(29, 205, 159, 0.1);
        }
        
        body.dark-mode .text-muted {
            color: var(--text-muted) !important;
        }
        
        body.dark-mode .form-control {
            background-color: var(--input-bg);
            color: var(--input-text);
            border-color: var(--input-border);
        }
        
        body.dark-mode .form-select {
            background-color: var(--input-bg);
            color: var(--input-text);
            border-color: var(--input-border);
        }
        
        body.dark-mode .input-group-text {
            background-color: #444;
            color: var(--input-text);
            border-color: var(--input-border);
        }
        
        body.dark-mode .dropdown-menu {
            background-color: #222222;
            border-color: #333333;
        }
        
        body.dark-mode .dropdown-item {
            color: #f8f9fa;
        }
        
        body.dark-mode .dropdown-item:hover {
            background-color: #333333;
        }
        
        /* Video background support */
        .video-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            object-fit: cover;
            opacity: 0.1;
        }
    </style>
</head>
<body class="<?php echo isset($_COOKIE['darkMode']) && $_COOKIE['darkMode'] === 'true' ? 'dark-mode' : ''; ?>">
    <!-- Optional Video Background -->
    <div id="background-container">
        <!-- Will be populated by JavaScript if enabled -->
    </div>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light" id="main-navbar">
        <div class="container">
            <a class="navbar-brand" href="index.php">
                <span class="brand-icon" id="brand-icon">
                    <!-- Will be populated by JavaScript -->
                </span>
                <strong>Monitoring IoT</strong> <span class="text-muted">by Diky Aditia</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>" href="index.php">
                            <i class="fas fa-home"></i> Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?>" href="dashboard.php">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'reports.php' ? 'active' : ''; ?>" href="reports.php">
                            <i class="fas fa-file-alt"></i> Laporan
                        </a>
                    </li>
                </ul>
                <div class="d-flex">
                    <button id="dark-mode-toggle" class="btn btn-outline-secondary" title="Toggle Dark Mode">
                        <i class="fas fa-moon"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content Container -->
    <div class="container py-4">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="page-title">
                        <?php 
                        $page = basename($_SERVER['PHP_SELF'], '.php');
                        switch($page) {
                            case 'index':
                                echo 'Home';
                                break;
                            case 'dashboard':
                                echo 'Dashboard Monitoring';
                                break;
                            case 'reports':
                                echo 'Laporan & Histori';
                                break;
                            default:
                                echo 'Monitoring IoT';
                        }
                        ?>
                    </h1>
                    <div class="sensor-status">
                        <span id="connection-status" class="badge bg-success">
                            <i class="fas fa-wifi"></i> Terhubung
                        </span>
                        <span id="last-update" class="small text-muted ms-2">
                            Update terakhir: <span id="last-update-time">-</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>