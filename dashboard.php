<?php
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
            <a href="#" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#settingsModal">
                <i class="fas fa-cog"></i> Pengaturan
            </a>
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

<!-- Charts Section -->
<?php include 'dashboard-charts.html'; ?>

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

<!-- Settings Modal -->
<div class="modal fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="settingsModalLabel">Pengaturan Dashboard</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <ul class="nav nav-tabs" id="settingsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="display-tab" data-bs-toggle="tab" data-bs-target="#display-settings" type="button" role="tab" aria-controls="display-settings" aria-selected="true">Tampilan</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="chart-tab" data-bs-toggle="tab" data-bs-target="#chart-settings" type="button" role="tab" aria-controls="chart-settings" aria-selected="false">Grafik</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="alert-tab" data-bs-toggle="tab" data-bs-target="#alert-settings" type="button" role="tab" aria-controls="alert-settings" aria-selected="false">Notifikasi</button>
                    </li>
                </ul>
                <div class="tab-content mt-3" id="settingsTabContent">
                    <div class="tab-pane fade show active" id="display-settings" role="tabpanel" aria-labelledby="display-tab">
                        <div class="mb-3">
                            <label class="form-label">Tema</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="theme" id="theme-light" checked>
                                <label class="form-check-label" for="theme-light">
                                    Light Mode
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="theme" id="theme-dark">
                                <label class="form-check-label" for="theme-dark">
                                    Dark Mode
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="theme" id="theme-auto">
                                <label class="form-check-label" for="theme-auto">
                                    Auto (Sesuai Sistem)
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="refresh-interval" class="form-label">Interval Refresh Data</label>
                            <select class="form-select" id="refresh-interval">
                                <option value="1000">1 detik</option>
                                <option value="3000" selected>3 detik</option>
                                <option value="5000">5 detik</option>
                                <option value="10000">10 detik</option>
                                <option value="30000">30 detik</option>
                                <option value="60000">1 menit</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="unit-system" class="form-label">Sistem Satuan</label>
                            <select class="form-select" id="unit-system">
                                <option value="metric" selected>Metrik (V, A, kW)</option>
                                <option value="imperial">Imperial (V, A, HP)</option>
                            </select>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="chart-settings" role="tabpanel" aria-labelledby="chart-tab">
                        <div class="mb-3">
                            <label for="chart-points" class="form-label">Jumlah Data pada Grafik</label>
                            <select class="form-select" id="chart-points">
                                <option value="20">20 titik data</option>
                                <option value="60" selected>60 titik data</option>
                                <option value="120">120 titik data</option>
                                <option value="240">240 titik data</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="chart-animation" class="form-label">Animasi Grafik</label>
                            <select class="form-select" id="chart-animation">
                                <option value="fast">Cepat</option>
                                <option value="normal" selected>Normal</option>
                                <option value="slow">Lambat</option>
                                <option value="none">Tidak ada</option>
                            </select>
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="auto-scale" checked>
                            <label class="form-check-label" for="auto-scale">Skala Otomatis</label>
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="show-points" checked>
                            <label class="form-check-label" for="show-points">Tampilkan Titik Data</label>
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="fill-area" checked>
                            <label class="form-check-label" for="fill-area">Isi Area Grafik</label>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="alert-settings" role="tabpanel" aria-labelledby="alert-tab">
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="enable-alerts" checked>
                            <label class="form-check-label" for="enable-alerts">Aktifkan Notifikasi</label>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Batas Notifikasi Tegangan</label>
                            <div class="row g-3">
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Min</span>
                                        <input type="number" class="form-control" id="voltage-alert-min" value="200">
                                        <span class="input-group-text">V</span>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Max</span>
                                        <input type="number" class="form-control" id="voltage-alert-max" value="240">
                                        <span class="input-group-text">V</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Batas Notifikasi Arus</label>
                            <div class="row g-3">
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Min</span>
                                        <input type="number" class="form-control" id="current-alert-min" value="0">
                                        <span class="input-group-text">A</span>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Max</span>
                                        <input type="number" class="form-control" id="current-alert-max" value="5">
                                        <span class="input-group-text">A</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Batas Notifikasi Daya</label>
                            <div class="row g-3">
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Min</span>
                                        <input type="number" class="form-control" id="power-alert-min" value="0">
                                        <span class="input-group-text">kW</span>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="input-group">
                                        <span class="input-group-text">Max</span>
                                        <input type="number" class="form-control" id="power-alert-max" value="3">
                                        <span class="input-group-text">kW</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3 form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="enable-email-alerts" checked>
                            <label class="form-check-label" for="enable-email-alerts">Kirim Email Notifikasi</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" class="btn btn-primary" id="save-settings">Simpan Pengaturan</button>
            </div>
        </div>
    </div>
</div>

<?php
// Footer
include_once 'includes/footer.php';
?>

<!-- Include enhanced charts script -->
<script src="assets/js/enhanced-charts.js"></script>
<script src="assets/js/statistics.js"></script>

<script>
// Initialize settings when page loads
$(document).ready(function() {
    // Save settings button
    $('#save-settings').on('click', function() {
        saveSettings();
        $('#settingsModal').modal('hide');
        showNotification('success', 'Pengaturan berhasil disimpan!');
    });
    
    // Load settings from localStorage
    loadSettings();
});

// Save settings to localStorage
function saveSettings() {
    const settings = {
        theme: $('input[name="theme"]:checked').attr('id'),
        refreshInterval: $('#refresh-interval').val(),
        unitSystem: $('#unit-system').val(),
        chartPoints: $('#chart-points').val(),
        chartAnimation: $('#chart-animation').val(),
        autoScale: $('#auto-scale').is(':checked'),
        showPoints: $('#show-points').is(':checked'),
        fillArea: $('#fill-area').is(':checked'),
        enableAlerts: $('#enable-alerts').is(':checked'),
        voltageAlertMin: $('#voltage-alert-min').val(),
        voltageAlertMax: $('#voltage-alert-max').val(),
        currentAlertMin: $('#current-alert-min').val(),
        currentAlertMax: $('#current-alert-max').val(),
        powerAlertMin: $('#power-alert-min').val(),
        powerAlertMax: $('#power-alert-max').val(),
        enableEmailAlerts: $('#enable-email-alerts').is(':checked')
    };
    
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    
    // Apply settings
    applySettings(settings);
}

// Load settings from localStorage
function loadSettings() {
    const settingsStr = localStorage.getItem('dashboardSettings');
    if (!settingsStr) return;
    
    try {
        const settings = JSON.parse(settingsStr);
        
        // Set form values
        $('#' + settings.theme).prop('checked', true);
        $('#refresh-interval').val(settings.refreshInterval);
        $('#unit-system').val(settings.unitSystem);
        $('#chart-points').val(settings.chartPoints);
        $('#chart-animation').val(settings.chartAnimation);
        $('#auto-scale').prop('checked', settings.autoScale);
        $('#show-points').prop('checked', settings.showPoints);
        $('#fill-area').prop('checked', settings.fillArea);
        $('#enable-alerts').prop('checked', settings.enableAlerts);
        $('#voltage-alert-min').val(settings.voltageAlertMin);
        $('#voltage-alert-max').val(settings.voltageAlertMax);
        $('#current-alert-min').val(settings.currentAlertMin);
        $('#current-alert-max').val(settings.currentAlertMax);
        $('#power-alert-min').val(settings.powerAlertMin);
        $('#power-alert-max').val(settings.powerAlertMax);
        $('#enable-email-alerts').prop('checked', settings.enableEmailAlerts);
        
        // Apply settings
        applySettings(settings);
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

// Apply settings to dashboard
function applySettings(settings) {
    // Apply theme
    if (settings.theme === 'theme-dark') {
        $('body').addClass('dark-mode');
    } else if (settings.theme === 'theme-light') {
        $('body').removeClass('dark-mode');
    } else if (settings.theme === 'theme-auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            $('body').addClass('dark-mode');
        } else {
            $('body').removeClass('dark-mode');
        }
    }
    
    // Apply chart settings if window.chartConfig exists
    if (window.chartConfig) {
        window.chartConfig.displayPoints = parseInt(settings.chartPoints);
        $('#visible-points-info').text(`Menampilkan ${settings.chartPoints} titik data`);
    }
}
</script>

<?php
// Footer
include_once 'includes/footer.php';
?>