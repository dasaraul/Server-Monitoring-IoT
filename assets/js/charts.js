// File: assets/js/charts.js
// Skrip untuk mengelola chart/visualisasi
// Status: [new]

// Objek untuk menyimpan semua chart
const charts = {};

// Variabel untuk menyimpan data historis
let historicalData = {
  timestamps: [],
  vavg: [],
  iavg: [],
  ptot: [],
  v1: [],
  v2: [],
  v3: []
};

// Warna untuk chart
const chartColors = {
  voltage: 'rgba(54, 162, 235, 0.7)',
  current: 'rgba(255, 99, 132, 0.7)',
  power: 'rgba(75, 192, 192, 0.7)',
  energy: 'rgba(255, 159, 64, 0.7)',
  v1: 'rgba(153, 102, 255, 0.7)',
  v2: 'rgba(54, 162, 235, 0.7)',
  v3: 'rgba(255, 99, 132, 0.7)'
};

// Maksimal data point untuk chart
const MAX_DATA_POINTS = 20;

// Inisialisasi Chart
function initCharts() {
  // Chart tegangan rata-rata (Vavg)
  charts.vavgChart = new Chart(document.getElementById('vavg-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Tegangan Rata-rata (V)',
        data: [],
        borderColor: chartColors.voltage,
        backgroundColor: chartColors.voltage.replace('0.7', '0.1'),
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: chartColors.voltage,
        tension: 0.4
      }]
    },
    options: getChartOptions('Tegangan Rata-rata (V)')
  });

  // Chart arus rata-rata (Iavg)
  charts.iavgChart = new Chart(document.getElementById('iavg-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Arus Rata-rata (A)',
        data: [],
        borderColor: chartColors.current,
        backgroundColor: chartColors.current.replace('0.7', '0.1'),
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: chartColors.current,
        tension: 0.4
      }]
    },
    options: getChartOptions('Arus Rata-rata (A)')
  });

  // Chart daya total (Ptot)
  charts.ptotChart = new Chart(document.getElementById('ptot-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Daya Total (kW)',
        data: [],
        borderColor: chartColors.power,
        backgroundColor: chartColors.power.replace('0.7', '0.1'),
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: chartColors.power,
        tension: 0.4
      }]
    },
    options: getChartOptions('Daya Total (kW)')
  });

  // Chart tegangan 3 fase (V1, V2, V3)
  charts.voltageChart = new Chart(document.getElementById('voltage-chart').getContext('2d'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'V1 (V)',
          data: [],
          borderColor: chartColors.v1,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.4
        },
        {
          label: 'V2 (V)',
          data: [],
          borderColor: chartColors.v2,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.4
        },
        {
          label: 'V3 (V)',
          data: [],
          borderColor: chartColors.v3,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.4
        }
      ]
    },
    options: getChartOptions('Tegangan 3 Fase (V)')
  });
}

// Opsi chart default
function getChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      },
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Waktu'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Nilai'
        },
        beginAtZero: false
      }
    }
  };
}

// Fungsi untuk memperbarui chart dengan data baru
function updateCharts(data) {
  if (!data) return;
  
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  // Perbarui data historis
  updateHistoricalData(timestamp, data);
  
  // Perbarui chart individu
  updateSingleChart(charts.vavgChart, historicalData.timestamps, historicalData.vavg);
  updateSingleChart(charts.iavgChart, historicalData.timestamps, historicalData.iavg);
  updateSingleChart(charts.ptotChart, historicalData.timestamps, historicalData.ptot);
  
  // Perbarui chart tegangan 3 fase
  updateVoltageChart();
}

// Perbarui data historis
function updateHistoricalData(timestamp, data) {
  // Tambahkan timestamp
  historicalData.timestamps.push(timestamp);
  
  // Tambahkan nilai sensor
  historicalData.vavg.push(parseFloat(data.Vavg) || 0);
  historicalData.iavg.push(parseFloat(data.Iavg) || 0);
  historicalData.ptot.push(parseFloat(data.Ptot) || 0);
  historicalData.v1.push(parseFloat(data.V1) || 0);
  historicalData.v2.push(parseFloat(data.V2) || 0);
  historicalData.v3.push(parseFloat(data.V3) || 0);
  
  // Batasi jumlah data point 
  if (historicalData.timestamps.length > MAX_DATA_POINTS) {
    historicalData.timestamps.shift();
    historicalData.vavg.shift();
    historicalData.iavg.shift();
    historicalData.ptot.shift();
    historicalData.v1.shift();
    historicalData.v2.shift();
    historicalData.v3.shift();
  }
}

// Perbarui chart tunggal
function updateSingleChart(chart, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Perbarui chart tegangan 3 fase
function updateVoltageChart() {
  charts.voltageChart.data.labels = historicalData.timestamps;
  charts.voltageChart.data.datasets[0].data = historicalData.v1;
  charts.voltageChart.data.datasets[1].data = historicalData.v2;
  charts.voltageChart.data.datasets[2].data = historicalData.v3;
  charts.voltageChart.update();
}

// Event listener untuk pembaruan data sensor
$(document).on('sensorDataUpdated', function(event, data) {
  updateCharts(data);
});

// Inisialisasi chart ketika DOM dimuat
$(document).ready(function() {
  // Inisialisasi chart jika berada di halaman dashboard
  if ($('#vavg-chart').length > 0) {
    initCharts();
  }
});