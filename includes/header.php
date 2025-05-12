<?php
// File: includes/header.php
// Bagian header untuk semua halaman
// Status: [new]
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring IoT by Diky Aditia</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- Chart.js -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dark-mode.css">
</head>
<body class="<?php echo isset($_COOKIE['darkMode']) && $_COOKIE['darkMode'] === 'true' ? 'dark-mode' : ''; ?>">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light" id="main-navbar">
        <div class="container">
            <a class="navbar-brand" href="index.php">
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
                    <button id="dark-mode-toggle" class="btn btn-outline-secondary">
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