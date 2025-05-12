#!/bin/bash

# Script untuk menjalankan sistem pelaporan email sebagai service
# Simpan file ini di ~/Monitoring-IoT/start-service.sh
# Jalankan: chmod +x start-service.sh
# Jalankan: ./start-service.sh

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$PROJECT_DIR/reporter.log"

echo "=== ServerMonitor IoT Email Reporter Service ==="
echo "Waktu Mulai: $(date)"
echo "Direktori: $PROJECT_DIR"
echo "Log: $LOG_FILE"
echo ""

# Pastikan Node.js terinstal
if ! command -v node &> /dev/null; then
    echo "Error: Node.js tidak ditemukan!"
    echo "Silakan instal Node.js terlebih dahulu."
    exit 1
fi

# Pastikan file .env ada
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "Error: File .env tidak ditemukan!"
    echo "Jalankan setup.js terlebih dahulu untuk konfigurasi."
    echo "  node setup.js"
    exit 1
fi

# Pastikan dependensi terinstal
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "Menginstal dependensi..."
    cd "$PROJECT_DIR" && npm install
    
    if [ $? -ne 0 ]; then
        echo "Error: Gagal menginstal dependensi!"
        exit 1
    fi
fi

# Jalankan sistem pelaporan dan pengumpulan data historis
echo "Memulai sistem pelaporan email dan pengumpulan data historis..."
cd "$PROJECT_DIR" && npm run all >> "$LOG_FILE" 2>&1 &

# Simpan PID
PID=$!
echo $PID > "$PROJECT_DIR/.pid"
echo "Service berjalan dengan PID: $PID"
echo "Service berjalan di background. Log tersimpan di: $LOG_FILE"
echo ""
echo "Untuk menghentikan service:"
echo "  kill $PID"
echo "atau jalankan:"
echo "  ./stop-service.sh"
echo ""
echo "Untuk melihat log secara real-time:"
echo "  tail -f $LOG_FILE"