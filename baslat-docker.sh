#!/bin/bash

# Titanium Gym - Docker Başlatıcı (macOS / Linux)

echo "========================================================"
echo "       TITANIUM GYM - SPOR SALONU YÖNETİM SİSTEMİ"
echo "                 DOCKER BAŞLATILIYOR"
echo "========================================================"
echo ""
echo "[BİLGİ] Docker imajı derleniyor ve servisler arka planda başlatılıyor..."
echo ""

docker compose up --build -d

if [ $? -ne 0 ]; then
    echo ""
    echo "[HATA] Docker başlatılamadı! Lütfen Docker servisinin veya Docker Desktop'ın açık olduğundan emin olun."
    echo ""
    read -p "Çıkmak için bir tuşa basın..."
    exit 1
fi

echo ""
echo "[BAŞARILI] Konteyner ayağa kaldırıldı!"
echo "[BİLGİ] Uygulama adresi: http://localhost:3001"
echo ""
echo "[BİLGİ] Varsayılan Test Giriş Bilgileri:"
echo "  - Admin Paneli Girişi: admin / admin123"
echo "  - Standart Üye Girişi: ahmet@gmail.com / uye123"
echo "  - Gold Üye Girişi: ayse@gmail.com / uye123"
echo "  - 3D Secure SMS Şifresi: Geliştirici modunda arayüzde gösterilir (Varsayılan: 1234 veya 1907)."
echo ""
echo "[BİLGİ] Tarayıcınız açılıyor..."
sleep 3

# Tarayıcıyı açma komutu (OS tipine göre)
if [ "$(uname)" == "Darwin" ]; then
    open http://localhost:3001
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    xdg-open http://localhost:3001
fi

echo ""
echo "--------------------------------------------------------"
echo "Uygulamayı durdurmak için bu pencereye gelip "
echo "BİR TUŞA BASIN. Bu işlem arka plandaki konteynerları"
echo "temizleyip bilgisayarınızı yormayacaktır."
echo "--------------------------------------------------------"
echo ""
read -p "Durdurmak için bir tuşa basın..."

echo ""
echo "[BİLGİ] Docker konteynerları kapatılıyor ve temizleniyor..."
docker compose down
echo ""
echo "[BAŞARILI] Servisler kapatıldı. Bilgisayarınız temizlendi!"
echo ""
