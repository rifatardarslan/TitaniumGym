# 🏋️ Titanium Gym — Kullanılan Teknolojiler

> **Proje:** Spor Salonu Yönetim ve Antrenman Takip Sistemi  
> **Geliştirici:** Rifat Arda Arslan  
> **Versiyon:** 1.0.0

---

## 🗂️ Proje Mimarisi

Proje, **istemci-sunucu (Client-Server)** mimarisine dayalı bir **Full-Stack Web Uygulaması**dır.

```
SporSalonuYönetimUygulamasi/
├── server.js          → Backend API sunucusu (Node.js / Express)
├── database.js        → SQLite veritabanı katmanı
├── .env               → Ortam değişkenleri
└── frontend/          → React SPA (Vite ile derlenir)
    ├── src/
    │   ├── App.jsx    → Ana uygulama bileşeni
    │   └── index.css  → Global stil dosyası
    └── index.html     → HTML giriş noktası
```

---

## ⚙️ Backend

| Teknoloji | Versiyon | Açıklama |
|---|---|---|
| **Node.js** | LTS | JavaScript çalışma ortamı |
| **Express.js** | ^4.21.2 | REST API sunucu çerçevesi |
| **SQLite3** | ^5.1.7 | Gömülü ilişkisel veritabanı |
| **Nodemailer** | ^8.0.7 | E-posta gönderimi (doğrulama & şifre sıfırlama) |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing desteği |
| **dotenvx** | ^17.4.2 | `.env` ortam değişkeni yönetimi |

### Geliştirme Araçları (Backend)

| Araç | Versiyon | Açıklama |
|---|---|---|
| **Nodemon** | ^3.1.9 | Sunucu otomatik yeniden başlatma |
| **Concurrently** | ^9.1.2 | Frontend ve backend'i aynı anda çalıştırma |

---

## 🎨 Frontend

| Teknoloji | Versiyon | Açıklama |
|---|---|---|
| **React** | ^19.2.6 | UI bileşen kütüphanesi |
| **React DOM** | ^19.2.6 | Tarayıcı DOM render motoru |
| **Vite** | ^8.0.12 | Modern frontend build aracı ve geliştirme sunucusu |
| **Lucide React** | ^1.16.0 | SVG ikon kütüphanesi |

### Geliştirme Araçları (Frontend)

| Araç | Versiyon | Açıklama |
|---|---|---|
| **ESLint** | ^10.3.0 | JavaScript kod kalitesi denetleyicisi |
| **eslint-plugin-react-hooks** | ^7.1.1 | React Hooks kuralları |
| **eslint-plugin-react-refresh** | ^0.5.2 | HMR (Hot Module Replacement) desteği |
| **@vitejs/plugin-react** | ^6.0.1 | Vite için React eklentisi (Babel/SWC) |

---

## 🗄️ Veritabanı Şeması

SQLite kullanılmakta olup aşağıdaki 7 tablo bulunmaktadır:

| Tablo | Açıklama |
|---|---|
| `paketler` | Üyelik paketleri (Standart, Gold, Platinum) |
| `antrenorler` | Antrenör profilleri |
| `uyeler` | Kayıtlı üye hesapları |
| `odemeler` | Ödeme ve işlem kayıtları |
| `antrenman_programi` | Kişisel antrenman programları |
| `yoneticiler` | Admin paneli kullanıcıları |
| `bildirimler` | Üye bildirim sistemi |

---

## 🎨 Tasarım & UI

| Teknoloji | Açıklama |
|---|---|
| **Vanilla CSS** | Tüm stillendirme (framework kullanılmamıştır) |
| **CSS Custom Properties** | Renk teması ve tasarım token'ları |
| **Glassmorphism** | Cam efektli kart tasarımı (`glass-card`) |
| **CSS Grid & Flexbox** | Duyarlı (responsive) sayfa düzeni |
| **Google Fonts** | `Inter` (ana metin) + `Montserrat` (başlıklar) |
| **Lucide Icons** | Vektör ikon seti |

---

## 🔧 Öne Çıkan Özellikler

- ✅ **JWT-Free Oturum Yönetimi** — `localStorage` tabanlı basit session sistemi
- ✅ **E-posta Doğrulama** — Kayıt ve 3D ödeme simülasyonu için OTP kodu
- ✅ **Şifre Sıfırlama** — E-posta üzerinden güvenli akış
- ✅ **Admin Paneli** — Üye, paket ve antrenör yönetimi + istatistik grafikleri
- ✅ **Bildirim Sistemi** — Üye bazlı okunmuş/okunmamış bildirimler
- ✅ **Antrenman Takibi** — Günlük egzersiz tamamlama sistemi

---

## 🚀 Geliştirme Komutları

```bash
# Tüm bağımlılıkları yükler
npm run install-all

# Backend + Frontend aynı anda başlatır
npm run dev

# Yalnızca backend başlatır
node server.js

# Yalnızca fronted başlatır
npm run build

# netstat -ano | findstr :3001
# taskkill /IM node.exe /F

```


> **Backend:** `http://localhost:3001`  
> **Frontend:** `http://localhost:5173`
