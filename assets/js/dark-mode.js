const darkMode = {
  init: function() {
    // Check for saved dark mode preference
    const darkModeStored = localStorage.getItem('darkMode') === 'true';
    
    // Apply dark mode if saved
    if (darkModeStored) {
      document.body.classList.add('dark-mode');
      this.updateToggleButton(true);
    }
    
    // Set up event listener for dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggle());
    }
    
    // Update charts if dark mode changes
    window.addEventListener('darkModeChanged', () => {
      if (typeof updateChartTheme === 'function') {
        updateChartTheme();
      }
    });
  },
  
  toggle: function() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update toggle button
    this.updateToggleButton(isDarkMode);
    
    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('darkModeChanged', {
      detail: { isDarkMode }
    }));
  },
  
  updateToggleButton: function(isDarkMode) {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    if (isDarkMode) {
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      darkModeToggle.setAttribute('title', 'Switch to Light Mode');
    } else {
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
    }
  },
  
  isDark: function() {
    return document.body.classList.contains('dark-mode');
  }
};

// Initialize dark mode
document.addEventListener('DOMContentLoaded', () => {
  darkMode.init();
});