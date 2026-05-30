const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'gym.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('SQLite veritabanına başarıyla bağlanıldı.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS paketler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT NOT NULL,
        sure_ay INTEGER NOT NULL,
        fiyat DECIMAL(10,2) NOT NULL,
        aciklama TEXT,
        ozellikler TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS antrenorler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_soyad TEXT NOT NULL,
        uzmanlik TEXT NOT NULL,
        resim_url TEXT,
        puan DECIMAL(3,2) DEFAULT 5.0,
        iletisim TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS uyeler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_soyad TEXT NOT NULL,
        eposta TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        telefon TEXT,
        kayit_tarihi TEXT NOT NULL,
        durum TEXT DEFAULT 'Aktif',
        paket_id INTEGER,
        antrenor_id INTEGER,
        FOREIGN KEY (paket_id) REFERENCES paketler(id) ON DELETE SET NULL,
        FOREIGN KEY (antrenor_id) REFERENCES antrenorler(id) ON DELETE SET NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS odemeler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uye_id INTEGER NOT NULL,
        paket_id INTEGER NOT NULL,
        tutar DECIMAL(10,2) NOT NULL,
        odeme_tarihi TEXT NOT NULL,
        kart_son_dort TEXT NOT NULL,
        FOREIGN KEY (uye_id) REFERENCES uyeler(id) ON DELETE CASCADE,
        FOREIGN KEY (paket_id) REFERENCES paketler(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS antrenman_programi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uye_id INTEGER NOT NULL,
        gun TEXT NOT NULL,
        hareket_adi TEXT NOT NULL,
        set_sayisi INTEGER NOT NULL,
        tekrar_sayisi INTEGER NOT NULL,
        FOREIGN KEY (uye_id) REFERENCES uyeler(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS yoneticiler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_adi TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bildirimler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uye_id INTEGER NOT NULL,
        baslik TEXT NOT NULL,
        mesaj TEXT NOT NULL,
        tarih TEXT NOT NULL,
        okundu INTEGER DEFAULT 0,
        tip TEXT DEFAULT 'info',
        FOREIGN KEY (uye_id) REFERENCES uyeler(id) ON DELETE CASCADE
      )
    `);

    seedData();
  });
}

function seedData() {
  db.get("SELECT COUNT(*) as count FROM paketler", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const paketler = [
        ['Standart Fitness', 1, 599.99, 'Temel fitness ve kardiyo alanı kullanımı, soyunma odası ve duş erişimi.', 'Fitness Alanı,Kardiyo Ekipmanları,Soyunma Odası'],
        ['Gold Paket (Avantajlı)', 3, 1499.99, 'Fitness alanı, grup dersleri (spinning, zumba), sauna ve buhar odası erişimi.', 'Fitness Alanı,Kardiyo Ekipmanları,Grup Dersleri,Sauna & Buhar Odası,Haftada 1 Gün Koçluk'],
        ['Platinum Premium VIP', 12, 4999.99, 'Tüm alanlar, yüzme havuzu, sauna, özel dolap, beslenme danışmanlığı ve kişisel antrenör desteği.', 'Sınırsız Havuz & Sauna,Özel Dolap Hizmeti,Kişisel Antrenör (Haftada 3 Gün),Diyetisyen Desteği,Özel Grup Dersleri']
      ];
      const stmt = db.prepare("INSERT INTO paketler (ad, sure_ay, fiyat, aciklama, ozellikler) VALUES (?, ?, ?, ?, ?)");
      paketler.forEach(p => stmt.run(p));
      stmt.finalize();
      console.log('Seed: Paketler tablosu dolduruldu.');
    }
  });

  db.get("SELECT COUNT(*) as count FROM antrenorler", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const antrenorler = [
        ['Arda Arslan', 'Vücut Geliştirme & Güç Kondisyon', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop', 4.9, 'arda.arslan@titaniumgym.com'],
        ['Elif Şahin', 'Pilates, Yoga & Esneklik', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', 4.8, 'elif.sahin@titaniumgym.com'],
        ['Can Yıldırım', 'Crossfit & Fonksiyonel Antrenman', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 4.7, 'can.yildirim@titaniumgym.com'],
        ['Zeynep Kaya', 'Kilo Verme & Kardiyo Koçluğu', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', 4.9, 'zeynep.kaya@titaniumgym.com']
      ];
      const stmt = db.prepare("INSERT INTO antrenorler (ad_soyad, uzmanlik, resim_url, puan, iletisim) VALUES (?, ?, ?, ?, ?)");
      antrenorler.forEach(a => stmt.run(a));
      stmt.finalize();
      console.log('Seed: Antrenörler tablosu dolduruldu.');
    }
  });

  db.get("SELECT COUNT(*) as count FROM yoneticiler", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      db.run("INSERT INTO yoneticiler (kullanici_adi, sifre) VALUES (?, ?)", ['admin', 'admin123'], (err) => {
        if (err) return console.error(err);
        console.log('Seed: Admin kullanıcısı oluşturuldu (Kullanıcı: admin, Şifre: admin123).');
      });
    }
  });

  db.get("SELECT COUNT(*) as count FROM uyeler", (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      // Örnek Üyeler
      const uyeler = [
        ['Ahmet Yılmaz', 'ahmet@gmail.com', 'uye123', '05321112233', '2026-03-10', 'Aktif', 1, 1],
        ['Ayşe Demir', 'ayse@gmail.com', 'uye123', '05432223344', '2026-04-15', 'Aktif', 2, 2],
        ['Mehmet Kaya', 'mehmet@gmail.com', 'uye123', '05553334455', '2026-01-20', 'Donduruldu', 3, 3],
        ['Fatma Çelik', 'fatma@gmail.com', 'uye123', '05334445566', '2026-02-05', 'Iptal Edildi', 1, 4],
        ['Caner Öztürk', 'caner@gmail.com', 'uye123', '05051234567', '2026-05-01', 'Aktif', 2, 1]
      ];

      const stmtUye = db.prepare(`
        INSERT INTO uyeler (ad_soyad, eposta, sifre, telefon, kayit_tarihi, durum, paket_id, antrenor_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      uyeler.forEach((u, index) => {
        stmtUye.run(u, function(err) {
          if (err) return console.error(err);
          const uyeId = this.lastID;

          // Her üyeye ödeme ekle (tarihe göre dağıtılmış)
          let tutar = u[6] === 1 ? 599.99 : (u[6] === 2 ? 1499.99 : 4999.99);
          db.run(`
            INSERT INTO odemeler (uye_id, paket_id, tutar, odeme_tarihi, kart_son_dort) 
            VALUES (?, ?, ?, ?, ?)
          `, [uyeId, u[6], tutar, u[4], '4321']);

          const program = [
            [uyeId, 'Pazartesi', 'Bench Press', 4, 12],
            [uyeId, 'Pazartesi', 'Incline Dumbbell Press', 3, 10],
            [uyeId, 'Pazartesi', 'Pushdown', 3, 12],
            [uyeId, 'Çarşamba', 'Squat', 4, 10],
            [uyeId, 'Çarşamba', 'Leg Press', 3, 12],
            [uyeId, 'Çarşamba', 'Calf Raise', 4, 15],
            [uyeId, 'Cuma', 'Lat Pulldown', 4, 12],
            [uyeId, 'Cuma', 'Seated Row', 3, 10],
            [uyeId, 'Cuma', 'Biceps Curl', 3, 12]
          ];
          const stmtProg = db.prepare("INSERT INTO antrenman_programi (uye_id, gun, hareket_adi, set_sayisi, tekrar_sayisi) VALUES (?, ?, ?, ?, ?)");
          program.forEach(p => stmtProg.run(p));
          stmtProg.finalize();
        });
      });
      stmtUye.finalize();
      console.log('Seed: Örnek üyeler, ödemeler ve antrenman programları eklendi.');
    }
  });
}

module.exports = {
  db,
  all: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  get: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  run: (query, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};
