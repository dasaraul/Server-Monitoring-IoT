$(document).ready(function() {
  // Measurement units
  const units = {
    Vavg: 'V',
    Iavg: 'A',
    Ptot: 'kW',
    Edel: 'kWh',
    V1: 'V',
    V2: 'V',
    V3: 'V'
  };
  
  // Format number with 2 decimals
  function formatNumber(value) {
    if (value === undefined || value === null) return '-';
    return parseFloat(value).toFixed(2);
  }
  
  // Update dashboard cards with new data
  function updateDashboardCards(data) {
    if (!data) return;
    
    // Update value for each card
    Object.keys(data).forEach(key => {
      const cardElement = $(`#${key.toLowerCase()}-value`);
      if (cardElement.length) {
        cardElement.text(formatNumber(data[key]) + ' ' + (units[key] || ''));
      }
    });
    
    // Update progress bars
    updateProgressBars(data);
    
    // Update phase voltage status badges
    updatePhaseBadges(data);
  }
  
  // Update progress bars on dashboard
  function updateProgressBars(data) {
    // Voltage progress (based on normal 220V)
    if (data.Vavg !== undefined) {
      const vPercent = Math.min((data.Vavg / 220) * 100, 100);
      $('#voltage-progress .progress-bar')
        .css('width', vPercent + '%')
        .attr('aria-valuenow', vPercent);
    }
    
    // Current progress (max scale 10A)
    if (data.Iavg !== undefined) {
      const iPercent = Math.min((data.Iavg / 10) * 100, 100);
      $('#current-progress .progress-bar')
        .css('width', iPercent + '%')
        .attr('aria-valuenow', iPercent);
    }
    
    // Power progress (max scale 5kW)
    if (data.Ptot !== undefined) {
      const pPercent = Math.min((data.Ptot / 5) * 100, 100);
      $('#power-progress .progress-bar')
        .css('width', pPercent + '%')
        .attr('aria-valuenow', pPercent);
    }
  }
  
  // Update status badges for voltage phases
  function updatePhaseBadges(data) {
    // Check each phase voltage
    ['V1', 'V2', 'V3'].forEach(phase => {
      if (data[phase] !== undefined) {
        const value = parseFloat(data[phase]);
        const badgeElement = $(`#${phase.toLowerCase()}-badge`);
        
        if (value < 200) {
          badgeElement.removeClass('bg-success bg-warning').addClass('bg-danger');
          badgeElement.text('Rendah');
        } else if (value > 240) {
          badgeElement.removeClass('bg-success bg-warning').addClass('bg-danger');
          badgeElement.text('Tinggi');
        } else {
          badgeElement.removeClass('bg-danger bg-warning').addClass('bg-success');
          badgeElement.text('Normal');
        }
      }
    });
  }
  
  // Event listener for sensor data updates
  $(document).on('sensorDataUpdated', function(event, data) {
    // Update dashboard cards
    updateDashboardCards(data);
    
    // Update status indicator
    $('#status-indicator').removeClass('bg-danger').addClass('bg-success');
    
    // Update last update time in status details
    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID');
    $('#last-update-detail').text(formattedTime);
  });
  
  // If on dashboard page, update cards with stored data
  if ($('#dashboard-cards').length > 0) {
    const data = getLastSensorData();
    if (data) {
      updateDashboardCards(data);
    }
  }
  
  // Manual refresh button
  $('#refresh-data').on('click', function(e) {
    e.preventDefault();
    const data = getLastSensorData();
    if (data) {
      updateDashboardCards(data);
      updateTimestamp();
      
      // Show notification
      showNotification('success', 'Data berhasil diperbarui!');
    } else {
      showNotification('warning', 'Tidak ada data sensor tersedia.');
    }
  });
  
  // Time range buttons for charts
  $('[id^="time-range-"]').on('click', function(e) {
    e.preventDefault();
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    
    // TODO: Implement time range filtering for charts
    const range = $(this).attr('id').replace('time-range-', '');
    showNotification('info', `Range waktu diubah ke: ${range}`);
  });
  
  // Export CSV button
  $('#export-data').on('click', function(e) {
    e.preventDefault();
    exportToCSV();
  });
  
  // Email report button
  $('#send-report-btn').on('click', function(e) {
    e.preventDefault();
    sendEmailReport($(this));
  });
  
  // Toggle button for 3-phase voltage view
  $('#toggle-voltage-type').on('click', function(e) {
    e.preventDefault();
    // TODO: Implement toggle between different voltage visualizations
    showNotification('info', 'Tampilan diubah.');
  });
  
  // Function to export data to CSV
  function exportToCSV() {
    // Get data from Firebase
    const data = getLastSensorData();
    if (!data) {
      showNotification('danger', 'Tidak ada data untuk diekspor');
      return;
    }
    
    // CSV header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Parameter,Nilai,Satuan\r\n";
    
    // Add data to CSV
    Object.keys(data).forEach(key => {
      csvContent += `${key},${data[key]},${units[key] || ''}\r\n`;
    });
    
    // Add timestamp
    const timestamp = new Date().toLocaleString('id-ID');
    csvContent += `Timestamp,${timestamp},''\r\n`;
    
    // Encode URI and download
    const encodedUri = encodeURI(csvContent);
    const filename = `sensor_data_${new Date().toISOString().slice(0,10)}.csv`;
    
    // Create download link
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    showNotification('success', `Data berhasil diekspor ke ${filename}`);
  }
  
  // Send email report
  function sendEmailReport(button) {
    // Show loading spinner
    const originalText = button.html();
    button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
    button.prop('disabled', true);
    
    // Send request to send-email.php
    $.ajax({
      url: 'includes/send-email.php',
      type: 'POST',
      dataType: 'json',
      success: function(response) {
        // Restore button
        button.html(originalText);
        button.prop('disabled', false);
        
        // Show notification based on response
        if (response.success) {
          showNotification('success', 'Laporan berhasil dikirim ke email!');
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
  }
  
  // Show notification toast
  function showNotification(type, message) {
    const notificationDiv = $('<div>').addClass(`alert alert-${type} alert-dismissible fade show notification-toast`);
    notificationDiv.html(`
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `);
    
    // Add to body
    $('body').append(notificationDiv);
    
    // Remove after 5 seconds
    setTimeout(function() {
      notificationDiv.alert('close');
    }, 5000);
  }
  
  // Refresh email logs on reports page
  $('#refresh-logs').on('click', function(e) {
    e.preventDefault();
    // TODO: Implement email logs refresh
    showNotification('info', 'Log email diperbarui');
  });
});