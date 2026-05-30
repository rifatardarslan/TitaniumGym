@echo off
CHCP 65001 > NUL
title Titanium Gym - Docker Başlatıcı

echo ========================================================
echo        TITANIUM GYM - SPOR SALONU YÖNETİM SİSTEMİ
echo                  DOCKER BAŞLATILIYOR
echo ========================================================
echo.
echo [BİLGİ] Docker imajı derleniyor ve servisler arka planda başlatılıyor...
echo.

docker compose up --build -d

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [HATA] Docker başlatılamadı! Lütfen Docker Desktop uygulamasının açık olduğundan emin olun.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [BAŞARILI] Konteyner ayağa kaldırıldı!
echo [BİLGİ] Uygulama adresi: http://localhost:3001
echo.
echo [BİLGİ] Varsayılan Test Giriş Bilgileri:
echo   - Admin Paneli Girişi: admin / admin123
echo   - Standart Üye Girişi: ahmet@gmail.com / uye123
echo   - Gold Üye Girişi: ayse@gmail.com / uye123
echo   - 3D Secure SMS Şifresi: Geliştirici modunda arayüzde gösterilir (Varsayılan: 1234 veya 1907).
echo.
echo [BİLGİ] Tarayıcınız açılıyor...
timeout /t 3 /nobreak > nul
start http://localhost:3001

echo.
echo --------------------------------------------------------
echo Uygulamayı durdurmak için bu pencereye gelip 
echo BİR TUŞA BASIN. Bu işlem arka plandaki konteynerları
echo temizleyip bilgisayarınızı yormayacaktır.
echo --------------------------------------------------------
echo.
pause

echo.
echo [BİLGİ] Docker konteynerları kapatılıyor ve temizleniyor...
docker compose down
echo.
echo [BAŞARILI] Servisler kapatıldı. Bilgisayarınız temizlendi!
echo.
pause
