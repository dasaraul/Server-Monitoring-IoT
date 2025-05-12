#!/bin/bash

# Script untuk menghentikan sistem pelaporan email
# Simpan file ini di ~/Monitoring-IoT/stop-service.sh
# Jalankan: chmod +x stop-service.sh
# Jalankan: ./stop-service.sh

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_FILE="$PROJECT_DIR/.pid"

echo "=== Menghentikan ServerMonitor IoT Email Reporter ==="

# Periksa apakah file PID ada
if [ ! -f "$PID_FILE" ]; then
    echo "Service tidak sedang berjalan (file PID tidak ditemukan)"
    exit 0
fi

# Baca PID
PID=$(cat "$PID_FILE")

# Periksa apakah proses masih berjalan
if ps -p $PID > /dev/null; then
    echo "Menghentikan service dengan PID: $PID"
    kill $PID
    
    # Tunggu hingga proses berakhir
    COUNT=0
    while ps -p $PID > /dev/null && [ $COUNT -lt 10 ]; do
        echo "Menunggu service berhenti..."
        sleep 1
        COUNT=$((COUNT+1))
    done
    
    # Pastikan proses telah berhenti
    if ps -p $PID > /dev/null; then
        echo "Service tidak merespons, menghentikan secara paksa..."
        kill -9 $PID
    fi
    
    echo "Service berhasil dihentikan"
else
    echo "Service tidak berjalan dengan PID: $PID"
fi

# Hapus file PID
rm -f "$PID_FILE"