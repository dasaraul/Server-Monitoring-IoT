// File: assets/js/email-settings.js
// Script untuk mengelola pengaturan email

/**
 * Email Settings Manager
 */
const emailSettingsManager = {
    // Default settings
    defaultSettings: {
        enabled: true,
        recipient: 'pnm.monitoring.iot98@gmail.com',
        cc: '',
        bcc: '',
        schedule: '23_hours',
        custom_interval: 3600, // Default 1 hour in seconds
        alert_enabled: true,
        email_method: 'php_mail'
    },
    
    // Current settings
    settings: {},
    
    /**
     * Initialize email settings
     */
    init: function() {
        // Load settings from API
        this.loadSettings();
        
        // Set up event handlers
        this.setupEventHandlers();
    },
    
    /**
     * Load settings from API
     */
    loadSettings: function() {
        $.ajax({
            url: 'api/email-settings.php',
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                // Store settings
                this.settings = data;
                
                // Update form values
                this.updateFormValues();
                
                // Update UI state based on settings
                this.updateUIState();
                
                console.log('Email settings loaded:', this.settings);
            },
            error: (xhr, status, error) => {
                console.error('Error loading email settings:', error);
                
                // Use default settings on error
                this.settings = this.defaultSettings;
                this.updateFormValues();
                this.updateUIState();
                
                showNotification('warning', 'Tidak dapat memuat pengaturan email. Menggunakan pengaturan default.');
            }
        });
    },
    
    /**
     * Save settings to API
     */
    saveSettings: function() {
        // Get values from form
        const settings = this.getFormValues();
        
        // Save to API
        $.ajax({
            url: 'api/email-settings.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(settings),
            success: (response) => {
                if (response.success) {
                    // Update stored settings
                    this.settings = settings;
                    
                    // Show success message
                    showNotification('success', 'Pengaturan email berhasil disimpan.');
                    
                    // Update next scheduled time
                    this.checkEmailSchedule();
                } else {
                    showNotification('danger', 'Gagal menyimpan pengaturan email: ' + response.message);
                }
            },
            error: (xhr, status, error) => {
                console.error('Error saving email settings:', error);
                showNotification('danger', 'Terjadi kesalahan saat menyimpan pengaturan email.');
            }
        });
    },
    
    /**
     * Update form values with current settings
     */
    updateFormValues: function() {
        const form = $('#email-settings-form');
        if (!form.length) return;
        
        // Update basic settings
        form.find('#email-enabled').prop('checked', this.settings.enabled);
        form.find('#email-recipient').val(this.settings.recipient);
        form.find('#email-cc').val(this.settings.cc || '');
        form.find('#email-bcc').val(this.settings.bcc || '');
        
        // Update schedule
        form.find('#email-schedule').val(this.settings.schedule);
        form.find('#custom-interval').val(this.settings.custom_interval);
        form.find('#custom-interval-unit').val(this.getIntervalUnit(this.settings.custom_interval));
        
        // Update alert settings
        form.find('#email-alerts-enable').prop('checked', this.settings.alert_enabled);
        
        // Update method
        form.find('#email-method').val(this.settings.email_method);
        
        // Update SMTP settings if available
        if (this.settings.smtp_settings) {
            form.find('#smtp-host').val(this.settings.smtp_settings.host || '');
            form.find('#smtp-port').val(this.settings.smtp_settings.port || 587);
            form.find('#smtp-username').val(this.settings.smtp_settings.username || '');
            form.find('#smtp-password').val(this.settings.smtp_settings.password || '');
            form.find('#smtp-encryption').val(this.settings.smtp_settings.encryption || 'tls');
        }
        
        // Update API settings if available
        if (this.settings.api_settings) {
            form.find('#api-provider').val(this.settings.api_settings.provider || 'sendgrid');
            form.find('#api-key').val(this.settings.api_settings.api_key || '');
            form.find('#api-url').val(this.settings.api_settings.api_url || '');
        }
    },
    
    /**
     * Get values from form
     * @returns {Object} Form values as settings object
     */
    getFormValues: function() {
        const form = $('#email-settings-form');
        if (!form.length) return this.settings;
        
        // Get basic settings
        const settings = {
            enabled: form.find('#email-enabled').is(':checked'),
            recipient: form.find('#email-recipient').val(),
            cc: form.find('#email-cc').val(),
            bcc: form.find('#email-bcc').val(),
            schedule: form.find('#email-schedule').val(),
            custom_interval: this.calculateInterval(
                parseInt(form.find('#custom-interval').val() || 1),
                form.find('#custom-interval-unit').val()
            ),
            alert_enabled: form.find('#email-alerts-enable').is(':checked'),
            email_method: form.find('#email-method').val()
        };
        
        // Get SMTP settings if method is SMTP
        if (settings.email_method === 'smtp') {
            settings.smtp_settings = {
                host: form.find('#smtp-host').val(),
                port: parseInt(form.find('#smtp-port').val() || 587),
                username: form.find('#smtp-username').val(),
                password: form.find('#smtp-password').val(),
                encryption: form.find('#smtp-encryption').val()
            };
        }
        
        // Get API settings if method is API
        if (settings.email_method === 'api') {
            settings.api_settings = {
                provider: form.find('#api-provider').val(),
                api_key: form.find('#api-key').val(),
                api_url: form.find('#api-url').val()
            };
        }
        
        return settings;
    },
    
    /**
     * Update UI state based on settings
     */
    updateUIState: function() {
        const form = $('#email-settings-form');
        if (!form.length) return;
        
        // Custom interval fields
        const showCustomInterval = this.settings.schedule === 'custom';
        form.find('#custom-interval-container').toggle(showCustomInterval);
        
        // SMTP settings
        const showSmtpSettings = this.settings.email_method === 'smtp';
        form.find('#smtp-settings-container').toggle(showSmtpSettings);
        
        // API settings
        const showApiSettings = this.settings.email_method === 'api';
        form.find('#api-settings-container').toggle(showApiSettings);
        
        // Update enabled/disabled status
        const isEnabled = this.settings.enabled;
        form.find('.email-setting').prop('disabled', !isEnabled);
        form.find('#email-enabled').prop('disabled', false); // Enable/disable toggle always enabled
        
        // Update alert status in sidebar
        this.updateAlertStatus();
    },
    
    /**
     * Set up event handlers
     */
    setupEventHandlers: function() {
        const form = $('#email-settings-form');
        if (!form.length) return;
        
        // Save settings button
        form.on('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
        
        // Email enabled toggle
        form.find('#email-enabled').on('change', () => {
            const isEnabled = form.find('#email-enabled').is(':checked');
            form.find('.email-setting').prop('disabled', !isEnabled);
            form.find('#email-enabled').prop('disabled', false);
        });
        
        // Schedule change
        form.find('#email-schedule').on('change', () => {
            const showCustomInterval = form.find('#email-schedule').val() === 'custom';
            form.find('#custom-interval-container').toggle(showCustomInterval);
        });
        
        // Email method change
        form.find('#email-method').on('change', () => {
            const method = form.find('#email-method').val();
            form.find('#smtp-settings-container').toggle(method === 'smtp');
            form.find('#api-settings-container').toggle(method === 'api');
        });
        
        // Send test email button
        $('#send-test-email').on('click', (e) => {
            e.preventDefault();
            this.sendTestEmail();
        });
        
        // Reset settings button
        $('#reset-email-settings').on('click', (e) => {
            e.preventDefault();
            this.resetSettings();
        });
        
        // Check schedule button
        $('#check-email-schedule').on('click', (e) => {
            e.preventDefault();
            this.checkEmailSchedule();
        });
    },
    
    /**
     * Send test email
     */
    sendTestEmail: function() {
        // Get current settings from form
        const settings = this.getFormValues();
        
        // Show loading state
        $('#send-test-email').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Mengirim...');
        
        // Send API request
        $.ajax({
            url: 'api/send-email.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ type: 'manual' }),
            success: (response) => {
                // Restore button
                $('#send-test-email').prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Kirim Email Test');
                
                if (response.success) {
                    showNotification('success', 'Email test berhasil dikirim!');
                } else {
                    showNotification('danger', 'Gagal mengirim email test: ' + response.message);
                }
            },
            error: (xhr, status, error) => {
                // Restore button
                $('#send-test-email').prop('disabled', false).html('<i class="fas fa-paper-plane"></i> Kirim Email Test');
                
                console.error('Error sending test email:', error);
                showNotification('danger', 'Terjadi kesalahan saat mengirim email test.');
            }
        });
    },
    
    /**
     * Reset settings to default
     */
    resetSettings: function() {
        if (confirm('Apakah Anda yakin ingin mengembalikan pengaturan email ke default?')) {
            // Reset to default in UI
            this.settings = this.defaultSettings;
            this.updateFormValues();
            this.updateUIState();
            
            // Reset on server
            $.ajax({
                url: 'api/email-settings.php',
                type: 'DELETE',
                success: (response) => {
                    if (response.success) {
                        showNotification('success', 'Pengaturan email berhasil direset ke default.');
                    } else {
                        showNotification('warning', response.message);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('Error resetting email settings:', error);
                    showNotification('danger', 'Terjadi kesalahan saat mereset pengaturan email.');
                }
            });
        }
    },
    
    /**
     * Check email schedule
     */
    checkEmailSchedule: function() {
        $.ajax({
            url: 'api/check-email.php',
            type: 'GET',
            success: (data) => {
                // Update status elements
                $('#email-status').html(data.enabled ? 
                    '<span class="badge bg-success">Aktif</span>' : 
                    '<span class="badge bg-secondary">Nonaktif</span>');
                
                $('#email-recipient-status').text(data.recipient);
                
                // Format schedule display
                let scheduleText = '';
                switch (data.schedule) {
                    case '6_hours':
                        scheduleText = 'Setiap 6 jam';
                        break;
                    case '12_hours':
                        scheduleText = 'Setiap 12 jam';
                        break;
                    case '23_hours':
                        scheduleText = 'Setiap 23 jam';
                        break;
                    case '24_hours':
                        scheduleText = 'Setiap 24 jam';
                        break;
                    case 'custom':
                        scheduleText = this.formatIntervalText(data.custom_interval);
                        break;
                }
                $('#email-schedule-status').text(scheduleText);
                
                // Format next scheduled time
                if (data.next_scheduled) {
                    const nextDate = new Date(data.next_scheduled);
                    const now = new Date();
                    const diffMs = nextDate - now;
                    
                    // Calculate time difference
                    let timeRemaining = '';
                    if (diffMs <= 0) {
                        timeRemaining = '(email akan dikirim segera)';
                    } else {
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);
                        const remainingMins = diffMins % 60;
                        
                        if (diffHours > 0) {
                            timeRemaining = `(dalam ${diffHours} jam ${remainingMins} menit)`;
                        } else {
                            timeRemaining = `(dalam ${remainingMins} menit)`;
                        }
                    }
                    
                    $('#email-next-schedule').text(nextDate.toLocaleString() + ' ' + timeRemaining);
                } else {
                    $('#email-next-schedule').text('-');
                }
                
                // Last sent time
                if (data.last_sent) {
                    $('#email-last-sent').text(new Date(data.last_sent).toLocaleString());
                } else {
                    $('#email-last-sent').text('Belum pernah mengirim');
                }
                
                // Alert status
                $('#email-alert-status').html(data.alert_enabled ? 
                    '<span class="badge bg-success">Aktif</span>' : 
                    '<span class="badge bg-secondary">Nonaktif</span>');
                
                // Show should-send status if appropriate
                if (data.should_send) {
                    showNotification('info', 'Email terjadwal seharusnya dikirim sekarang. Cek config cron job.');
                }
            },
            error: (xhr, status, error) => {
                console.error('Error checking email schedule:', error);
                showNotification('warning', 'Gagal memeriksa jadwal email.');
            }
        });
    },
    
    /**
     * Update alert status in sidebar
     */
    updateAlertStatus: function() {
        const alertStatus = $('#sidebar-email-status');
        if (!alertStatus.length) return;
        
        // Update status based on settings
        if (this.settings.enabled) {
            alertStatus.removeClass('bg-secondary bg-danger').addClass('bg-success');
            alertStatus.html('<i class="fas fa-envelope"></i> Email Aktif');
        } else {
            alertStatus.removeClass('bg-success bg-danger').addClass('bg-secondary');
            alertStatus.html('<i class="fas fa-envelope"></i> Email Nonaktif');
        }
    },
    
    /**
     * Calculate interval in seconds
     * @param {number} value Interval value
     * @param {string} unit Interval unit (seconds, minutes, hours, days)
     * @returns {number} Interval in seconds
     */
    calculateInterval: function(value, unit) {
        value = Math.max(1, value); // Ensure value is at least 1
        
        switch (unit) {
            case 'seconds':
                return value;
            case 'minutes':
                return value * 60;
            case 'hours':
                return value * 3600;
            case 'days':
                return value * 86400;
            default:
                return value;
        }
    },
    
    /**
     * Get interval unit based on total seconds
     * @param {number} totalSeconds Total seconds
     * @returns {string} Interval unit (seconds, minutes, hours, days)
     */
    getIntervalUnit: function(totalSeconds) {
        if (totalSeconds % 86400 === 0 && totalSeconds >= 86400) {
            return 'days';
        } else if (totalSeconds % 3600 === 0 && totalSeconds >= 3600) {
            return 'hours';
        } else if (totalSeconds % 60 === 0 && totalSeconds >= 60) {
            return 'minutes';
        } else {
            return 'seconds';
        }
    },
    
    /**
     * Format interval text for display
     * @param {number} seconds Interval in seconds
     * @returns {string} Formatted interval text
     */
    formatIntervalText: function(seconds) {
        if (seconds >= 86400 && seconds % 86400 === 0) {
            return `Setiap ${seconds / 86400} hari`;
        } else if (seconds >= 3600 && seconds % 3600 === 0) {
            return `Setiap ${seconds / 3600} jam`;
        } else if (seconds >= 60 && seconds % 60 === 0) {
            return `Setiap ${seconds / 60} menit`;
        } else {
            return `Setiap ${seconds} detik`;
        }
    }
};

// Initialize email settings when DOM ready
$(document).ready(function() {
    if ($('#email-settings-form').length > 0) {
        emailSettingsManager.init();
    }
    
    // Check email schedule on reports page
    if ($('#email-status-info').length > 0) {
        emailSettingsManager.checkEmailSchedule();
        
        // Refresh every minute
        setInterval(() => {
            emailSettingsManager.checkEmailSchedule();
        }, 60000);
    }
});