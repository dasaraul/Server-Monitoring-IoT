const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

/**
 * Util untuk membantu pembuatan grafik untuk laporan email
 * Grafik dibuat menggunakan ChartJS dan dikonversi ke gambar
 * untuk disematkan dalam email
 */

// Konfigurasi ChartJS Node Canvas
const width = 800;
const height = 400;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#f9fafb' });

/**
 * Daftar fungsi helper Handlebars untuk template
 */
function registerHandlebarsHelpers() {
  // Helper untuk perbandingan
  handlebars.registerHelper('eq', function (v1, v2) {
    return v1 === v2;
  });
  
  // Helper untuk format angka
  handlebars.registerHelper('formatNumber', function (value, decimal = 2) {
    if (typeof value !== 'number') return value;
    return value.toFixed(decimal);
  });
  
  // Helper untuk format tanggal
  handlebars.registerHelper('formatDate', function (date, format) {
    const moment = require('moment');
    moment.locale('id');
    return moment(date).format(format);
  });
}

/**
 * Membuat grafik tegangan dan menyimpannya sebagai file
 * @param {Array} data - Array data historis untuk grafik
 * @param {string} outputPath - Path untuk menyimpan file grafik
 */
async function createVoltageChart(data, outputPath) {
  // Format data untuk ChartJS
  const chartData = {
    labels: data.map(entry => {
      // Format tanggal untuk label
      const date = new Date(entry.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Fase 1',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        data: data.map(entry => entry.V1),
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'Fase 2',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        data: data.map(entry => entry.V2),
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'Fase 3',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        data: data.map(entry => entry.V3),
        tension: 0.4,
        pointRadius: 3,
      }
    ]
  };
  
  const configuration = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Tegangan (V) - 24 Jam Terakhir'
        }
      },
      scales: {
        y: {
          min: 95,
          max: 105,
          title: {
            display: true,
            text: 'Voltase (V)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Waktu'
          }
        }
      }
    }
  };
  
  // Buat grafik dan simpan sebagai file
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(outputPath, image);
  
  return outputPath;
}

/**
 * Membuat grafik arus dan daya dan menyimpannya sebagai file
 * @param {Array} data - Array data historis untuk grafik
 * @param {string} outputPath - Path untuk menyimpan file grafik
 */
async function createCurrentPowerChart(data, outputPath) {
  // Format data untuk ChartJS
  const chartData = {
    labels: data.map(entry => {
      // Format tanggal untuk label
      const date = new Date(entry.timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Arus (A)',
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        data: data.map(entry => entry.Iavg),
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'y'
      },
      {
        label: 'Daya (W)',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        data: data.map(entry => entry.Ptot * 1000), // Konversi ke Watt
        tension: 0.4,
        pointRadius: 3,
        yAxisID: 'y1'
      }
    ]
  };
  
  const configuration = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Arus (A) dan Daya (W) - 24 Jam Terakhir'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Arus (A)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: 'Daya (W)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Waktu'
          }
        }
      }
    }
  };
  
  // Buat grafik dan simpan sebagai file
  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync(outputPath, image);
  
  return outputPath;
}

// Ekspor semua fungsi util
module.exports = {
  registerHandlebarsHelpers,
  createVoltageChart,
  createCurrentPowerChart
};