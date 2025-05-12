// File: assets/js/main.js
// Skrip utama untuk fungsionalitas website
// Status: [new]

// Tunggu DOM selesai dimuat
$(document).ready(function() {
    // Refresh otomatis data setiap 3 detik (jika tidak ada Firebase listener aktif)
    const AUTO_REFRESH_INTERVAL = 3000; // 3 detik
    
    // Nilai awal dan satuan pengukuran
    const units = {
      Vavg: 'V',
      Iavg: 'A',
      Ptot: 'kW',
      Edel: 'kWh',
      V1: 'V',
      V2: 'V',
      V3: 'V'
    };
    
    // Format angka dengan 2 desimal
    function formatNumber(value) {
      if (value === undefined || value === null) return '-';
      return parseFloat(value).toFixed(2);
    }
    
    // Update nilai-nilai pada dashboard cards
    function updateDashboardCards(data) {
      if (!data) return;
      
      // Update nilai untuk setiap kartu
      Object.keys(data).forEach(key => {
        const cardElement = $(`#${key.toLowerCase()}-value`);
        if (cardElement.length) {
          cardElement.text(formatNumber(data[key]) + ' ' + (units[key] || ''));
        }
      });
      
      // Update progress bars jika ada
      updateProgressBars(data);
    }
    
    // Update progress bars pada dashboard
    function updateProgressBars(data) {
      // Voltage progress (berdasarkan tegangan normal 220V)
      if (data.Vavg !== undefined) {
        const vPercent = Math.min((data.Vavg / 220) * 100, 100);
        $('#voltage-progress .progress-bar')
          .css('width', vPercent + '%')
          .attr('aria-valuenow', vPercent);
      }
      
      // Current progress (skala maksimum 10A)
      if (data.Iavg !== undefined) {
        const iPercent = Math.min((data.Iavg / 10) * 100, 100);
        $('#current-progress .progress-bar')
          .css('width', iPercent + '%')
          .attr('aria-valuenow', iPercent);
      }
      
      // Power progress (skala maksimum 5kW)
      if (data.Ptot !== undefined) {
        const pPercent = Math.min((data.Ptot / 5) * 100, 100);
        $('#power-progress .progress-bar')
          .css('width', pPercent + '%')
          .attr('aria-valuenow', pPercent);
      }
    }
    
    // Event listener untuk pembaruan data sensor
    $(document).on('sensorDataUpdated', function(event, data) {
      // Update kartu dashboard
      updateDashboardCards(data);
      
      // Perbarui indikator status
      $('#status-indicator').removeClass('bg-danger').addClass('bg-success');
    });
    
    // Cek koneksi dan status setiap 10 detik
    setInterval(function() {
      // Cek jika data terakhir sudah terlalu lama (lebih dari 30 detik)
      if (lastUpdateTime) {
        const now = new Date();
        const diffSeconds = (now - lastUpdateTime) / 1000;
        
        // Jika lebih dari 30 detik, tampilkan peringatan
        if (diffSeconds > 30) {
          $('#connection-status').removeClass('bg-success').addClass('bg-warning');
          $('#connection-status i').removeClass('fa-wifi').addClass('fa-exclamation-triangle');
          $('#connection-status').html('<i class="fas fa-exclamation-triangle"></i> Tidak ada data baru');
        }
      }
    }, 10000);
    
    // Jika berada di halaman dashboard, perbarui data pada kartu
    if ($('#dashboard-cards').length > 0) {
      // Pertama kali dimuat, cek apakah ada data tersimpan
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
      }
    });
    
    // Periksa apakah tombol ekspor ada (halaman reports)
    if ($('#export-data').length > 0) {
      // Tombol ekspor data CSV
      $('#export-data').on('click', function(e) {
        e.preventDefault();
        exportToCSV();
      });
    }
    
    // Fungsi untuk mengekspor data ke CSV
    function exportToCSV() {
      // Ambil data dari Firebase (menggunakan fungsi dari firebase-config.js)
      const data = getLastSensorData();
      if (!data) {
        alert('Tidak ada data untuk diekspor');
        return;
      }
      
      // Header CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Parameter,Nilai,Satuan\r\n";
      
      // Tambahkan data ke CSV
      Object.keys(data).forEach(key => {
        csvContent += `${key},${data[key]},${units[key] || ''}\r\n`;
      });
      
      // Tambahkan timestamp
      const timestamp = new Date().toLocaleString('id-ID');
      csvContent += `Timestamp,${timestamp},''\r\n`;
      
      // Encode URI dan unduh
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sensor_data_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Kirim laporan email manual (untuk halaman reports)
    $('#send-report-btn').on('click', function(e) {
      e.preventDefault();
      
      // Tampilkan loading spinner
      const button = $(this);
      const originalText = button.html();
      button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
      button.prop('disabled', true);
      
      // Kirim permintaan ke send-email.php
      $.ajax({
        url: 'includes/send-email.php',
        type: 'POST',
        dataType: 'json',
        success: function(response) {
          // Kembalikan tampilan tombol
          button.html(originalText);
          button.prop('disabled', false);
          
          // Tampilkan pesan sesuai respons
          if (response.success) {
            // Tampilkan notifikasi sukses
            showNotification('success', 'Laporan berhasil dikirim ke email!');
          } else {
            // Tampilkan notifikasi error
            showNotification('danger', 'Gagal mengirim laporan: ' + response.message);
          }
        },
        error: function() {
          // Kembalikan tampilan tombol
          button.html(originalText);
          button.prop('disabled', false);
          
          // Tampilkan notifikasi error
          showNotification('danger', 'Terjadi kesalahan saat mengirim laporan.');
        }
      });
    });
    
    // Fungsi untuk menampilkan notifikasi
    function showNotification(type, message) {
      const notificationDiv = $('<div>').addClass(`alert alert-${type} alert-dismissible fade show notification-toast`);
      notificationDiv.html(`
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `);
      
      // Tambahkan ke body
      $('body').append(notificationDiv);
      
      // Hilangkan setelah 5 detik
      setTimeout(function() {
        notificationDiv.alert('close');
      }, 5000);
    }
  });