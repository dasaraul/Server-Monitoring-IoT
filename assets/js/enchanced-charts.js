// Chart configuration and state
const chartConfig = {
    maxDataPoints: 120,       // Maximum data points to store (10 hours × 12 points per hour)
    updateInterval: 3000,     // Auto-update interval in ms (3 seconds)
    autoScroll: true,         // Auto scroll to newest data
    displayPoints: 60,        // Number of points to display in viewport
    darkModeEnabled: false    // Track dark mode state
  };
  
  // Store for historical data with timestamps
  const historicalData = {
    timestamps: [],
    vavg: [],
    iavg: [],
    ptot: [],
    v1: [],
    v2: [],
    v3: [],
    edel: []
  };
  
  // Chart instances
  let charts = {};
  
  // Chart colors for light and dark modes
  const chartColorSchemes = {
    light: {
      voltage: 'rgba(29, 205, 159, 0.8)',
      current: 'rgba(255, 99, 132, 0.8)',
      power: 'rgba(255, 159, 64, 0.8)',
      energy: 'rgba(153, 102, 255, 0.8)',
      v1: 'rgba(29, 205, 159, 0.8)',
      v2: 'rgba(54, 162, 235, 0.8)',
      v3: 'rgba(255, 99, 132, 0.8)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#212529',
      tooltipBg: 'rgba(255, 255, 255, 0.8)',
      tooltipText: '#333'
    },
    dark: {
      voltage: 'rgba(29, 205, 159, 0.8)',
      current: 'rgba(255, 99, 132, 0.8)',
      power: 'rgba(255, 159, 64, 0.8)',
      energy: 'rgba(153, 102, 255, 0.8)',
      v1: 'rgba(29, 205, 159, 0.8)',
      v2: 'rgba(54, 162, 235, 0.8)',
      v3: 'rgba(255, 99, 132, 0.8)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#f9fafb',
      tooltipBg: 'rgba(0, 0, 0, 0.8)',
      tooltipText: '#fff'
    }
  };
  
  // Return current color scheme based on dark mode
  function getCurrentColorScheme() {
    return chartConfig.darkModeEnabled ? chartColorSchemes.dark : chartColorSchemes.light;
  }
  
  // Initialize enhanced charts
  function initEnhancedCharts() {
    // Set dark mode state based on body class
    chartConfig.darkModeEnabled = document.body.classList.contains('dark-mode');
    
    // Register Chart.js plugins
    registerChartPlugins();
    
    // Create charts if elements exist
    if (document.getElementById('vavg-chart')) {
      createVoltageChart();
      createCurrentChart();
      createPowerChart();
      createThreePhaseChart();
      
      // Setup event listeners for chart interactions
      setupChartInteractions();
      
      // Start auto-update cycle
      startAutoUpdate();
    }
  }
  
  // Register custom plugins for Chart.js
  function registerChartPlugins() {
    // Custom plugin for tooltips formatting
    const timeTooltipPlugin = {
      id: 'timeTooltip',
      afterTooltipDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        
        // Add timestamp to tooltip
        if (args.tooltip && args.tooltip._active && args.tooltip._active.length) {
          const index = args.tooltip._active[0].index;
          if (historicalData.timestamps[index]) {
            const timestamp = historicalData.timestamps[index];
            
            // Add timestamp to tooltip
            const tooltipEl = args.tooltip;
            const lineHeight = tooltipEl.height / tooltipEl._body.length;
            
            ctx.fillStyle = getCurrentColorScheme().tooltipText;
            ctx.font = '11px Arial';
            ctx.fillText(`Time: ${timestamp}`, tooltipEl.x + 8, tooltipEl.y + tooltipEl.height + 5);
          }
        }
        
        ctx.restore();
      }
    };
    
    // Register the plugin
    Chart.register(timeTooltipPlugin);
  }
  
  // Create voltage average chart
  function createVoltageChart() {
    const ctx = document.getElementById('vavg-chart').getContext('2d');
    const colorScheme = getCurrentColorScheme();
    
    charts.vavgChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Tegangan Rata-rata (V)',
          data: [],
          borderColor: colorScheme.voltage,
          backgroundColor: colorScheme.voltage.replace('0.8', '0.1'),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: colorScheme.voltage,
          tension: 0.4,
          fill: true
        }]
      },
      options: getChartOptions('Tegangan Rata-rata (V)', 'V', true, [180, 260])
    });
  }
  
  // Create current average chart
  function createCurrentChart() {
    const ctx = document.getElementById('iavg-chart').getContext('2d');
    const colorScheme = getCurrentColorScheme();
    
    charts.iavgChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Arus Rata-rata (A)',
          data: [],
          borderColor: colorScheme.current,
          backgroundColor: colorScheme.current.replace('0.8', '0.1'),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: colorScheme.current,
          tension: 0.4,
          fill: true
        }]
      },
      options: getChartOptions('Arus Rata-rata (A)', 'A', true)
    });
  }
  
  // Create power total chart
  function createPowerChart() {
    const ctx = document.getElementById('ptot-chart').getContext('2d');
    const colorScheme = getCurrentColorScheme();
    
    charts.ptotChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Daya Total (kW)',
          data: [],
          borderColor: colorScheme.power,
          backgroundColor: colorScheme.power.replace('0.8', '0.1'),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointBackgroundColor: colorScheme.power,
          tension: 0.4,
          fill: true
        }]
      },
      options: getChartOptions('Daya Total (kW)', 'kW', true)
    });
  }
  
  // Create three-phase voltage chart
  function createThreePhaseChart() {
    const ctx = document.getElementById('voltage-chart').getContext('2d');
    const colorScheme = getCurrentColorScheme();
    
    charts.voltageChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Fase 1 (V)',
            data: [],
            borderColor: colorScheme.v1,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.4
          },
          {
            label: 'Fase 2 (V)',
            data: [],
            borderColor: colorScheme.v2,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.4
          },
          {
            label: 'Fase 3 (V)',
            data: [],
            borderColor: colorScheme.v3,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.4
          }
        ]
      },
      options: getChartOptions('Tegangan 3 Fase (V)', 'V', false, [180, 260])
    });
  }
  
  // Common chart options generator
  function getChartOptions(title, unit, fillArea = false, suggestedYRange = null) {
    const colorScheme = getCurrentColorScheme();
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300 // Faster animations
      },
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 16,
            weight: 'normal'
          },
          color: colorScheme.text,
          padding: {
            top: 10,
            bottom: 10
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: colorScheme.tooltipBg,
          titleColor: colorScheme.tooltipText,
          bodyColor: colorScheme.tooltipText,
          borderColor: colorScheme.grid,
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += parseFloat(context.parsed.y).toFixed(2) + ' ' + unit;
              }
              return label;
            }
          }
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: colorScheme.text,
            boxWidth: 12,
            padding: 10
          }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
            modifierKey: 'shift'
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true
            },
            mode: 'x',
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            parser: 'HH:mm:ss',
            tooltipFormat: 'HH:mm:ss',
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            }
          },
          display: true,
          grid: {
            display: true,
            color: colorScheme.grid
          },
          ticks: {
            color: colorScheme.text,
            maxRotation: 0,
            font: {
              size: 10
            }
          }
        },
        y: {
          display: true,
          beginAtZero: false,
          grid: {
            color: colorScheme.grid
          },
          ticks: {
            color: colorScheme.text,
            font: {
              size: 10
            },
            callback: function(value) {
              return value + ' ' + unit;
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      elements: {
        line: {
          tension: 0.4
        }
      }
    };
    
    // Set y-axis range if suggested
    if (suggestedYRange) {
      options.scales.y.min = suggestedYRange[0];
      options.scales.y.max = suggestedYRange[1];
      options.scales.y.suggestedMin = suggestedYRange[0];
      options.scales.y.suggestedMax = suggestedYRange[1];
    }
    
    return options;
  }
  
  // Handle data updates and refresh charts
  function updateCharts(data) {
    if (!data) return;
    
    // Format timestamp in HH:MM:SS format
    const now = new Date();
    const timestamp = now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    // Store timestamp as Date object for better time axis handling
    const timeObj = now;
    
    // Update historical data
    updateHistoricalData(timeObj, timestamp, data);
    
    // Get visible data window
    const visibleData = getVisibleDataWindow();
    
    // Update individual charts with visible data window
    updateSingleChart(charts.vavgChart, visibleData.timestamps, visibleData.vavg);
    updateSingleChart(charts.iavgChart, visibleData.timestamps, visibleData.iavg);
    updateSingleChart(charts.ptotChart, visibleData.timestamps, visibleData.ptot);
    
    // Update 3-phase voltage chart
    updateMultiSeriesChart(charts.voltageChart, visibleData.timestamps, [
      visibleData.v1, visibleData.v2, visibleData.v3
    ]);
    
    // Add animation class to show fresh data
    $('.metric-value').addClass('fresh-data');
    setTimeout(() => {
      $('.metric-value').removeClass('fresh-data');
    }, 1500);
  }
  
  // Update historical data storage
  function updateHistoricalData(timeObj, timestamp, data) {
    // Add timestamp
    historicalData.timestamps.push(timeObj);
    historicalData.timestampLabels = historicalData.timestampLabels || [];
    historicalData.timestampLabels.push(timestamp);
    
    // Add sensor values with validation
    historicalData.vavg.push(parseFloat(data.Vavg) || 0);
    historicalData.iavg.push(parseFloat(data.Iavg) || 0);
    historicalData.ptot.push(parseFloat(data.Ptot) || 0);
    historicalData.v1.push(parseFloat(data.V1) || 0);
    historicalData.v2.push(parseFloat(data.V2) || 0);
    historicalData.v3.push(parseFloat(data.V3) || 0);
    historicalData.edel.push(parseFloat(data.Edel) || 0);
    
    // Limit data points
    if (historicalData.timestamps.length > chartConfig.maxDataPoints) {
      historicalData.timestamps.shift();
      historicalData.timestampLabels.shift();
      historicalData.vavg.shift();
      historicalData.iavg.shift();
      historicalData.ptot.shift();
      historicalData.v1.shift();
      historicalData.v2.shift();
      historicalData.v3.shift();
      historicalData.edel.shift();
    }
  }
  
  // Get the visible window of data for charts
  function getVisibleDataWindow() {
    // If we have less data than displayPoints, return all data
    if (historicalData.timestamps.length <= chartConfig.displayPoints) {
      return {
        timestamps: historicalData.timestamps,
        vavg: historicalData.vavg,
        iavg: historicalData.iavg,
        ptot: historicalData.ptot,
        v1: historicalData.v1,
        v2: historicalData.v2,
        v3: historicalData.v3
      };
    }
    
    // Otherwise, return the latest displayPoints
    const startIdx = historicalData.timestamps.length - chartConfig.displayPoints;
    
    return {
      timestamps: historicalData.timestamps.slice(startIdx),
      vavg: historicalData.vavg.slice(startIdx),
      iavg: historicalData.iavg.slice(startIdx),
      ptot: historicalData.ptot.slice(startIdx),
      v1: historicalData.v1.slice(startIdx),
      v2: historicalData.v2.slice(startIdx),
      v3: historicalData.v3.slice(startIdx)
    };
  }
  
  // Update a single data series chart
  function updateSingleChart(chart, labels, data) {
    if (!chart) return;
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    
    // Update Y axis min/max for better visualization
    if (data.length > 0) {
      const values = data.filter(val => !isNaN(val));
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;
        
        // Only update if we need to (prevents constant redrawing)
        if (chart.options.scales.y.suggestedMin > min - padding || 
            chart.options.scales.y.suggestedMax < max + padding) {
          chart.options.scales.y.suggestedMin = min - padding;
          chart.options.scales.y.suggestedMax = max + padding;
        }
      }
    }
    
    chart.update('none'); // Update without animation for smoother updates
  }
  
  // Update multi-series chart (three-phase)
  function updateMultiSeriesChart(chart, labels, dataSeries) {
    if (!chart) return;
    
    chart.data.labels = labels;
    
    // Update each data series
    dataSeries.forEach((data, index) => {
      chart.data.datasets[index].data = data;
    });
    
    // Find overall min/max for Y axis
    const allValues = dataSeries.flat().filter(val => !isNaN(val));
    if (allValues.length > 0) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      const padding = (max - min) * 0.1;
      
      if (chart.options.scales.y.suggestedMin > min - padding || 
          chart.options.scales.y.suggestedMax < max + padding) {
        chart.options.scales.y.suggestedMin = min - padding;
        chart.options.scales.y.suggestedMax = max + padding;
      }
    }
    
    chart.update('none'); // Update without animation for smoother updates
  }
  
  // Set up chart interactions
  function setupChartInteractions() {
    // Time range buttons
    $('#time-range-hour').on('click', function() {
      setDisplayPoints(20); // ~1 hour at 3 min intervals
    });
    
    $('#time-range-day').on('click', function() {
      setDisplayPoints(60); // ~3 hours at 3 min intervals
    });
    
    $('#time-range-week').on('click', function() {
      setDisplayPoints(120); // ~6 hours at 3 min intervals
    });
    
    // Auto scroll toggle
    $('#toggle-auto-scroll').on('click', function() {
      chartConfig.autoScroll = !chartConfig.autoScroll;
      $(this).find('i').toggleClass('fa-toggle-on fa-toggle-off');
    });
    
    // Chart download buttons
    setupChartDownloadButtons();
    
    // Reset zoom buttons
    setupResetZoomButtons();
    
    // Add touch swipe support for mobile
    setupTouchSwipe();
    
    // Dark mode change listener
    window.addEventListener('darkModeChanged', function(e) {
      chartConfig.darkModeEnabled = e.detail.isDarkMode;
      updateChartThemes();
    });
  }
  
  // Set the number of data points to display
  function setDisplayPoints(points) {
    chartConfig.displayPoints = points;
    updateAllCharts();
  }
  
  // Update all charts with current data
  function updateAllCharts() {
    const visibleData = getVisibleDataWindow();
    
    updateSingleChart(charts.vavgChart, visibleData.timestamps, visibleData.vavg);
    updateSingleChart(charts.iavgChart, visibleData.timestamps, visibleData.iavg);
    updateSingleChart(charts.ptotChart, visibleData.timestamps, visibleData.ptot);
    
    updateMultiSeriesChart(charts.voltageChart, visibleData.timestamps, [
      visibleData.v1, visibleData.v2, visibleData.v3
    ]);
  }
  
  // Set up chart download buttons
  function setupChartDownloadButtons() {
    // Voltage chart download
    $('#download-vavg-chart').on('click', function(e) {
      e.preventDefault();
      downloadChart(charts.vavgChart, 'tegangan-rata-rata');
    });
    
    // Current chart download
    $('#download-iavg-chart').on('click', function(e) {
      e.preventDefault();
      downloadChart(charts.iavgChart, 'arus-rata-rata');
    });
    
    // Power chart download
    $('#download-ptot-chart').on('click', function(e) {
      e.preventDefault();
      downloadChart(charts.ptotChart, 'daya-total');
    });
    
    // Three-phase voltage chart download
    $('#download-voltage-chart').on('click', function(e) {
      e.preventDefault();
      downloadChart(charts.voltageChart, 'tegangan-3-fase');
    });
  }
  
  // Set up reset zoom buttons
  function setupResetZoomButtons() {
    $('[id^=reset-]').on('click', function(e) {
      e.preventDefault();
      const chartId = $(this).attr('id').replace('reset-', '').replace('-chart', '');
      if (charts[chartId + 'Chart']) {
        charts[chartId + 'Chart'].resetZoom();
      }
    });
  }
  
  // Add touch swipe support for mobile devices
  function setupTouchSwipe() {
    $('.chart-container').each(function() {
      let startX;
      let lastX;
      let isDragging = false;
      
      $(this).on('touchstart', function(e) {
        startX = e.originalEvent.touches[0].clientX;
        lastX = startX;
        isDragging = true;
      });
      
      $(this).on('touchmove', function(e) {
        if (!isDragging) return;
        
        const currentX = e.originalEvent.touches[0].clientX;
        const deltaX = currentX - lastX;
        
        // Adjust display window based on swipe
        if (Math.abs(deltaX) > 10) {
          // Disable auto scroll when user interacts
          chartConfig.autoScroll = false;
          $('#toggle-auto-scroll').find('i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
          
          // Update last position
          lastX = currentX;
        }
      });
      
      $(this).on('touchend', function() {
        isDragging = false;
      });
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
  
  // Update chart themes when dark mode changes
  function updateChartThemes() {
    const colorScheme = getCurrentColorScheme();
    
    // Update each chart's colors and theme
    Object.values(charts).forEach(chart => {
      // Update grid and text colors
      chart.options.scales.x.grid.color = colorScheme.grid;
      chart.options.scales.y.grid.color = colorScheme.grid;
      chart.options.scales.x.ticks.color = colorScheme.text;
      chart.options.scales.y.ticks.color = colorScheme.text;
      
      // Update plugin colors
      chart.options.plugins.title.color = colorScheme.text;
      chart.options.plugins.legend.labels.color = colorScheme.text;
      chart.options.plugins.tooltip.backgroundColor = colorScheme.tooltipBg;
      chart.options.plugins.tooltip.titleColor = colorScheme.tooltipText;
      chart.options.plugins.tooltip.bodyColor = colorScheme.tooltipText;
      
      // Update dataset colors
      if (chart.data.datasets.length === 1) {
        // Single series charts
        if (chart === charts.vavgChart) {
          chart.data.datasets[0].borderColor = colorScheme.voltage;
          chart.data.datasets[0].backgroundColor = colorScheme.voltage.replace('0.8', '0.1');
          chart.data.datasets[0].pointBackgroundColor = colorScheme.voltage;
        } else if (chart === charts.iavgChart) {
          chart.data.datasets[0].borderColor = colorScheme.current;
          chart.data.datasets[0].backgroundColor = colorScheme.current.replace('0.8', '0.1');
          chart.data.datasets[0].pointBackgroundColor = colorScheme.current;
        } else if (chart === charts.ptotChart) {
          chart.data.datasets[0].borderColor = colorScheme.power;
          chart.data.datasets[0].backgroundColor = colorScheme.power.replace('0.8', '0.1');
          chart.data.datasets[0].pointBackgroundColor = colorScheme.power;
        }
      } else {
        // Multi series charts - 3-phase
        chart.data.datasets[0].borderColor = colorScheme.v1;
        chart.data.datasets[1].borderColor = colorScheme.v2;
        chart.data.datasets[2].borderColor = colorScheme.v3;
      }
      
      chart.update();
    });
  }
  
  // Start auto-update cycle
  function startAutoUpdate() {
    // Use setInterval for regular updates from Firebase
    setInterval(() => {
      // If auto-scroll is enabled and we have data, update view to latest
      if (chartConfig.autoScroll && historicalData.timestamps.length > 0) {
        updateAllCharts();
      }
    }, chartConfig.updateInterval);
  }
  
  // Event listener for sensor data updates
  $(document).on('sensorDataUpdated', function(event, data) {
    updateCharts(data);
  });
  
  // Initialize charts when DOM is loaded
  $(document).ready(function() {
    // Initialize enhanced charts if on dashboard page
    if ($('#vavg-chart').length > 0) {
      initEnhancedCharts();
    }
  });