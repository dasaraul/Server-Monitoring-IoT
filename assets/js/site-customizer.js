// Fungsi untuk kustomisasi tampilan website (logo, deskripsi, icon, dll)

/**
 * Objek konfigurasi Site Customizer
 */
const siteCustomizer = {
    settings: {
      // Site Info
      siteName: "Monitoring IoT",
      siteDescription: "Sistem Monitoring IoT untuk pemantauan parameter elektrik dengan visualisasi realtime",
      siteUrl: window.location.origin,
      
      // Branding
      favicon: "assets/img/favicon.png",
      brandIcon: {
        type: "image", // image, fa-icon, gif, video
        source: "assets/img/logo.png",
        alternateText: "Logo Monitoring IoT",
        classList: "me-2" // Additional CSS classes
      },
      
      // Meta & OG Images
      metaImage: "assets/img/og-image.png",
      
      // Background
      background: {
        enabled: false,
        type: "none", // none, image, video, gradient
        source: "",
        opacity: 0.1
      },
      
      // Custom Card Icons
      cardIcons: {
        voltage: {
          type: "fa-icon", // fa-icon, image, gif
          source: "fas fa-bolt",
          color: "#1DCD9F"
        },
        current: {
          type: "fa-icon",
          source: "fas fa-tachometer-alt",
          color: "#1DCD9F"
        },
        power: {
          type: "fa-icon",
          source: "fas fa-plug",
          color: "#1DCD9F"
        },
        energy: {
          type: "fa-icon",
          source: "fas fa-battery-half",
          color: "#1DCD9F"
        }
      }
    },
    
    /**
     * Initialize site customizer
     */
    init: function() {
      // Load settings from localStorage if available
      this.loadSettings();
      
      // Apply settings to page
      this.applySettings();
      
      console.log('Site customizer initialized');
    },
    
    /**
     * Load settings from localStorage
     */
    loadSettings: function() {
      const settingsStr = localStorage.getItem('siteCustomizerSettings');
      if (!settingsStr) return;
      
      try {
        const savedSettings = JSON.parse(settingsStr);
        // Merge saved settings with defaults
        this.settings = { ...this.settings, ...savedSettings };
      } catch (e) {
        console.error('Error loading site customizer settings:', e);
      }
    },
    
    /**
     * Save settings to localStorage
     */
    saveSettings: function() {
      localStorage.setItem('siteCustomizerSettings', JSON.stringify(this.settings));
    },
    
    /**
     * Apply settings to page
     */
    applySettings: function() {
      // Apply site info
      this.applySiteInfo();
      
      // Apply branding
      this.applyBranding();
      
      // Apply background
      this.applyBackground();
      
      // Apply card icons
      this.applyCardIcons();
    },
    
    /**
     * Apply site info (title, description, etc)
     */
    applySiteInfo: function() {
      // Page title
      document.title = this.settings.siteName;
      
      // Meta description
      const metaDesc = document.getElementById('meta-description');
      if (metaDesc) {
        metaDesc.content = this.settings.siteDescription;
      }
      
      // OG & Twitter tags
      const ogElements = {
        'og-title': this.settings.siteName,
        'og-description': this.settings.siteDescription,
        'og-image': this.settings.metaImage,
        'og-url': this.settings.siteUrl,
        'twitter-title': this.settings.siteName,
        'twitter-description': this.settings.siteDescription,
        'twitter-image': this.settings.metaImage
      };
      
      // Update all OG elements
      Object.keys(ogElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.content = ogElements[id];
        }
      });
    },
    
    /**
     * Apply branding (favicon, logo)
     */
    applyBranding: function() {
      // Favicon
      const favicon = document.getElementById('dynamic-favicon');
      if (favicon) {
        favicon.href = this.settings.favicon;
      }
      
      // Brand icon
      const brandIconContainer = document.getElementById('brand-icon');
      if (brandIconContainer) {
        brandIconContainer.innerHTML = this.createIconElement(this.settings.brandIcon);
      }
    },
    
    /**
     * Apply background
     */
    applyBackground: function() {
      const bgContainer = document.getElementById('background-container');
      if (!bgContainer) return;
      
      // Clear current background
      bgContainer.innerHTML = '';
      
      // If background is disabled, exit
      if (!this.settings.background.enabled || this.settings.background.type === 'none') {
        return;
      }
      
      // Create background element based on type
      let bgElement;
      switch (this.settings.background.type) {
        case 'image':
          bgElement = document.createElement('img');
          bgElement.src = this.settings.background.source;
          bgElement.style.position = 'fixed';
          bgElement.style.top = '0';
          bgElement.style.left = '0';
          bgElement.style.width = '100%';
          bgElement.style.height = '100%';
          bgElement.style.objectFit = 'cover';
          bgElement.style.zIndex = '-1';
          bgElement.style.opacity = this.settings.background.opacity;
          break;
          
        case 'video':
          bgElement = document.createElement('video');
          bgElement.src = this.settings.background.source;
          bgElement.autoplay = true;
          bgElement.loop = true;
          bgElement.muted = true;
          bgElement.classList.add('video-background');
          bgElement.style.opacity = this.settings.background.opacity;
          break;
          
        case 'gradient':
          // Apply gradient directly to body
          document.body.style.backgroundImage = this.settings.background.source;
          return;
      }
      
      if (bgElement) {
        bgContainer.appendChild(bgElement);
      }
    },
    
    /**
     * Apply custom card icons
     */
    applyCardIcons: function() {
      // Get all metric cards
      const iconMappings = {
        'voltage': 'Vavg',
        'current': 'Iavg',
        'power': 'Ptot',
        'energy': 'Edel'
      };
      
      // Update each card icon
      Object.keys(this.settings.cardIcons).forEach(iconType => {
        const dataKey = iconMappings[iconType];
        
        // Find the card
        const cardHeader = document.querySelector(`.card-header i[data-metric="${dataKey}"]`) || 
                            document.querySelector(`.card-header i.icon-${iconType}`);
        
        if (cardHeader) {
          // Get parent of the icon
          const iconParent = cardHeader.parentNode;
          
          // Replace the icon
          const iconConfig = this.settings.cardIcons[iconType];
          const newIcon = this.createIconElement(iconConfig);
          
          iconParent.replaceChild(newIcon, cardHeader);
        }
      });
    },
    
    /**
     * Create icon HTML element
     * @param {object} config - Icon configuration
     * @returns {HTMLElement} Icon element
     */
    createIconElement: function(config) {
      let element;
      
      switch (config.type) {
        case 'fa-icon':
          // Create Font Awesome icon
          element = document.createElement('i');
          
          // Add the Font Awesome classes
          const iconClasses = config.source.split(' ');
          iconClasses.forEach(cls => element.classList.add(cls));
          
          // Add color if specified
          if (config.color) {
            element.style.color = config.color;
          }
          break;
          
        case 'image':
          // Create image element
          element = document.createElement('img');
          element.src = config.source;
          element.alt = config.alternateText || '';
          element.style.width = '24px';
          element.style.height = '24px';
          element.style.objectFit = 'contain';
          break;
          
        case 'gif':
          // Create animated GIF element
          element = document.createElement('img');
          element.src = config.source;
          element.alt = config.alternateText || '';
          element.classList.add('animated-icon');
          break;
          
        case 'video':
          // Create video element
          element = document.createElement('video');
          element.src = config.source;
          element.autoplay = true;
          element.loop = true;
          element.muted = true;
          element.classList.add('animated-icon');
          break;
          
        default:
          // Default to empty span if type not recognized
          element = document.createElement('span');
      }
      
      // Add any additional classes
      if (config.classList) {
        const additionalClasses = config.classList.split(' ');
        additionalClasses.forEach(cls => element.classList.add(cls));
      }
      
      return element;
    },
    
    /**
     * Update site settings
     * @param {object} newSettings - New settings to apply
     */
    updateSettings: function(newSettings) {
      // Update settings
      this.settings = { ...this.settings, ...newSettings };
      
      // Save settings
      this.saveSettings();
      
      // Apply new settings
      this.applySettings();
    },
    
    /**
     * Open the site customizer modal
     */
    openCustomizer: function() {
      // Populate modal form with current settings
      this.populateCustomizerForm();
      
      // Show the modal
      const customizerModal = new bootstrap.Modal(document.getElementById('site-customizer-modal'));
      customizerModal.show();
    },
    
    /**
     * Populate customizer form with current settings
     */
    populateCustomizerForm: function() {
      const form = document.getElementById('customizer-form');
      if (!form) return;
      
      // Set site info
      form.querySelector('#site-name').value = this.settings.siteName;
      form.querySelector('#site-description').value = this.settings.siteDescription;
      
      // Set branding
      form.querySelector('#favicon-url').value = this.settings.favicon;
      form.querySelector('#brand-icon-type').value = this.settings.brandIcon.type;
      form.querySelector('#brand-icon-source').value = this.settings.brandIcon.source;
      
      // Set background
      form.querySelector('#background-enabled').checked = this.settings.background.enabled;
      form.querySelector('#background-type').value = this.settings.background.type;
      form.querySelector('#background-source').value = this.settings.background.source;
      form.querySelector('#background-opacity').value = this.settings.background.opacity;
      
      // Update conditional fields visibility
      this.updateCustomizerFormVisibility();
    },
    
    /**
     * Update customizer form fields visibility based on selections
     */
    updateCustomizerFormVisibility: function() {
      const form = document.getElementById('customizer-form');
      if (!form) return;
      
      // Background fields
      const bgEnabled = form.querySelector('#background-enabled').checked;
      const bgFields = form.querySelector('#background-fields');
      
      if (bgFields) {
        bgFields.style.display = bgEnabled ? 'block' : 'none';
      }
      
      // Brand icon fields
      const brandIconType = form.querySelector('#brand-icon-type').value;
      const brandIconSourceLabel = form.querySelector('label[for="brand-icon-source"]');
      
      if (brandIconSourceLabel) {
        switch (brandIconType) {
          case 'fa-icon':
            brandIconSourceLabel.textContent = 'Font Awesome Class:';
            break;
          case 'image':
          case 'gif':
            brandIconSourceLabel.textContent = 'Image URL:';
            break;
          case 'video':
            brandIconSourceLabel.textContent = 'Video URL:';
            break;
        }
      }
    },
    
    /**
     * Save customizer form data
     */
    saveCustomizerForm: function() {
      const form = document.getElementById('customizer-form');
      if (!form) return;
      
      // Create new settings object
      const newSettings = {
        siteName: form.querySelector('#site-name').value,
        siteDescription: form.querySelector('#site-description').value,
        favicon: form.querySelector('#favicon-url').value,
        brandIcon: {
          type: form.querySelector('#brand-icon-type').value,
          source: form.querySelector('#brand-icon-source').value,
          alternateText: this.settings.brandIcon.alternateText,
          classList: this.settings.brandIcon.classList
        },
        background: {
          enabled: form.querySelector('#background-enabled').checked,
          type: form.querySelector('#background-type').value,
          source: form.querySelector('#background-source').value,
          opacity: parseFloat(form.querySelector('#background-opacity').value)
        }
      };
      
      // Update settings
      this.updateSettings(newSettings);
      
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('site-customizer-modal')).hide();
      
      // Show success notification
      showNotification('success', 'Pengaturan tampilan berhasil disimpan!');
    }
  };
  
  // Initialize site customizer when DOM ready
  $(document).ready(function() {
    siteCustomizer.init();
    
    // Set up event listener for customizer button
    $('#open-site-customizer').on('click', function(e) {
      e.preventDefault();
      siteCustomizer.openCustomizer();
    });
    
    // Set up event listeners for customizer form
    $('#customizer-form').on('change', function() {
      siteCustomizer.updateCustomizerFormVisibility();
    });
    
    // Save customizer form
    $('#save-customizer').on('click', function() {
      siteCustomizer.saveCustomizerForm();
    });
  });