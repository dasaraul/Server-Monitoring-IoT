# Server Monitoring IoT

![Server Monitoring IoT Dashboard](https://img.shields.io/badge/Monitoring-IoT-1DCD9F?style=for-the-badge&logo=iot&logoColor=white)
![PHP 8.0+](https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Responsive](https://img.shields.io/badge/Design-Responsive-3DDC84?style=for-the-badge&logo=responsive&logoColor=white)

A modern, responsive, and full-featured IoT monitoring system for tracking electrical parameters in real-time. This dashboard connects to sensors via Modbus RS485 communication and visualizes vital metrics through an elegant and intuitive interface.

<p align="center">
  <img src="https://github.com/dasaraul/Server-Monitoring-IoT/blob/main/assets/img/dashboard.png" alt="Dashboard" width="80%">
</p>

## 🌟 Features

### 📊 Real-time Monitoring
- **Real-time Data Visualization**: Track voltage, current, power, and energy consumption with beautiful charts
- **3-Phase Monitoring**: Visualize and analyze voltage data across all three phases
- **Customizable Time Ranges**: View data from the last hour to weekly trends
- **Interactive Charts**: Zoom, pan, and explore your data with modern interactive charts

### 📱 Responsive Design
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Customizable UI**: Modify colors, icons, and layout to suit your preferences

### 📬 Advanced Email Reporting
- **Scheduled Reports**: Automatic email reports at configurable intervals (as frequent as every second)
- **Alert Notifications**: Get instant email alerts when parameters exceed thresholds
- **Manual Reports**: Generate and send reports on demand
- **Flexible Email Configuration**: Support for PHP mail(), SMTP, or API services (SendGrid, Mailgun)
- **Email History**: Track all sent emails with detailed logs

### ⚙️ Extensive Configuration
- **Site Customization**: Change site name, description, and branding
- **Icon Customization**: Use custom images, GIFs, videos, or Font Awesome icons
- **Background Customization**: Apply custom backgrounds or gradients
- **Dynamic Settings**: All settings are stored and can be managed via the UI

### 🔄 Data Management
- **CSV Export**: Export data for further analysis
- **Historical Data**: View and analyze past measurements
- **Statistics**: Track min, max, and average values for all parameters

## 🚀 Installation

### Prerequisites
- PHP 8.0 or higher
- Web server (Apache, Nginx, etc.)
- Firebase account (Realtime Database)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/dasaraul/Server-Monitoring-IoT.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Server-Monitoring-IoT
   ```

3. Configure Firebase:
   - Update Firebase credentials in `assets/js/firebase-config.js`
   - Update Firebase credentials in `includes/db-connect.php`

4. Set up email functionality (optional):
   - Configure email settings through the UI or manually in `config/email-config.json`
   - For scheduled emails, set up the cron job:
     ```bash
     * * * * * php /path/to/your/app/cron/email-checker.php
     ```

5. Set permissions:
   ```bash
   chmod -R 755 logs/
   chmod -R 755 config/
   ```

6. Launch the application in your web server (e.g., Laragon, XAMPP, etc.)

## 📁 Project Structure

```
├── api/                    # API endpoints
│   ├── check-email.php     # Email status checker
│   ├── email-logs.php      # Email logs retrieval
│   ├── email-settings.php  # Email settings management
│   └── send-email.php      # Email sending endpoint
├── assets/                 # Frontend assets
│   ├── css/                # Stylesheets
│   ├── img/                # Images and icons
│   └── js/                 # JavaScript files
├── config/                 # Configuration files
├── cron/                   # Cron job scripts
│   ├── daily-report.php    # Daily report generator
│   └── email-checker.php   # Email scheduler
├── includes/               # PHP includes
│   ├── db-connect.php      # Database connection
│   ├── email-manager.php   # Email management system
│   ├── footer.php          # Page footer
│   └── header.php          # Page header
├── logs/                   # Log files
├── dashboard.php           # Main dashboard
├── index.php               # Home page
└── reports.php             # Reports and history page
```

## 💻 Usage

### Dashboard
The dashboard provides a real-time overview of all electrical parameters:
- **Metric Cards**: View current values for voltage, current, power, and energy
- **3-Phase Display**: Monitor voltage across all three phases
- **Charts**: Interactive charts for detailed analysis
- **System Status**: Track connection status and device information

<p align="center">
  <img src="https://github.com/dasaraul/Server-Monitoring-IoT/blob/main/assets/img/dashboard-chart.png" alt="Dashboard Charts" width="75%">
</p>

### Reports
The reports page offers detailed insights and management options:
- **Current Data**: View a summary of all current readings
- **Email Settings**: Configure and manage email reports
- **Email History**: Track all sent emails
- **Data Export**: Export data as CSV for external analysis

<p align="center">
  <img src="https://github.com/dasaraul/Server-Monitoring-IoT/blob/main/assets/img/report.png" alt="Reports Page" width="75%">
</p>

### Customization
Customize your experience through various settings:
- **Settings Modal**: Access through the gear icon in the navbar
- **Email Settings**: Configure in the Reports page
- **Site Customizer**: Modify appearance, icons, and branding
- **Chart Controls**: Configure time ranges and display options

## ⚙️ Configuration

### Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Set up a Realtime Database
3. Update the Firebase configuration in:
   - `assets/js/firebase-config.js`
   - `includes/db-connect.php`

### Email Configuration
Configure email settings through the UI:
1. Navigate to the Reports page
2. Click "Configuration" in the Email Settings panel
3. Configure recipient, schedule, and delivery method
4. Save settings

For scheduled emails, set up a cron job to run:
```bash
* * * * * php /path/to/your/app/cron/email-checker.php
```

### Custom Theming
The system supports custom theming with:
- Light/Dark mode toggle
- Custom color schemes in CSS variables
- Custom backgrounds and branding

## 📝 Development

### Requirements
- PHP 8.0+
- Firebase Realtime Database
- Basic knowledge of HTML, CSS, JavaScript, and PHP

### Extending
- **Add New Sensors**: Modify `firebase-config.js` and relevant PHP files
- **Custom Charts**: Extend `charts.js` with new visualizations
- **Additional Features**: The modular design makes it easy to add new functionality

### Best Practices
- Keep Firebase credentials secure
- Regularly back up your configuration
- Test email functionality in a development environment before deploying

## 📱 Screenshots

<p align="center">
  <img src="https://github.com/dasaraul/Server-Monitoring-IoT/blob/main/assets/img/index.png" alt="Home Page" width="80%">
</p>

## 🔧 Troubleshooting

### Connection Issues
- Check Firebase credentials
- Ensure proper internet connectivity
- Verify the database structure in Firebase

### Email Problems
- Check server mail configuration
- Verify SMTP credentials if using SMTP
- Check the email logs in the Reports page
- Inspect the `logs/email.log` file

### Display Issues
- Clear browser cache
- Try a different browser
- Check for JavaScript errors in the console

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Diky Aditia** - *Initial work and development*

## 🙏 Acknowledgments

- **Dasaraul** - *Server provider and collaborator*
- The open-source community for the amazing tools and libraries
- All contributors who have helped shape this project

---

<p align="center">
  <a href="https://github.com/dasaraul/Server-Monitoring-IoT">
    <img src="https://img.shields.io/github/stars/dasaraul/Server-Monitoring-IoT?style=social" alt="GitHub stars">
  </a>
  <br><br>
  Made with ❤️ in Indonesia
</p>