<?php
// File: reports.php
// Halaman laporan dan riwayat data
// Status: [new]

// Header
include_once 'includes/header.php';
// Database
include_once 'includes/db-connect.php';

// Ambil data
$sensorData = getCurrentSensorData();
?>

<!-- Reports Controls Row -->
<div class="row mb-4">
    <div class="col-md-8">
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-primary" id="send-report-btn">
                <i class="fas fa-envelope"></i> Kirim Laporan Sekarang
            </button>
            <button type="button" class="btn btn-outline-success" id="export-data">
                <i class="fas fa-file-download"></i> Export CSV
            </button>
        </div>
    </div>
    <div class="col-md-4 text-end">
        <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="reportTypeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-filter"></i> Filter Laporan
            </button>
            <ul class="dropdown-menu" aria-labelledby="reportTypeDropdown">
                <li><a class="dropdown-item active" href="#">Semua Data</a></li>
                <li><a class="dropdown-item" href="#">Harian</a></li>
                <li><a class="dropdown-item" href="#">Mingguan</a></li>
                <li><a class="dropdown-item" href="#">Bulanan</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Kustomisasi Range</a></li>
            </ul>
        </div>
    </div>
</div>

<!-- Current Data Summary -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Ringkasan Data Saat Ini</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Parameter</th>
                                <th>Nilai</th>
                                <th>Satuan</th>
                                <th>Status</th>
                                <th>Acuan Normal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tegangan Rata-rata</td>
                                <td><?php echo isset($sensorData['Vavg']) ? number_format($sensorData['Vavg'], 2) : '-'; ?></td>
                                <td>V</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['Vavg'])) {
                                        $vavg = $sensorData['Vavg'];
                                        if ($vavg < 200) {
                                            echo '<span class="badge bg-danger">Rendah</span>';
                                        } else if ($vavg > 240) {
                                            echo '<span class="badge bg-danger">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>200V - 240V</td>
                            </tr>
                            <tr>
                                <td>Arus Rata-rata</td>
                                <td><?php echo isset($sensorData['Iavg']) ? number_format($sensorData['Iavg'], 4) : '-'; ?></td>
                                <td>A</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['Iavg'])) {
                                        $iavg = $sensorData['Iavg'];
                                        if ($iavg > 5) {
                                            echo '<span class="badge bg-danger">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>0 - 5A</td>
                            </tr>
                            <tr>
                                <td>Daya Total</td>
                                <td><?php echo isset($sensorData['Ptot']) ? number_format($sensorData['Ptot'], 4) : '-'; ?></td>
                                <td>kW</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['Ptot'])) {
                                        $ptot = $sensorData['Ptot'];
                                        if ($ptot > 3) {
                                            echo '<span class="badge bg-warning">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>0 - 3kW</td>
                            </tr>
                            <tr>
                                <td>Energi Terpakai</td>
                                <td><?php echo isset($sensorData['Edel']) ? number_format($sensorData['Edel'], 2) : '-'; ?></td>
                                <td>kWh</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Tegangan Fase 1</td>
                                <td><?php echo isset($sensorData['V1']) ? number_format($sensorData['V1'], 2) : '-'; ?></td>
                                <td>V</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['V1'])) {
                                        $v1 = $sensorData['V1'];
                                        if ($v1 < 200) {
                                            echo '<span class="badge bg-danger">Rendah</span>';
                                        } else if ($v1 > 240) {
                                            echo '<span class="badge bg-danger">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>200V - 240V</td>
                            </tr>
                            <tr>
                                <td>Tegangan Fase 2</td>
                                <td><?php echo isset($sensorData['V2']) ? number_format($sensorData['V2'], 2) : '-'; ?></td>
                                <td>V</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['V2'])) {
                                        $v2 = $sensorData['V2'];
                                        if ($v2 < 200) {
                                            echo '<span class="badge bg-danger">Rendah</span>';
                                        } else if ($v2 > 240) {
                                            echo '<span class="badge bg-danger">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>200V - 240V</td>
                            </tr>
                            <tr>
                                <td>Tegangan Fase 3</td>
                                <td><?php echo isset($sensorData['V3']) ? number_format($sensorData['V3'], 2) : '-'; ?></td>
                                <td>V</td>
                                <td>
                                    <?php 
                                    if (isset($sensorData['V3'])) {
                                        $v3 = $sensorData['V3'];
                                        if ($v3 < 200) {
                                            echo '<span class="badge bg-danger">Rendah</span>';
                                        } else if ($v3 > 240) {
                                            echo '<span class="badge bg-danger">Tinggi</span>';
                                        } else {
                                            echo '<span class="badge bg-success">Normal</span>';
                                        }
                                    } else {
                                        echo '-';
                                    }
                                    ?>
                                </td>
                                <td>200V - 240V</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Email Settings -->
<div class="row mb-4">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Pengaturan Email</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <table class="table">
                            <tr>
                                <td width="40%">Status Email</td>
                                <td><span class="badge bg-success">Aktif</span></td>
                            </tr>
                            <tr>
                                <td>Penerima</td>
                                <td>pnm.monitoring.iot98@gmail.com</td>
                            </tr>
                            <tr>
                                <td>Jadwal Pengiriman</td>
                                <td>Setiap 23 jam (Cron: 0 */23 * * *)</td>
                            </tr>
                            <tr>
                                <td>Pengiriman Terakhir</td>
                                <td id="last-email-sent">
                                    <?php 
                                    if (file_exists('cron/daily_report_log.txt')) {
                                        $logContent = file_get_contents('cron/daily_report_log.txt');
                                        $lines = explode("\n", $logContent);
                                        $lastSent = end($lines);
                                        if (strpos($lastSent, 'berhasil') !== false) {
                                            echo substr($lastSent, 0, 19);
                                        } else {
                                            echo 'Belum ada data';
                                        }
                                    } else {
                                        echo 'Belum ada data';
                                    }
                                    ?>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <form id="email-settings-form">
                            <div class="mb-3">
                                <label for="email-recipient" class="form-label">Alamat Email Penerima</label>
                                <input type="email" class="form-control" id="email-recipient" value="pnm.monitoring.iot98@gmail.com">
                            </div>
                            <div class="mb-3">
                                <label for="email-schedule" class="form-label">Jadwal Pengiriman</label>
                                <select class="form-select" id="email-schedule">
                                    <option value="6">Setiap 6 jam</option>
                                    <option value="12">Setiap 12 jam</option>
                                    <option value="23" selected>Setiap 23 jam</option>
                                    <option value="24">Setiap 24 jam</option>
                                    <option value="custom">Kustom</option>
                                </select>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="email-alerts-enable" checked>
                                <label class="form-check-label" for="email-alerts-enable">Aktifkan notifikasi email untuk kondisi kritis</label>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary" disabled>Simpan Pengaturan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Email Logs -->
<div class="row">
    <div class="col-md-12">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Riwayat Pengiriman Laporan</h5>
                <button class="btn btn-sm btn-outline-secondary" id="refresh-logs">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Tanggal & Waktu</th>
                                <th>Penerima</th>
                                <th>Subjek</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="email-logs-table">
                            <!-- Log items will be populated using JavaScript -->
                            <tr>
                                <td colspan="4" class="text-center">Memuat data...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="text-end mt-3">
                    <button class="btn btn-sm btn-outline-secondary" id="load-more-logs" disabled>
                        Load More <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
// Footer
include_once 'includes/footer.php';
?>