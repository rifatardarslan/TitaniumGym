# 🏋️ Titanium Gym — Spor Salonu Yönetim ve Antrenman Takip Sistemi
## Yazılım Mühendisliği — Ders Projesi (Full-Stack Web Uygulaması)

### 👤 Geliştirici Bilgileri
* **Fakülte:** Mühendislik Fakültesi
* **Bölüm:** Yazılım Mühendisliği
* **Adı Soyadı:** Rifat Arda Arslan
* **Okul No:** 242925028

---

## 📌 Proje Hakkında
Bu proje, modern bir spor salonunun tüm operasyonel ve üyelik süreçlerini dijitalleştiren kapsamlı bir **Yönetim ve Antrenman Takip Sistemi**dir. Uygulama; ilişkisel **SQLite veritabanı**, **Express Node.js REST API Sunucusu** ve **React.js (Vite)** teknolojileri kullanılarak istemci-sunucu (Client-Server) mimarisinde geliştirilmiştir. 

Projenin arayüzü, hiçbir CSS kütüphanesi (Tailwind, Bootstrap vb.) kullanılmadan **tamamen özel Vanilla CSS** ile tasarlanmıştır. Cyberpunk estetiğine uygun **koyu tema (Dark Mode)**, buzlu cam efekti (**Glassmorphic kartlar**), neon turuncu ve mavi aksan renkleri, akışkan mikro-animasyonlar ve tam duyarlı (responsive) grid düzenleri ile üst düzey bir kullanıcı deneyimi (UI/UX) sunar.

---

## 🌟 Öne Çıkan Özellikler

1. **İlişkisel SQL Veritabanı:** SQLite gömülü ilişkisel veritabanı kullanılmıştır. Tablolar foreign key'ler (yabancı anahtarlar) ile birbirine bağlıdır. Uygulama ilk kez çalıştırıldığında veritabanı şeması ve tabloları otomatik oluşturulur, zengin hazır örnek verilerle (seed verileri) doldurulur.
2. **Sıfır Kurulum Desteği (Graceful Fallback & DevMode):** Sistemin e-posta doğrulama (OTP) ve 3D Secure kredi kartı onay şifreleri için gerçek SMTP altyapısı mevcuttur. Ancak bilgisayarında e-posta ayarı bulunmayan kullanıcılar için **otomatik Geliştirici Modu (DevMode)** tasarlanmıştır. SMTP bilgileri tanımlanmamışsa sistem kodları arka planda terminale yazdırır ve arayüzde son derece şık bir yardımcı kutu içerisinde kodu kullanıcıya sunarak test edilmesini sağlar.
3. **Üye Arama, Filtreleme ve Antrenör Koçluk Sistemi:** Ziyaretçiler ve üyeler paketleri sürelerine göre, antrenörleri ise uzmanlık alanlarına göre canlı olarak arayabilir ve filtreleyebilirler. Üyeler paket satın alırken kendilerine özel antrenör seçebilir veya bireysel spor yapmayı tercih edebilirler.
4. **Sanal POS Kredi Kartı Ödeme Simülasyonu:** 3D Secure güvenli şifre onay penceresi, kart numarası biçimlendirme ve görsel kart animasyonlarıyla çalışan interaktif kredi kartı ödeme ekranı.
5. **Kişiselleştirilmiş Üye Paneli & Antrenman Takibi:** 
   - Kalan gün sayısı göstergesi, üyelik dondurma (30 gün), paket yükseltme ve üyelik iptali arayüzleri.
   - Üyeye özel atanan antrenman programının gün bazlı listelenmesi, egzersiz set/tekrar detayları ve tamamlandığında işaretlenebilen interaktif check-list.
   - Okunmuş/okunmamış bildirim kutusu ve gerçek zamanlı işlem geçmişi.
6. **Kapsamlı Yönetici (Admin) Kontrol Paneli:**
   - **Genel İstatistikler:** Toplam ciro, aktif üye sayısı ve en popüler üyelik paketlerinin otomatik hesabı ve görsel kart gösterimleri.
   - **Gelir ve Paket Tercih Grafikleri:** SVG ve esnek CSS ile kodlanmış, gelir değişimlerini ve paket popülerliğini gösteren responsive grafik şemaları.
   - **Paket Yönetimi (CRUD):** Yeni üyelik paketi ekleme, düzenleme ve silme.
   - **Eğitmen Yönetimi (CRUD):** Yeni antrenör kaydetme, profil fotoğrafı, uzmanlık alanı, puan ve iletişim bilgisi güncelleme, silme.
   - **Üye Yönetimi:** Tüm üyelerin kontrolü, durumlarının (Aktif, Donduruldu, İptal Edildi) anlık değiştirilmesi ve üyelere antrenör atanması.
7. **Yüksek Güvenlik ve Validasyon:** SQL Injection açıklarına karşı tüm veritabanı işlemlerinde **Parametreli Sorgular (Prepared Statements)** kullanılmıştır. Form girdileri için regex tabanlı e-posta, telefon ve kart validasyonları eklenmiştir.

---

## 🚀 1. YOL: DOCKER İLE ÇALIŞTIRMA (En Kolay ve Sıfır Kurulum)

Projeyi test edecek kişilerin bilgisayarlarında hiçbir yazılım (Node.js, SQLite vb.) kurulu olmasa dahi, yalnızca **Docker** aracılığıyla uygulamayı **tek tıklamayla** veya tek bir komutla ayağa kaldırabilirsiniz. Konteyner yapısı hem React kodlarını derler hem de Express API sunucusunu SQLite veritabanı ile birlikte tek bir port (3001) üzerinden dışarıya servis eder.

### A) Windows Kullanıcıları İçin (Tek Tıklama):
1. Bilgisayarınızda **Docker Desktop** uygulamasının açık olduğundan emin olun.
2. Proje kök dizininde bulunan **`baslat-docker.bat`** dosyasına çift tıklayın.
3. Docker imajı otomatik olarak derlenecek, konteyner ayağa kaldırılacak ve tarayıcınızda uygulamayı anında kullanmaya başlayabilmeniz için **`http://localhost:3001`** adresi otomatik açılacaktır.
4. Test işleminiz bittiğinde, başlatıcı terminal penceresine gelip **herhangi bir tuşa basarak** konteynerları güvenle kapatabilir ve sisteminizi temizleyebilirsiniz.

### B) macOS / Linux Kullanıcıları İçin:
1. Terminalinizi proje kök dizininde açın.
2. Scripti çalıştırılabilir yapmak için şu komutu çalıştırın:
   ```bash
   chmod +x baslat-docker.sh
   ```
3. Scripti başlatın:
   ```bash
   ./baslat-docker.sh
   ```
4. Sistem otomatik derlenecek ve tarayıcınızda **`http://localhost:3001`** adresi açılacaktır. Kapatmak için terminalde bir tuşa basmanız yeterlidir.

### C) Standart Manuel Docker Komutları:
Script kullanmadan manuel çalıştırmak isterseniz kök dizinde şu komutları kullanabilirsiniz:
```bash
# Uygulamayı derle ve arka planda çalıştır
docker compose up --build -d

# Uygulamayı durdur ve temizle
docker compose down
```

---

## 🛠️ 2. YOL: NODE.JS İLE YEREL (LOCAL) ÇALIŞTIRMA

Bilgisayarınızda projenin yerel olarak çalışabilmesi için sisteminizde **Node.js** (LTS sürümü önerilir) kurulu olmalıdır.

### Adım 1: Bağımlılıkları Yükleme
Proje klasörünün kök dizininde bir terminal (PowerShell, Bash vb.) açarak aşağıdaki komutu çalıştırın. Bu özel komut hem backend sunucusunun hem de frontend React arayüzünün bağımlılıklarını tek seferde otomatik olarak yükler:

```bash
npm run install-all
```

*(Alternatif olarak; kök dizinde `npm install` yaptıktan sonra `cd frontend` dizinine geçip orada da `npm install` komutunu çalıştırabilirsiniz.)*

### Adım 2: E-Posta Yapılandırması (İsteğe Bağlı)
Kök dizindeki `.env.example` dosyasını kopyalayıp adını `.env` olarak değiştirin. Gerçek e-posta gönderimi (SMTP) yapmak istiyorsanız e-posta ve Google App şifrenizi girin. 

> [!TIP]
> E-posta bilgileri girmek **zorunlu değildir**. Sistem SMTP ayarları bulunmadığında otomatik olarak **Geliştirici Moduna** geçer. SMS ve E-posta ile gönderilmesi gereken doğrulama şifrelerini anında tarayıcı ekranındaki turuncu bilgi kutularında gösterir!

### Adım 3: Uygulamayı Başlatma
Bağımlılıklar başarıyla kurulduktan sonra, kök dizinde aşağıdaki komutu çalıştırarak hem Express API sunucusunu hem de React geliştirme sunucusunu **simültane (eşzamanlı)** olarak başlatabilirsiniz:

```bash
npm run dev
```

Bu komut:
- Express backend sunucusunu **http://localhost:3001** adresinde başlatır.
- Vite frontend geliştirme sunucusunu **http://localhost:5173** adresinde başlatır.
- SQLite veritabanını (`gym.db`) otomatik olarak oluşturur ve mock verileri yükler.

Uygulamaya yerel geliştirme modunda erişmek için tarayıcınızdan **`http://localhost:5173`** adresine gidin.

---

## 🔑 HAZIR TEST GİRİŞ BİLGİLERİ

Sistemin yönetim, üye paneli, ödeme simülatörü ve antrenman takip grafiklerini hemen deneyimleyebilmeniz için aşağıdaki hazır hesaplar önceden tanımlanmıştır:

| Rol / Kullanıcı Tipi | Giriş Bilgisi (E-Posta / Kullanıcı Adı) | Şifre | Sistemdeki Hazır Durumu / Tanımlı Veriler |
| :--- | :--- | :--- | :--- |
| **Sistem Yöneticisi (Admin)** | `admin` *(Kullanıcı adı alanına giriniz)* | `admin123` | Tüm paketlerin, antrenörlerin ve üyelerin CRUD işlemleri; Ciro ve paket popülerlik grafiklerinin izlenmesi. |
| **Gold Üyelikli Üye** | `ayse@gmail.com` | `uye123` | Aktif üye durumunda, "Gold Paket" tanımlı, "Elif Şahin" antrenör olarak atanmış, ödemesi yapılmış ve antrenman programı yüklenmiş aktif üye profili. |
| **Standart Üyeli Üye** | `ahmet@gmail.com` | `uye123` | "Standart Fitness" paketi tanımlı, antrenman günleri ve hareketleri listelenmiş, egzersiz takip paneli aktif üye. |
| **Dondurulmuş Üye** | `mehmet@gmail.com` | `uye123` | Üyeliği dondurulmuş durumdadır. Üye paneline girildiğinde "Üyeliğiniz Dondurulmuştur" uyarısı ve dondurmayı çözme arayüzü görünür. |
| **İptal Edilmiş Üye** | `fatma@gmail.com` | `uye123` | Üyeliği iptal edilmiştir. Sisteme girdiğinde "Paket Satın Al" ekranına yönlendirilir. |
| **3D Secure Onay Kodu** | `Geliştirici Modunda Ekranda Görünür` | `1234` veya `1907` | Ödeme simülasyonu esnasında SMS/E-Posta gelmesini beklemeden bu hazır kodlar ile de provizyon onaylanabilir. |

---

## 🗄️ VERİTABANI ŞEMASI VE MİMARİSİ

SQLite ilişkisel veritabanında (`gym.db`) verilerin bütünlüğü (Data Integrity) için `ON DELETE CASCADE` ve `ON DELETE SET NULL` kuralları içeren **7 ilişkisel tablo** bulunmaktadır:

1. **`paketler`**: Spor salonunun sunduğu süre, fiyat, açıklama ve özellik barındıran üyelik paketleri.
2. **`antrenorler`**: Ad, soyad, uzmanlık alanı, resim, iletişim ve üye puanlamaları içeren eğitmen tabloları.
3. **`uyeler`**: Kayıtlı sporcular, şifreleri, üyelik durumları (`Aktif`, `Donduruldu`, `Iptal Edildi`), tanımlı paket ve antrenör ID'leri (Foreign Key bağlantıları).
4. **`odemeler`**: Sanal POS üzerinden yapılan tüm başarılı simüle ödeme kayıtları, kart son 4 hanesi, tutar ve tarihler.
5. **`antrenman_programi`**: Üyelere atanan gün bazlı egzersiz adları, set ve tekrar sayıları.
6. **`yoneticiler`**: Admin paneline giriş yetkisi olan yönetici hesapları.
7. **`bildirimler`**: Üyelerin panellerinde gördükleri türlerine göre (`info`, `success`, `warning`, `error`) özelleştirilmiş bildirimler.

---

## 📂 PROJE DOSYA YAPISI

```text
SporSalonuYönetimUygulamasi/
├── .env                       # Yerel SMTP ve Port ayarları (Git'e yüklenmez)
├── .env.example               # Çevre değişkenleri için şablon dosya
├── .gitignore                 # GitHub'a gitmesi engellenen dosya listesi
├── .dockerignore              # Docker imajına girmesi engellenen dosya listesi
├── Dockerfile                 # Konteyner derleme dosyası
├── docker-compose.yml         # Docker servis orkestrasyon dosyası
├── baslat-docker.bat          # Windows için tek tıkla Docker başlatma aracı
├── baslat-docker.sh           # macOS / Linux için Docker başlatma aracı
├── database.js                # SQLite veritabanı bağlantısı, şema kurulumu ve seed verileri
├── server.js                  # Express Node.js sunucusu, API rotaları ve static hosting
├── package.json               # Kök NPM bağımlılıkları ve çalıştırma scriptleri
├── gym.db                     # Otomatik oluşan SQLite veritabanı (Git'e yüklenmez)
│
└── frontend/                  # React Arayüz Katmanı
    ├── index.html             # Google Fonts (Inter & Montserrat) entegrasyonu
    ├── vite.config.js         # Vite derleme ayarları
    ├── package.json           # React ve Lucide ikon bağımlılıkları
    └── src/
        ├── main.jsx           # React giriş noktası
        ├── App.jsx            # 140KB tam fonksiyonel Premium Arayüz ve mantıksal kodlar
        ├── App.css            # Yardımcı CSS stilleri
        └── index.css          # Cyberpunk Tasarım Sistemi, Glassmorphism ve Blob animasyonları
```
