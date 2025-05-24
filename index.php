<?php
// Header
include_once 'includes/header.php';
?>

<!-- Hero Section -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h2 class="mb-3">Selamat Datang di Monitoring IoT</h2>
                        <p class="lead">Pantau dan kelola perangkat IoT Anda dengan mudah dan real-time.</p>
                        <p>Sistem ini dikembangkan untuk memantau parameter elektrik seperti tegangan, arus, dan daya melalui koneksi Modbus RS485. Data diperbarui setiap beberapa detik dan dapat dilihat dalam grafik interaktif di dashboard.</p>
                        <div class="mt-4">
                            <a href="dashboard.php" class="btn btn-primary me-2">
                                <i class="fas fa-tachometer-alt me-1"></i> Buka Dashboard
                            </a>
                            <a href="reports.php" class="btn btn-outline-secondary">
                                <i class="fas fa-file-alt me-1"></i> Lihat Laporan
                            </a>
                        </div>
                    </div>
                    <div class="col-md-4 text-center">
                        <div class="p-3">
                            <i class="fas fa-microchip" style="font-size: 8rem; color: #1DCD9F; opacity: 0.7;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Quick Info Cards -->
<div class="row" id="quick-info-cards">
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-bolt" style="font-size: 2.5rem; color: #1DCD9F;"></i>
                </div>
                <h5 class="card-title">Tegangan Rata-rata</h5>
                <div class="metric-value" id="vavg-value">-</div>
                <div class="metric-label">Nilai tegangan saat ini</div>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-tachometer-alt" style="font-size: 2.5rem; color: #1DCD9F;"></i>
                </div>
                <h5 class="card-title">Arus Rata-rata</h5>
                <div class="metric-value" id="iavg-value">-</div>
                <div class="metric-label">Nilai arus saat ini</div>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-plug" style="font-size: 2.5rem; color: #1DCD9F;"></i>
                </div>
                <h5 class="card-title">Daya Total</h5>
                <div class="metric-value" id="ptot-value">-</div>
                <div class="metric-label">Konsumsi daya saat ini</div>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-body text-center">
                <div class="mb-3">
                    <i class="fas fa-battery-half" style="font-size: 2.5rem; color: #1DCD9F;"></i>
                </div>
                <h5 class="card-title">Energi Terpakai</h5>
                <div class="metric-value" id="edel-value">-</div>
                <div class="metric-label">Total energi yang terpakai</div>
            </div>
        </div>
    </div>
</div>

<!-- Features Section -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4>Fitur Monitoring IoT</h4>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-chart-line" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Visualisasi Data Realtime</h5>
                                <p>Pantau data sensor dalam bentuk grafik yang diperbarui secara real-time setiap 3 detik.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-envelope" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Laporan Otomatis</h5>
                                <p>Terima laporan otomatis via email setiap 23 jam tentang kondisi perangkat Anda.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-mobile-alt" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Responsif di Semua Perangkat</h5>
                                <p>Akses dashboard dari browser komputer, tablet, atau smartphone.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-moon" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Mode Gelap</h5>
                                <p>Gunakan tampilan mode gelap untuk kenyamanan penggunaan di malam hari.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Notifikasi Status</h5>
                                <p>Pantau status koneksi dan kondisi perangkat secara real-time.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="d-flex align-items-start mb-2">
                            <div class="me-3">
                                <i class="fas fa-file-download" style="font-size: 1.5rem; color: #1DCD9F;"></i>
                            </div>
                            <div>
                                <h5>Ekspor Data</h5>
                                <p>Ekspor data sensor ke format CSV untuk analisis lebih lanjut.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Project Info -->
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h4>Tentang Proyek</h4>
            </div>
            <div class="card-body">
                <p>Proyek <strong>Monitoring IoT by Diky Aditia</strong> adalah sistem pemantauan perangkat IoT berbasis web yang terhubung dengan Arduino melalui Modbus RS485. Sistem ini menggunakan:</p>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h5>Hardware</h5>
                        <ul>
                            <li>ESP32 sebagai mikrokontroler utama</li>
                            <li>Modul RS485 untuk komunikasi Modbus</li>
                            <li>Power Meter PM5560 sebagai sensor</li>
                        </ul>
                    </div>
                    
                    <div class="col-md-6">
                        <h5>Software</h5>
                        <ul>
                            <li>Firebase Realtime Database sebagai backend</li>
                            <li>PHP untuk aplikasi web</li>
                            <li>JavaScript dan Chart.js untuk visualisasi</li>
                            <li>Bootstrap 5 untuk tampilan responsif</li>
                        </ul>
                    </div>
                </div>
                
                <div class="alert alert-info mt-4">
                    <p class="mb-0">Dashboard ini dikembangkan sebagai bagian dari proyek IoT untuk memudahkan pemantauan parameter elektrik secara realtime dan dari jarak jauh.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// Footer
include_once 'includes/footer.php';
?>