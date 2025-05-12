<?php
// File: dashboard.php
// Halaman dashboard monitoring
// Status: [new]

// Header
include_once 'includes/header.php';
?>

<!-- Dashboard Controls Row -->
<div class="row mb-4">
    <div class="col-md-8">
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-primary" id="refresh-data">
                <i class="fas fa-sync-alt"></i> Refresh Data
            </button>
            <button type="button" class="btn btn-outline-success" id="export-data">
                <i class="fas fa-file-download"></i> Export CSV
            </button>
        </div>
    </div>
    <div class="col-md-4 text-end">
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-secondary" id="time-range-hour">1 Jam</button>
            <button type="button" class="btn btn-outline-secondary active" id="time-range-day">24 Jam</button>
            <button type="button" class="btn btn-outline-secondary" id="time-range-week">1 Minggu</button>
        </div>
    </div>
</div>

<!-- Dashboard Cards Row -->
<div class="row" id="dashboard-cards">
    <!-- Voltage Card -->
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Tegangan Rata-rata</span>
                <i class="fas fa-bolt text-primary"></i>
            </div>
            <div class="card-body">
                <div class="metric-value" id="vavg-value">-</div>
                <div class="metric-label">Tegangan AC 3 fase</div>
                <div class="progress mt-3" id="voltage-progress">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: 0%;" 
                         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-3 d-flex justify-content-between small">
                    <span class="text-muted">0V</span>
                    <span class="text-muted">220V</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Current Card -->
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Arus Rata-rata</span>
                <i class="fas fa-tachometer-alt text-danger"></i>
            </div>
            <div class="card-body">
                <div class="metric-value" id="iavg-value">-</div>
                <div class="metric-label">Arus listrik 3 fase</div>
                <div class="progress mt-3" id="current-progress">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: 0%;" 
                         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-3 d-flex justify-content-between small">
                    <span class="text-muted">0A</span>
                    <span class="text-muted">10A</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Power Card -->
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Daya Total</span>
                <i class="fas fa-plug text-success"></i>
            </div>
            <div class="card-body">
                <div class="metric-value" id="ptot-value">-</div>
                <div class="metric-label">Total konsumsi daya</div>
                <div class="progress mt-3" id="power-progress">
                    <div class="progress-bar bg-success" role="progressbar" style="width: 0%;" 
                         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-3 d-flex justify-content-between small">
                    <span class="text-muted">0kW</span>
                    <span class="text-muted">5kW</span>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Energy Card -->
    <div class="col-md-6 col-lg-3 mb-4">
        <div class="card metric-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Energi Terpakai</span>
                <i class="fas fa-battery-half text-warning"></i>
            </div>
            <div class="card-body">
                <div class="metric-value" id="edel-value">-</div>
                <div class="metric-label">Total energi terpakai</div>
                <div class="small text-muted mt-3">
                    <i class="fas fa-info-circle me-1"></i> Energi terukur sejak alat dinyalakan
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Three Phase Voltage Row -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Tegangan 3 Fase</h5>
                <div>
                    <button class="btn btn-sm btn-outline-secondary" id="toggle-voltage-type">
                        <i class="fas fa-exchange-alt me-1"></i> Tampilan
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="border rounded p-3 text-center h-100">
                            <h6>Fase 1</h6>
                            <div class="display-6 mb-2" id="v1-value">-</div>
                            <div id="v1-badge" class="badge bg-success">Normal</div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3 mb-md-0">
                        <div class="border rounded p-3 text-center h-100">
                            <h6>Fase 2</h6>
                            <div class="display-6 mb-2" id="v2-value">-</div>
                            <div id="v2-badge" class="badge bg-success">Normal</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center h-100">
                            <h6>Fase 3</h6>
                            <div class="display-6 mb-2" id="v3-value">-</div>
                            <div id="v3-badge" class="badge bg-success">Normal</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Charts Row -->
<div class="row">
    <!-- Voltage Chart -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Grafik Tegangan</h5>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownVoltage" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cog"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownVoltage">
                        <li><a class="dropdown-item" href="#" id="download-vavg-chart">Download Chart</a></li>
                        <li><a class="dropdown-item" href="#" id="reset-vavg-chart">Reset Zoom</a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="vavg-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Current Chart -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Grafik Arus</h5>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownCurrent" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cog"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownCurrent">
                        <li><a class="dropdown-item" href="#" id="download-iavg-chart">Download Chart</a></li>
                        <li><a class="dropdown-item" href="#" id="reset-iavg-chart">Reset Zoom</a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="iavg-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Power Chart -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Grafik Daya</h5>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownPower" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cog"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownPower">
                        <li><a class="dropdown-item" href="#" id="download-ptot-chart">Download Chart</a></li>
                        <li><a class="dropdown-item" href="#" id="reset-ptot-chart">Reset Zoom</a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="ptot-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 3-Phase Voltage Chart -->
    <div class="col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Grafik Tegangan 3 Fase</h5>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownVoltage3" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cog"></i>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownVoltage3">
                        <li><a class="dropdown-item" href="#" id="download-voltage-chart">Download Chart</a></li>
                        <li><a class="dropdown-item" href="#" id="reset-voltage-chart">Reset Zoom</a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container">
                    <canvas id="voltage-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Connection Status -->
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Status Sistem</h5>
                <span id="system-status" class="badge bg-success">Aktif</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <tr>
                                <td width="40%">Status Koneksi</td>
                                <td><span id="connection-status-detail" class="badge bg-success">Terhubung</span></td>
                            </tr>
                            <tr>
                                <td>Device ID</td>
                                <td>PM5560-001</td>
                            </tr>
                            <tr>
                                <td>Update Terakhir</td>
                                <td id="last-update-detail">-</td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <tr>
                                <td width="40%">Mode Komunikasi</td>
                                <td>Modbus RS485</td>
                            </tr>
                            <tr>
                                <td>Interval Update</td>
                                <td>Setiap 3 detik</td>
                            </tr>
                            <tr>
                                <td>Status Pelaporan</td>
                                <td><span class="badge bg-success">Email Aktif</span></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// Footer
include_once 'includes/footer.php';
?>