<?php
// File: includes/footer.php
// Bagian footer untuk semua halaman
// Status: [new]
?>
    </div> <!-- Penutup dari container di header.php -->

    <!-- Footer -->
    <footer class="footer mt-auto py-3 bg-light">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <p class="mb-0 text-muted">
                        &copy; <?php echo date('Y'); ?> Monitoring IoT by Diky Aditia. All rights reserved.
                    </p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0 text-muted">
                        Versi 1.0.0 | Last Update: <?php echo date('d-m-Y'); ?>
                    </p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap 5 JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.bundle.min.js"></script>
    
    <!-- Firebase -->
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="assets/js/firebase-config.js"></script>
    <script src="assets/js/dark-mode.js"></script>
    <script src="assets/js/charts.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>