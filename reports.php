<?php
// File: reports.php
// Halaman laporan dan riwayat data yang diupdate dengan fitur email yang berfungsi

// Header
include_once 'includes/header.php';
// Database
include_once 'includes/db-connect.php';
// Email manager
include_once 'includes/email-manager.php';

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

<!-- Email Panel - NEW -->
<?php include 'includes/email-panel.html'; ?>

<?php
// Footer
include_once 'includes/footer.php';
?>

<!-- Custom Scripts -->
<script src="assets/js/email-settings.js"></script>

<script>
// Initialize email logs
$(document).ready(function() {
    // Handle send report button
    $('#send-report-btn').on('click', function() {
        // Show loading state
        const button = $(this);
        const originalText = button.html();
        button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
        button.prop('disabled', true);
        
        // Send request to API
        $.ajax({
            url: 'api/send-email.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ type: 'manual' }),
            success: function(response) {
                // Restore button
                button.html(originalText);
                button.prop('disabled', false);
                
                // Show notification
                if (response.success) {
                    showNotification('success', 'Laporan berhasil dikirim ke email!');
                    
                    // Refresh email logs if they exist
                    if (typeof loadEmailLogs === 'function') {
                        loadEmailLogs();
                    }
                } else {
                    showNotification('danger', 'Gagal mengirim laporan: ' + response.message);
                }
            },
            error: function() {
                // Restore button
                button.html(originalText);
                button.prop('disabled', false);
                
                // Show error notification
                showNotification('danger', 'Terjadi kesalahan saat mengirim laporan.');
            }
        });
    });
});
</script>