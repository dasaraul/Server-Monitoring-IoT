// buat mengintegrasikan semua komponen dashboard

/**
 * Objek konfigurasi dashboard
 */
const dashboardConfig = {
    initialized: false,
    autoRefresh: true,
    refreshInterval: 3000,  // 3 detik
    unitSystem: 'metric',   // metric atau imperial
    alertEnabled: true,
    alertThresholds: {
      voltage: { min: 200, max: 240 },
      current: { min: 0, max: 5 },
      power: { min: 0, max: 3 }
    }
  };
  
  /**
   * Inisialisasi dashboard
   */
  function initDashboard() {
    if (dashboardConfig.initialized) return;
    
    // Load settings dari localStorage
    loadDashboardSettings();
    
    // Inisialisasi grafik enhanced
    if (typeof initEnhancedCharts === 'function') {
      initEnhancedCharts();
    }
    
    // Set interval untuk auto-refresh
    startAutoRefresh();
    
    // Tambahkan event listeners
    setupEventListeners();
    
    // Initialize tooltips
    initTooltips();
    
    // Set status initialized
    dashboardConfig.initialized = true;
    
    console.log('Dashboard initialized with config:', dashboardConfig);
  }
  
  /**
   * Load pengaturan dashboard dari localStorage
   */
  function loadDashboardSettings() {
    const settingsStr = localStorage.getItem('dashboardSettings');
    if (!settingsStr) return;
    
    try {
      const settings = JSON.parse(settingsStr);
      
      // Apply settings
      dashboardConfig.refreshInterval = parseInt(settings.refreshInterval) || 3000;
      dashboardConfig.unitSystem = settings.unitSystem || 'metric';
      dashboardConfig.alertEnabled = settings.enableAlerts !== undefined ? settings.enableAlerts : true;
      
      // Apply alert thresholds
      if (settings.voltageAlertMin) dashboardConfig.alertThresholds.voltage.min = parseFloat(settings.voltageAlertMin);
      if (settings.voltageAlertMax) dashboardConfig.alertThresholds.voltage.max = parseFloat(settings.voltageAlertMax);
      if (settings.currentAlertMin) dashboardConfig.alertThresholds.current.min = parseFloat(settings.currentAlertMin);
      if (settings.currentAlertMax) dashboardConfig.alertThresholds.current.max = parseFloat(settings.currentAlertMax);
      if (settings.powerAlertMin) dashboardConfig.alertThresholds.power.min = parseFloat(settings.powerAlertMin);
      if (settings.powerAlertMax) dashboardConfig.alertThresholds.power.max = parseFloat(settings.powerAlertMax);
      
      // Expose chart config globally if it exists
      if (window.chartConfig && settings.chartPoints) {
        window.chartConfig.displayPoints = parseInt(settings.chartPoints);
      }
    } catch (e) {
      console.error('Error loading dashboard settings:', e);
    }
  }
  
  /**
   * Mulai auto-refresh
   */
  function startAutoRefresh() {
    setInterval(() => {
      if (dashboardConfig.autoRefresh) {
        // This will only trigger if connected to Firebase
        // Otherwise, make AJAX call to get latest data
        if (!window.firebase || !firebase.apps.length) {
          fetchLatestData();
        }
      }
    }, dashboardConfig.refreshInterval);
  }
  
  /**
   * Fetch data terbaru via AJAX (fallback jika tidak ada Firebase)
   */
  function fetchLatestData() {
    $.ajax({
      url: 'api/latest-data.php',
      dataType: 'json',
      success: function(data) {
        if (data) {
          // Trigger sensorDataUpdated event
          $(document).trigger('sensorDataUpdated', [data]);
        }
      },
      error: function(xhr, status, error) {
        console.error('Error fetching latest data:', error);
        
        // Update connection status
        $('#connection-status').removeClass('bg-success bg-warning').addClass('bg-danger');
        $('#connection-status i').removeClass('fa-wifi').addClass('fa-exclamation-triangle');
        $('#connection-status').html('<i class="fas fa-exclamation-triangle"></i> Terputus');
      }
    });
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Manual refresh button
    $('#refresh-data').on('click', function(e) {
      e.preventDefault();
      const data = getLastSensorData();
      if (data) {
        $(document).trigger('sensorDataUpdated', [data]);
        showNotification('success', 'Data berhasil diperbarui!');
      } else {
        showNotification('warning', 'Tidak ada data baru tersedia');
      }
    });
    
    // Toggle auto refresh
    $('#toggle-auto-refresh').on('click', function(e) {
      e.preventDefault();
      dashboardConfig.autoRefresh = !dashboardConfig.autoRefresh;
      
      // Update button UI
      $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
      
      // Show notification
      if (dashboardConfig.autoRefresh) {
        showNotification('info', 'Auto-refresh diaktifkan');
      } else {
        showNotification('info', 'Auto-refresh dinonaktifkan');
      }
    });
    
    // Export data button
    $('#export-data').on('click', function(e) {
      e.preventDefault();
      exportData();
    });
    
    // Chart time range buttons
    $('#time-range-hour, #time-range-day, #time-range-week').on('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all buttons
      $('#time-range-hour, #time-range-day, #time-range-week').removeClass('active');
      
      // Add active class to clicked button
      $(this).addClass('active');
      
      // Get range and update charts
      const range = $(this).attr('id').replace('time-range-', '');
      updateChartTimeRange(range);
    });
    
    // Toggle voltage display
    $('#toggle-voltage-type').on('click', function(e) {
      e.preventDefault();
      toggleVoltageDisplay();
    });
    
    // Event handler for sensor data updates
    $(document).on('sensorDataUpdated', function(event, data) {
      // Check thresholds and alert if needed
      if (dashboardConfig.alertEnabled) {
        checkAlertThresholds(data);
      }
    });
  }
  
  /**
   * Initialize tooltips
   */
  function initTooltips() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  /**
   * Toggle voltage display
   */
  function toggleVoltageDisplay() {
    const voltageCard = $('.voltage-display');
    const isBarDisplay = voltageCard.hasClass('bar-display');
    
    if (isBarDisplay) {
      voltageCard.removeClass('bar-display').addClass('gauge-display');
      $('#toggle-voltage-type').html('<i class="fas fa-exchange-alt me-1"></i> Bar Display');
    } else {
      voltageCard.removeClass('gauge-display').addClass('bar-display');
      $('#toggle-voltage-type').html('<i class="fas fa-exchange-alt me-1"></i> Gauge Display');
    }
    
    // Redraw voltage displays after changing mode
    updateVoltageDisplays();
  }
  
  /**
   * Update voltage displays
   */
  function updateVoltageDisplays() {
    // This function would update the voltage display based on current mode
    // Implementation depends on the display components chosen
    console.log('Updating voltage displays');
  }
  
  /**
   * Update chart time range
   * @param {string} range - Time range (hour, day, week)
   */
  function updateChartTimeRange(range) {
    let points = 20; // Default
    
    // Set points based on range
    switch (range) {
      case 'hour':
        points = 20;
        break;
      case 'day':
        points = 60;
        break;
      case 'week':
        points = 120;
        break;
    }
    
    // Update chart config if available
    if (window.chartConfig) {
      window.chartConfig.displayPoints = points;
      
      // Update visible points info
      $('#visible-points-info').text(`Menampilkan ${points} titik data`);
      
      // If we have the enhanced charts, use their methods
      if (typeof updateAllCharts === 'function') {
        updateAllCharts();
      }
    }
    
    // Show notification
    showNotification('info', `Range waktu diubah ke: ${range}`);
  }
  
  /**
   * Check data against alert thresholds
   * @param {object} data - Sensor data
   */
  function checkAlertThresholds(data) {
    let alerts = [];
    
    // Check voltage
    if (data.Vavg !== undefined) {
      const vavg = parseFloat(data.Vavg);
      const vThreshold = dashboardConfig.alertThresholds.voltage;
      
      if (vavg < vThreshold.min) {
        alerts.push(`Tegangan (${vavg.toFixed(2)} V) di bawah minimum (${vThreshold.min} V)`);
      } else if (vavg > vThreshold.max) {
        alerts.push(`Tegangan (${vavg.toFixed(2)} V) melebihi maksimum (${vThreshold.max} V)`);
      }
    }
    
    // Check current
    if (data.Iavg !== undefined) {
      const iavg = parseFloat(data.Iavg);
      const iThreshold = dashboardConfig.alertThresholds.current;
      
      if (iavg < iThreshold.min) {
        alerts.push(`Arus (${iavg.toFixed(2)} A) di bawah minimum (${iThreshold.min} A)`);
      } else if (iavg > iThreshold.max) {
        alerts.push(`Arus (${iavg.toFixed(2)} A) melebihi maksimum (${iThreshold.max} A)`);
      }
    }
    
    // Check power
    if (data.Ptot !== undefined) {
      const ptot = parseFloat(data.Ptot);
      const pThreshold = dashboardConfig.alertThresholds.power;
      
      if (ptot < pThreshold.min) {
        alerts.push(`Daya (${ptot.toFixed(2)} kW) di bawah minimum (${pThreshold.min} kW)`);
      } else if (ptot > pThreshold.max) {
        alerts.push(`Daya (${ptot.toFixed(2)} kW) melebihi maksimum (${pThreshold.max} kW)`);
      }
    }
    
    // Display alerts if any
    alerts.forEach(alert => {
      showNotification('warning', alert);
    });
  }
  
  /**
   * Export data to CSV
   */
  function exportData() {
    // Get current data
    const data = getLastSensorData();
    if (!data) {
      showNotification('danger', 'Tidak ada data untuk diekspor');
      return;
    }
    
    // Define units based on unit system
    const units = {
      Vavg: 'V',
      Iavg: 'A',
      Ptot: dashboardConfig.unitSystem === 'metric' ? 'kW' : 'HP',
      Edel: dashboardConfig.unitSystem === 'metric' ? 'kWh' : 'HP-h',
      V1: 'V',
      V2: 'V',
      V3: 'V'
    };
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Parameter,Nilai,Satuan\r\n";
    
    // Add data rows
    Object.keys(data).forEach(key => {
      let value = data[key];
      
      // Convert units if needed
      if (dashboardConfig.unitSystem === 'imperial' && key === 'Ptot') {
        // Convert kW to HP (1 kW = 1.34102 HP)
        value = (value * 1.34102).toFixed(4);
      } else if (dashboardConfig.unitSystem === 'imperial' && key === 'Edel') {
        // Convert kWh to HP-h (1 kWh = 1.34102 HP-h)
        value = (value * 1.34102).toFixed(4);
      }
      
      csvContent += `${key},${value},${units[key] || ''}\r\n`;
    });
    
    // Add timestamp
    const timestamp = new Date().toLocaleString('id-ID');
    csvContent += `Timestamp,${timestamp},''\r\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const filename = `sensor_data_${new Date().toISOString().slice(0,10)}.csv`;
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification('success', `Data berhasil diekspor ke ${filename}`);
  }
  
  /**
   * Initialize the dashboard when DOM ready
   */
  $(document).ready(function() {
    // Initialize dashboard only on dashboard page
    if ($('#dashboard-cards').length > 0) {
      initDashboard();
    }
  });