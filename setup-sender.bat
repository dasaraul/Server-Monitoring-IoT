@echo off
echo ===== ServerMonitor IoT - Pembuat & Pengirim Laporan =====
echo.

:: Periksa apakah Node.js terinstal
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js tidak ditemukan!
    echo Silakan instal Node.js terlebih dahulu: https://nodejs.org/
    pause
    exit /b 1
)

:: Salin package-sender.json ke package.json
echo Menyiapkan package.json...
copy /Y package-sender.json package.json
if %ERRORLEVEL% NEQ 0 (
    echo Error: Gagal menyalin package-sender.json!
    pause
    exit /b 1
)

:: Buat folder laporan jika belum ada
if not exist laporan mkdir laporan

:: Instal dependensi
echo.
echo Menginstal dependensi...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Gagal menginstal dependensi!
    pause
    exit /b 1
)

echo.
echo Setup selesai!
echo.
echo Untuk menjalankan sistem:
echo npm run start       - Jalankan sistem pengiriman laporan
echo npm run send        - Buat dan kirim laporan sekarang
echo.
echo Tekan sembarang tombol untuk kirim laporan test pertama...
pause >nul

:: Jalankan kirim laporan
echo.
echo Membuat dan mengirim laporan test pertama...
call npm run send

echo.
echo Tekan sembarang tombol untuk keluar...
pause >nul