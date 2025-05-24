const charts = {};
let historicalData = {
  timestamps: [],
  vavg: [],
  iavg: [],
  ptot: [],
  v1: [],
  v2: [],
  v3: []
};

// Maximum data points for real-time charts
const MAX_DATA_POINTS = 20;

// Initialize all charts
function initCharts() {
  // Default chart colors
  updateChartColors();
  
  // Average Voltage Chart (Vavg)
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

  // Average Current Chart (Iavg)
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

  // Total Power Chart (Ptot)
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

  // 3-Phase Voltage Chart (V1, V2, V3)
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
  
  // Set up download chart events
  setupChartDownloads();
}

// Update chart colors based on dark mode
function updateChartColors() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  chartColors = {
    voltage: isDarkMode ? 'rgba(29, 205, 159, 0.8)' : 'rgba(29, 205, 159, 0.7)',
    current: isDarkMode ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 0.7)',
    power: isDarkMode ? 'rgba(255, 159, 64, 0.8)' : 'rgba(255, 159, 64, 0.7)',
    energy: isDarkMode ? 'rgba(153, 102, 255, 0.8)' : 'rgba(153, 102, 255, 0.7)',
    v1: isDarkMode ? 'rgba(29, 205, 159, 0.8)' : 'rgba(29, 205, 159, 0.7)',
    v2: isDarkMode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.7)',
    v3: isDarkMode ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 0.7)'
  };
}

// Update chart theme when dark mode changes
function updateChartTheme() {
  updateChartColors();
  
  // Update all charts with new colors
  if (charts.vavgChart) {
    charts.vavgChart.data.datasets[0].borderColor = chartColors.voltage;
    charts.vavgChart.data.datasets[0].backgroundColor = chartColors.voltage.replace('0.7', '0.1');
    charts.vavgChart.data.datasets[0].pointBackgroundColor = chartColors.voltage;
    charts.vavgChart.update();
  }
  
  if (charts.iavgChart) {
    charts.iavgChart.data.datasets[0].borderColor = chartColors.current;
    charts.iavgChart.data.datasets[0].backgroundColor = chartColors.current.replace('0.7', '0.1');
    charts.iavgChart.data.datasets[0].pointBackgroundColor = chartColors.current;
    charts.iavgChart.update();
  }
  
  if (charts.ptotChart) {
    charts.ptotChart.data.datasets[0].borderColor = chartColors.power;
    charts.ptotChart.data.datasets[0].backgroundColor = chartColors.power.replace('0.7', '0.1');
    charts.ptotChart.data.datasets[0].pointBackgroundColor = chartColors.power;
    charts.ptotChart.update();
  }
  
  if (charts.voltageChart) {
    charts.voltageChart.data.datasets[0].borderColor = chartColors.v1;
    charts.voltageChart.data.datasets[1].borderColor = chartColors.v2;
    charts.voltageChart.data.datasets[2].borderColor = chartColors.v3;
    charts.voltageChart.update();
  }
}

// Default chart options
function getChartOptions(title) {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDarkMode ? '#f9fafb' : '#212529';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'normal'
        },
        color: textColor
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode ? '#fff' : '#333',
        bodyColor: isDarkMode ? '#fff' : '#333',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Waktu',
          color: textColor
        },
        grid: {
          display: false
        },
        ticks: {
          color: textColor
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Nilai',
          color: textColor
        },
        beginAtZero: false,
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    }
  };
}

// Set up chart download buttons
function setupChartDownloads() {
  // Vavg chart download
  $('#download-vavg-chart').on('click', function(e) {
    e.preventDefault();
    downloadChart(charts.vavgChart, 'tegangan-rata-rata');
  });
  
  // Iavg chart download
  $('#download-iavg-chart').on('click', function(e) {
    e.preventDefault();
    downloadChart(charts.iavgChart, 'arus-rata-rata');
  });
  
  // Ptot chart download
  $('#download-ptot-chart').on('click', function(e) {
    e.preventDefault();
    downloadChart(charts.ptotChart, 'daya-total');
  });
  
  // Voltage chart download
  $('#download-voltage-chart').on('click', function(e) {
    e.preventDefault();
    downloadChart(charts.voltageChart, 'tegangan-3-fase');
  });
  
  // Reset zoom buttons
  $('.dropdown-menu [id^="reset-"]').on('click', function(e) {
    e.preventDefault();
    const chartId = $(this).attr('id').replace('reset-', '').replace('-chart', '');
    if (charts[chartId + 'Chart']) {
      charts[chartId + 'Chart'].resetZoom();
    }
  });
}

// Download chart as image
function downloadChart(chart, filename) {
  if (!chart) return;
  
  const canvas = chart.canvas;
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename + '-' + new Date().toISOString().slice(0, 10) + '.png';
  link.href = image;
  link.click();
}

// Update charts with new data
function updateCharts(data) {
  if (!data) return;
  
  const timestamp = new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  // Update historical data
  updateHistoricalData(timestamp, data);
  
  // Update individual charts
  updateSingleChart(charts.vavgChart, historicalData.timestamps, historicalData.vavg);
  updateSingleChart(charts.iavgChart, historicalData.timestamps, historicalData.iavg);
  updateSingleChart(charts.ptotChart, historicalData.timestamps, historicalData.ptot);
  
  // Update 3-phase voltage chart
  updateVoltageChart();
  
  // Add animation class to show fresh data
  $('.metric-value').addClass('fresh-data');
  setTimeout(() => {
    $('.metric-value').removeClass('fresh-data');
  }, 1500);
}

// Update historical data
function updateHistoricalData(timestamp, data) {
  // Add timestamp
  historicalData.timestamps.push(timestamp);
  
  // Add sensor values
  historicalData.vavg.push(parseFloat(data.Vavg) || 0);
  historicalData.iavg.push(parseFloat(data.Iavg) || 0);
  historicalData.ptot.push(parseFloat(data.Ptot) || 0);
  historicalData.v1.push(parseFloat(data.V1) || 0);
  historicalData.v2.push(parseFloat(data.V2) || 0);
  historicalData.v3.push(parseFloat(data.V3) || 0);
  
  // Limit number of data points 
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

// Update a single chart
function updateSingleChart(chart, labels, data) {
  if (!chart) return;
  
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Update 3-phase voltage chart
function updateVoltageChart() {
  if (!charts.voltageChart) return;
  
  charts.voltageChart.data.labels = historicalData.timestamps;
  charts.voltageChart.data.datasets[0].data = historicalData.v1;
  charts.voltageChart.data.datasets[1].data = historicalData.v2;
  charts.voltageChart.data.datasets[2].data = historicalData.v3;
  charts.voltageChart.update();
}

// Event listener for sensor data updates
$(document).on('sensorDataUpdated', function(event, data) {
  updateCharts(data);
});

// Initialize charts when DOM is loaded
$(document).ready(function() {
  // Initialize charts if on dashboard page
  if ($('#vavg-chart').length > 0) {
    initCharts();
  }
  
  // Listen for dark mode changes to update chart theme
  window.addEventListener('darkModeChanged', updateChartTheme);
});