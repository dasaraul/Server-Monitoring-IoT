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
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width, 
  height, 
  backgroundColour: '#f9fafb',
  plugins: {
    requireLegacy: ['chartjs-plugin-datalabels']
  }
});

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
      if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      return entry.time || ""; // Fallback ke properti time jika timestamp tidak ada
    }),
    datasets: [
      {
        label: 'Fase 1',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        data: data.map(entry => entry.V1 || entry.v1 || 100), // Support berbagai format properti
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Fase 2',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        data: data.map(entry => entry.V2 || entry.v2 || 100),
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      },
      {
        label: 'Fase 3',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        data: data.map(entry => entry.V3 || entry.v3 || 100),
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2
      }
    ]
  };
  
  const configuration = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      devicePixelRatio: 2,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Tegangan (V) - 24 Jam Terakhir',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' V';
            }
          }
        }
      },
      scales: {
        y: {
          min: 95,
          max: 105,
          title: {
            display: true,
            text: 'Voltase (V)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            precision: 1
          }
        },
        x: {
          title: {
            display: true,
            text: 'Waktu',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  };
  
  try {
    // Buat grafik dan simpan sebagai file
    console.log(`Membuat grafik tegangan ke: ${outputPath}`);
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync(outputPath, image);
    console.log(`Grafik tegangan berhasil dibuat`);
    return outputPath;
  } catch (error) {
    console.error('Error saat membuat grafik tegangan:', error);
    throw error;
  }
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
      if (entry.timestamp) {
        const date = new Date(entry.timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      return entry.time || ""; // Fallback ke properti time jika timestamp tidak ada
    }),
    datasets: [
      {
        label: 'Arus (A)',
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        data: data.map(entry => entry.Iavg || entry.iavg || 0.06),
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Daya (W)',
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        data: data.map(entry => {
          // Konversi ke Watt dari kW jika ada
          const power = entry.Ptot || entry.ptot || 0.01;
          return power * 1000; // Konversi kW ke W
        }),
        tension: 0.4,
        pointRadius: 3,
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };
  
  const configuration = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      devicePixelRatio: 2,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Arus (A) dan Daya (W) - 24 Jam Terakhir',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context) {
              if (context.dataset.yAxisID === 'y') {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(5) + ' A';
              } else {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' W';
              }
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Arus (A)',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
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
            text: 'Daya (W)',
            font: {
              weight: 'bold'
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Waktu',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  };
  
  try {
    // Buat grafik dan simpan sebagai file
    console.log(`Membuat grafik arus dan daya ke: ${outputPath}`);
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync(outputPath, image);
    console.log(`Grafik arus dan daya berhasil dibuat`);
    return outputPath;
  } catch (error) {
    console.error('Error saat membuat grafik arus dan daya:', error);
    throw error;
  }
}

// Ekspor semua fungsi util
module.exports = {
  registerHandlebarsHelpers,
  createVoltageChart,
  createCurrentPowerChart
};