// manage kalkulasi statistik dari data sensor

/**
 * Objek untuk mengelola statistik data sensor
 */
const statisticsManager = {
    // Data statistik yang dihitung
    stats: {
      vavg: { min: null, max: null, avg: null },
      iavg: { min: null, max: null, avg: null },
      ptot: { min: null, max: null, avg: null },
      vPhase: { min: null, max: null, avg: null }
    },
    
    /**
     * Menghitung statistik dari data historis
     * @param {object} historicalData Data historis sensor
     */
    calculateStats: function(historicalData) {
      // Pastikan data tersedia
      if (!historicalData || !historicalData.vavg || historicalData.vavg.length === 0) {
        return;
      }
      
      // Perhitungan untuk Tegangan Rata-rata (vavg)
      const vavgValues = historicalData.vavg.filter(v => !isNaN(v));
      if (vavgValues.length > 0) {
        this.stats.vavg.min = Math.min(...vavgValues);
        this.stats.vavg.max = Math.max(...vavgValues);
        this.stats.vavg.avg = this.calculateAverage(vavgValues);
      }
      
      // Perhitungan untuk Arus Rata-rata (iavg)
      const iavgValues = historicalData.iavg.filter(v => !isNaN(v));
      if (iavgValues.length > 0) {
        this.stats.iavg.min = Math.min(...iavgValues);
        this.stats.iavg.max = Math.max(...iavgValues);
        this.stats.iavg.avg = this.calculateAverage(iavgValues);
      }
      
      // Perhitungan untuk Daya Total (ptot)
      const ptotValues = historicalData.ptot.filter(v => !isNaN(v));
      if (ptotValues.length > 0) {
        this.stats.ptot.min = Math.min(...ptotValues);
        this.stats.ptot.max = Math.max(...ptotValues);
        this.stats.ptot.avg = this.calculateAverage(ptotValues);
      }
      
      // Perhitungan untuk Tegangan 3 Fase (v1, v2, v3)
      // Menggabungkan semua nilai tegangan fase
      const v1Values = historicalData.v1.filter(v => !isNaN(v));
      const v2Values = historicalData.v2.filter(v => !isNaN(v));
      const v3Values = historicalData.v3.filter(v => !isNaN(v));
      
      // Gabungkan semua nilai fase untuk statistik
      const allPhaseValues = [...v1Values, ...v2Values, ...v3Values];
      if (allPhaseValues.length > 0) {
        this.stats.vPhase.min = Math.min(...allPhaseValues);
        this.stats.vPhase.max = Math.max(...allPhaseValues);
        this.stats.vPhase.avg = this.calculateAverage(allPhaseValues);
      }
      
      // Update tampilan UI
      this.updateStatsDisplay();
    },
    
    /**
     * Menghitung nilai rata-rata dari array
     * @param {array} values Array nilai
     * @return {number} Nilai rata-rata
     */
    calculateAverage: function(values) {
      if (!values || values.length === 0) return 0;
      const sum = values.reduce((a, b) => a + b, 0);
      return sum / values.length;
    },
    
    /**
     * Update tampilan statistik di UI
     */
    updateStatsDisplay: function() {
      // Format dan tampilkan Tegangan Rata-rata (vavg)
      $('#vavg-min').text(this.formatNumber(this.stats.vavg.min));
      $('#vavg-avg').text(this.formatNumber(this.stats.vavg.avg));
      $('#vavg-max').text(this.formatNumber(this.stats.vavg.max));
      
      // Format dan tampilkan Arus Rata-rata (iavg)
      $('#iavg-min').text(this.formatNumber(this.stats.iavg.min, 4));
      $('#iavg-avg').text(this.formatNumber(this.stats.iavg.avg, 4));
      $('#iavg-max').text(this.formatNumber(this.stats.iavg.max, 4));
      
      // Format dan tampilkan Daya Total (ptot)
      $('#ptot-min').text(this.formatNumber(this.stats.ptot.min, 4));
      $('#ptot-avg').text(this.formatNumber(this.stats.ptot.avg, 4));
      $('#ptot-max').text(this.formatNumber(this.stats.ptot.max, 4));
      
      // Format dan tampilkan Tegangan 3 Fase (vPhase)
      $('#v-phase-min').text(this.formatNumber(this.stats.vPhase.min));
      $('#v-phase-avg').text(this.formatNumber(this.stats.vPhase.avg));
      $('#v-phase-max').text(this.formatNumber(this.stats.vPhase.max));
    },
    
    /**
     * Format angka dengan jumlah desimal yang ditentukan
     * @param {number} value Nilai yang akan diformat
     * @param {number} decimals Jumlah desimal (default: 2)
     * @return {string} Nilai terformat
     */
    formatNumber: function(value, decimals = 2) {
      if (value === null || value === undefined || isNaN(value)) {
        return '-';
      }
      return value.toFixed(decimals);
    },
    
    /**
     * Reset semua statistik
     */
    resetStats: function() {
      this.stats = {
        vavg: { min: null, max: null, avg: null },
        iavg: { min: null, max: null, avg: null },
        ptot: { min: null, max: null, avg: null },
        vPhase: { min: null, max: null, avg: null }
      };
      
      this.updateStatsDisplay();
    }
  };
  
  // Event listener untuk pembaruan data sensor
  $(document).on('sensorDataUpdated', function(event, data) {
    // Hitung statistik saat update data
    if (window.historicalData) {
      statisticsManager.calculateStats(window.historicalData);
    }
  });
  
  // Inisialisasi saat DOM dimuat
  $(document).ready(function() {
    // Fungsi refresh statistik
    $('#refresh-stats').on('click', function() {
      if (window.historicalData) {
        statisticsManager.calculateStats(window.historicalData);
      }
    });
  });