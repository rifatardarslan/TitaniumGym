require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbHelper = require('./database');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Geçici olarak doğrulama kodlarını saklayacak hafıza (in-memory) objesi
const verificationCodes = {};

// E-posta gönderici yapılandırması
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Frontend Statik Dosya Dağıtımı (Production için)
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// ==========================================
// 1. KIMLIK DOGRULAMA (AUTH) API'LERI
// ==========================================

// E-posta Doğrulama Kodu Gönder
app.post('/api/auth/send-verification-code', async (req, res) => {
  const { eposta } = req.body;
  if (!eposta) {
    return res.status(400).json({ hata: 'E-posta adresi gereklidir.' });
  }

  // 6 haneli rastgele kod üret
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[eposta] = {
    code,
    expires: Date.now() + 10 * 60 * 1000 // 10 dakika geçerli
  };

  // Konsola son derece profesyonel bir log yazdır
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log('│               TITANIUM GYM DOĞRULAMA SİSTEMİ           │');
  console.log('├────────────────────────────────────────────────────────┤');
  console.log(`│ Alıcı:   ${eposta.padEnd(45)} │`);
  console.log(`│ Konu:    E-posta Doğrulama Kodu                        │`);
  console.log(`│ Kod:     ${code.padEnd(45)} │`);
  console.log('└────────────────────────────────────────────────────────┘\n');

  // Gerçek e-posta göndermeyi dene (eğer çevre değişkenleri tanımlıysa)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const mailOptions = {
        from: `"Titanium Gym" <${process.env.EMAIL_USER}>`,
        to: eposta,
        subject: 'Titanium Gym - E-posta Doğrulama Kodu',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0c101c; color: #fff; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #ff5e00;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #ff5e00; margin: 0; font-size: 24px; letter-spacing: 2px;">TITANIUM GYM</h2>
              <p style="color: #00f0ff; margin: 5px 0 0; font-size: 12px; font-weight: bold;">GÜCÜNÜ KEŞFET</p>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6; color: #a5b4fc;">Merhaba,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Titanium Gym üyelik kaydınızı tamamlamak için gereken 6 haneli e-posta doğrulama kodunuz aşağıdadır:</p>
            <div style="background-color: rgba(255,94,0,0.1); border: 1px dashed #ff5e00; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ff5e00; font-family: monospace;">${code}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Bu kod 10 dakika boyunca geçerlidir. İstek sizin tarafınızdan yapılmadıysa bu e-postayı dikkate almayınız.</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <p style="text-align: center; font-size: 12px; color: #475569; margin: 0;">© 2026 Titanium Gym. Tüm Hakları Saklıdır.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return res.json({ mesaj: 'Doğrulama kodu e-postanıza gönderildi.', devMode: false });
    } catch (err) {
      console.error('Mail gönderme hatası:', err);
      return res.json({ 
        mesaj: 'Doğrulama kodu oluşturuldu (Mail sunucu hatası).', 
        devMode: true, 
        devCode: code 
      });
    }
  } else {
    return res.json({ 
      mesaj: 'Doğrulama kodu oluşturuldu (Geliştirici modu).', 
      devMode: true, 
      devCode: code 
    });
  }
});

// E-posta Kodunu Doğrula
app.post('/api/auth/verify-code', (req, res) => {
  const { eposta, kod } = req.body;
  if (!eposta || !kod) {
    return res.status(400).json({ hata: 'E-posta ve doğrulama kodu gereklidir.' });
  }

  const record = verificationCodes[eposta];
  if (!record) {
    return res.status(400).json({ hata: 'Geçerli bir doğrulama talebi bulunamadı.' });
  }

  if (Date.now() > record.expires) {
    delete verificationCodes[eposta];
    return res.status(400).json({ hata: 'Doğrulama kodunun süresi dolmuş!' });
  }

  if (record.code !== kod.toString().trim()) {
    return res.status(400).json({ hata: 'Girdiğiniz doğrulama kodu hatalı.' });
  }

  delete verificationCodes[eposta];
  res.json({ mesaj: 'E-posta doğrulama başarılı.' });
});

// Geçici olarak şifre sıfırlama kodlarını saklayacak hafıza (in-memory) objesi
const passwordResetCodes = {};

// Geçici olarak 3D Secure ödeme onay kodlarını saklayacak hafıza objesi
const payment3dCodes = {};

// Şifre Sıfırlama Kodu Gönder
app.post('/api/auth/forgot-password/send-code', async (req, res) => {
  const { eposta } = req.body;
  if (!eposta) {
    return res.status(400).json({ hata: 'E-posta adresi gereklidir.' });
  }

  try {
    // Önce kullanıcının kayıtlı olup olmadığını kontrol et
    const user = await dbHelper.get('SELECT id FROM uyeler WHERE eposta = ?', [eposta]);
    if (!user) {
      return res.status(404).json({ hata: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' });
    }

    // 6 haneli kod üret
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    passwordResetCodes[eposta] = {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 dakika geçerli
    };

    // Konsola profesyonel reset logunu yazdır
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│             TITANIUM GYM ŞİFRE SIFIRLAMA SİSTEMİ       │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ Alıcı:   ${eposta.padEnd(45)} │`);
    console.log(`│ Konu:    Şifre Sıfırlama Kodu                          │`);
    console.log(`│ Kod:     ${code.padEnd(45)} │`);
    console.log('└────────────────────────────────────────────────────────┘\n');

    // Gerçek e-posta göndermeyi dene
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: `"Titanium Gym" <${process.env.EMAIL_USER}>`,
          to: eposta,
          subject: 'Titanium Gym - Şifre Sıfırlama Talebi',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0c101c; color: #fff; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #ff9e00;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #ff9e00; margin: 0; font-size: 24px; letter-spacing: 2px;">TITANIUM GYM</h2>
                <p style="color: #00f0ff; margin: 5px 0 0; font-size: 12px; font-weight: bold;">ŞİFREMİ UNUTTUM</p>
              </div>
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
              <p style="font-size: 16px; line-height: 1.6; color: #a5b4fc;">Merhaba,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Hesap şifrenizi sıfırlamak için talep ettiğiniz 6 haneli güvenlik doğrulama kodunuz aşağıdadır:</p>
              <div style="background-color: rgba(255,158,0,0.1); border: 1px dashed #ff9e00; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ff9e00; font-family: monospace;">${code}</span>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">Bu kod 10 dakika boyunca geçerlidir. Şifre sıfırlama talebini siz yapmadıysanız lütfen hesap şifrenizi güvende tutun.</p>
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
              <p style="text-align: center; font-size: 12px; color: #475569; margin: 0;">© 2026 Titanium Gym. Tüm Hakları Saklıdır.</p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        return res.json({ mesaj: 'Sıfırlama kodu e-postanıza gönderildi.', devMode: false });
      } catch (err) {
        console.error('Mail gönderme hatası:', err);
        return res.json({ 
          mesaj: 'Sıfırlama kodu oluşturuldu (Mail sunucu hatası).', 
          devMode: true, 
          devCode: code 
        });
      }
    } else {
      return res.json({ 
        mesaj: 'Sıfırlama kodu oluşturuldu (Geliştirici modu).', 
        devMode: true, 
        devCode: code 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ hata: 'İşlem sırasında bir sunucu hatası oluştu.' });
  }
});

// Şifre Sıfırlama Kodu Doğrula
app.post('/api/auth/forgot-password/verify-code', (req, res) => {
  const { eposta, kod } = req.body;
  if (!eposta || !kod) {
    return res.status(400).json({ hata: 'E-posta ve sıfırlama kodu gereklidir.' });
  }

  const record = passwordResetCodes[eposta];
  if (!record) {
    return res.status(400).json({ hata: 'Geçerli bir şifre sıfırlama talebi bulunamadı.' });
  }

  if (Date.now() > record.expires) {
    delete passwordResetCodes[eposta];
    return res.status(400).json({ hata: 'Sıfırlama kodunun süresi dolmuş!' });
  }

  if (record.code !== kod.toString().trim()) {
    return res.status(400).json({ hata: 'Girdiğiniz sıfırlama kodu hatalı.' });
  }

  res.json({ mesaj: 'Doğrulama başarılı. Yeni şifrenizi belirleyebilirsiniz.' });
});

// Şifreyi Sıfırla / Güncelle
app.post('/api/auth/forgot-password/reset', async (req, res) => {
  const { eposta, yeniSifre, kod } = req.body;
  if (!eposta || !yeniSifre || !kod) {
    return res.status(400).json({ hata: 'Tüm alanların doldurulması zorunludur.' });
  }

  const record = passwordResetCodes[eposta];
  if (!record || record.code !== kod.toString().trim()) {
    return res.status(400).json({ hata: 'Güvenlik doğrulaması başarısız. Lütfen işlemi baştan başlatın.' });
  }

  if (yeniSifre.length < 5) {
    return res.status(400).json({ hata: 'Yeni şifreniz en az 5 karakter olmalıdır.' });
  }

  try {
    // Önce mevcut şifresini kontrol et
    const user = await dbHelper.get('SELECT sifre FROM uyeler WHERE eposta = ?', [eposta]);
    if (user && user.sifre === yeniSifre) {
      return res.status(400).json({ hata: 'Yeni şifreniz eski şifrenizle aynı olamaz. Lütfen farklı bir şifre belirleyin.' });
    }

    const updateQuery = 'UPDATE uyeler SET sifre = ? WHERE eposta = ?';
    await dbHelper.run(updateQuery, [yeniSifre, eposta]);

    delete passwordResetCodes[eposta];
    res.json({ mesaj: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Reset password update error:', error);
    res.status(500).json({ hata: 'Şifre güncellenirken bir sunucu hatası oluştu.' });
  }
});

// Kullanıcı Giriş (Üye)
app.post('/api/auth/login', async (req, res) => {
  const { eposta, sifre } = req.body;
  if (!eposta || !sifre) {
    return res.status(400).json({ hata: 'E-posta ve şifre gereklidir.' });
  }

  try {
    const query = 'SELECT * FROM uyeler WHERE eposta = ? AND sifre = ?';
    const user = await dbHelper.get(query, [eposta, sifre]);

    if (!user) {
      return res.status(401).json({ hata: 'Geçersiz e-posta veya şifre!' });
    }

    res.json({
      mesaj: 'Giriş başarılı',
      uye: {
        id: user.id,
        ad_soyad: user.ad_soyad,
        eposta: user.eposta,
        telefon: user.telefon,
        kayit_tarihi: user.kayit_tarihi,
        durum: user.durum,
        paket_id: user.paket_id,
        antrenor_id: user.antrenor_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
  }
});

// Yeni Üye Kayıt (Sadece Kayıt - Paket Satın Alma Ayrı Yapılacak)
app.post('/api/auth/register', async (req, res) => {
  const { ad_soyad, eposta, sifre, telefon } = req.body;

  if (!ad_soyad || !eposta || !sifre) {
    return res.status(400).json({ hata: 'Lütfen tüm zorunlu alanları doldurun.' });
  }

  try {
    const userExists = await dbHelper.get('SELECT id FROM uyeler WHERE eposta = ?', [eposta]);
    if (userExists) {
      return res.status(400).json({ hata: 'Bu e-posta adresi zaten kullanımda!' });
    }

    const kayit_tarihi = new Date().toISOString().split('T')[0];
    const durum = 'Aktif';

    const insertQuery = `
      INSERT INTO uyeler (ad_soyad, eposta, sifre, telefon, kayit_tarihi, durum, paket_id, antrenor_id)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)
    `;

    const result = await dbHelper.run(insertQuery, [ad_soyad, eposta, sifre, telefon, kayit_tarihi, durum]);

    res.status(201).json({
      mesaj: 'Kayıt başarıyla tamamlandı. Giriş yapabilirsiniz.',
      uyeId: result.lastID
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ hata: 'Kayıt sırasında bir hata oluştu.' });
  }
});

// Yönetici Giriş (Admin)
app.post('/api/auth/admin/login', async (req, res) => {
  const { kullanici_adi, sifre } = req.body;
  if (!kullanici_adi || !sifre) {
    return res.status(400).json({ hata: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  try {
    const query = 'SELECT * FROM yoneticiler WHERE kullanici_adi = ? AND sifre = ?';
    const admin = await dbHelper.get(query, [kullanici_adi, sifre]);

    if (!admin) {
      return res.status(401).json({ hata: 'Geçersiz yönetici bilgileri!' });
    }

    res.json({
      mesaj: 'Yönetici girişi başarılı',
      admin: {
        id: admin.id,
        kullanici_adi: admin.kullanici_adi,
        rol: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
  }
});

// ==========================================
// 2. ÜYELİK PAKETLERİ API'LERİ (CRUD)
// ==========================================

app.get('/api/packages', async (req, res) => {
  try {
    const packages = await dbHelper.all('SELECT * FROM paketler');
    res.json(packages);
  } catch (error) {
    res.status(500).json({ hata: 'Paketler alınamadı.' });
  }
});

app.get('/api/packages/:id', async (req, res) => {
  try {
    const packageItem = await dbHelper.get('SELECT * FROM paketler WHERE id = ?', [req.params.id]);
    if (!packageItem) {
      return res.status(404).json({ hata: 'Paket bulunamadı.' });
    }
    res.json(packageItem);
  } catch (error) {
    res.status(500).json({ hata: 'Paket detayı alınamadı.' });
  }
});

app.post('/api/packages', async (req, res) => {
  const { ad, sure_ay, fiyat, aciklama, ozellikler } = req.body;
  if (!ad || !sure_ay || !fiyat) {
    return res.status(400).json({ hata: 'Ad, süre ve fiyat gereklidir.' });
  }

  try {
    const result = await dbHelper.run(
      'INSERT INTO paketler (ad, sure_ay, fiyat, aciklama, ozellikler) VALUES (?, ?, ?, ?, ?)',
      [ad, sure_ay, fiyat, aciklama, ozellikler]
    );
    res.status(201).json({ mesaj: 'Paket başarıyla eklendi.', paketId: result.lastID });
  } catch (error) {
    res.status(500).json({ hata: 'Paket eklenemedi.' });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  const { ad, sure_ay, fiyat, aciklama, ozellikler } = req.body;
  if (!ad || !sure_ay || !fiyat) {
    return res.status(400).json({ hata: 'Ad, süre ve fiyat gereklidir.' });
  }

  try {
    await dbHelper.run(
      'UPDATE paketler SET ad = ?, sure_ay = ?, fiyat = ?, aciklama = ?, ozellikler = ? WHERE id = ?',
      [ad, sure_ay, fiyat, aciklama, ozellikler, req.params.id]
    );
    res.json({ mesaj: 'Paket başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Paket güncellenemedi.' });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    await dbHelper.run('DELETE FROM paketler WHERE id = ?', [req.params.id]);
    res.json({ mesaj: 'Paket başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Paket silinemedi.' });
  }
});

// ==========================================
// 3. ANTRENÖRLER API'LERI (CRUD)
// ==========================================

app.get('/api/trainers', async (req, res) => {
  try {
    const trainers = await dbHelper.all('SELECT * FROM antrenorler');
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ hata: 'Antrenörler alınamadı.' });
  }
});

app.get('/api/trainers/:id', async (req, res) => {
  try {
    const trainer = await dbHelper.get('SELECT * FROM antrenorler WHERE id = ?', [req.params.id]);
    if (!trainer) {
      return res.status(404).json({ hata: 'Antrenör bulunamadı.' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ hata: 'Antrenör detayı alınamadı.' });
  }
});

app.post('/api/trainers', async (req, res) => {
  const { ad_soyad, uzmanlik, resim_url, puan, iletisim } = req.body;
  if (!ad_soyad || !uzmanlik) {
    return res.status(400).json({ hata: 'Ad Soyad ve uzmanlık alanları gereklidir.' });
  }

  try {
    const result = await dbHelper.run(
      'INSERT INTO antrenorler (ad_soyad, uzmanlik, resim_url, puan, iletisim) VALUES (?, ?, ?, ?, ?)',
      [ad_soyad, uzmanlik, resim_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', puan || 5.0, iletisim]
    );
    res.status(201).json({ mesaj: 'Antrenör başarıyla eklendi.', antrenorId: result.lastID });
  } catch (error) {
    res.status(500).json({ hata: 'Antrenör eklenemedi.' });
  }
});

app.put('/api/trainers/:id', async (req, res) => {
  const { ad_soyad, uzmanlik, resim_url, puan, iletisim } = req.body;
  if (!ad_soyad || !uzmanlik) {
    return res.status(400).json({ hata: 'Ad Soyad ve uzmanlık alanları gereklidir.' });
  }

  try {
    await dbHelper.run(
      'UPDATE antrenorler SET ad_soyad = ?, uzmanlik = ?, resim_url = ?, puan = ?, iletisim = ? WHERE id = ?',
      [ad_soyad, uzmanlik, resim_url, puan, iletisim, req.params.id]
    );
    res.json({ mesaj: 'Antrenör başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Antrenör güncellenemedi.' });
  }
});

app.delete('/api/trainers/:id', async (req, res) => {
  try {
    await dbHelper.run('DELETE FROM antrenorler WHERE id = ?', [req.params.id]);
    res.json({ mesaj: 'Antrenör başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Antrenör silinemedi.' });
  }
});

// ==========================================
// 4. SANAL POS ÖDEME SIMÜLASYONU & SATIN ALMA
// ==========================================

// 3D Secure SMS ve Mail Simülasyon Kodu Gönder
app.post('/api/payments/send-3d-code', async (req, res) => {
  const { eposta, telefon, tutar, packageId, memberId } = req.body;
  if (!eposta || !tutar || !packageId || !memberId) {
    return res.status(400).json({ hata: 'E-posta, tutar, paket ve üye bilgileri gereklidir.' });
  }

  // İş Kuralları Kontrolü (Downgrade ve Mükerrer Satın Alım Engeli)
  try {
    const member = await dbHelper.get(`
      SELECT u.paket_id, u.durum, p.fiyat as current_price, p.ad as current_name
      FROM uyeler u
      LEFT JOIN paketler p ON u.paket_id = p.id
      WHERE u.id = ?
    `, [memberId]);

    if (member && member.durum === 'Aktif' && member.paket_id) {
      const targetPackage = await dbHelper.get('SELECT fiyat, ad FROM paketler WHERE id = ?', [packageId]);
      if (targetPackage) {
        if (member.paket_id === parseInt(packageId, 10)) {
          return res.status(400).json({ hata: `Zaten aktif bir ${member.current_name} üyeliğiniz bulunmaktadır. Süreniz bitmeden aynı paketi tekrar satın alamazsınız.` });
        }
        if (targetPackage.fiyat < member.current_price) {
          return res.status(400).json({ hata: `Mevcut paketinizden (${member.current_name}) daha düşük fiyatlı bir pakete geçiş yapamazsınız.` });
        }
      }
    }
  } catch (err) {
    console.error('Membership business logic validation error:', err);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  payment3dCodes[eposta] = {
    code,
    expires: Date.now() + 5 * 60 * 1000 // 5 dakika geçerli
  };

  // 1. Terminale son derece gerçekçi ve kurumsal bir ASCII SMS logu basıyoruz!
  console.log(`
┌────────────────────────────────────────────────────────┐
│             NETGSM SMS GATEWAY (SIMULATION)            │
├────────────────────────────────────────────────────────┤
│ Gönderilen Numara : ${telefon || 'Bilinmiyor'}                      │
│ Gönderici Başlığı : TITANIUM                           │
│                                                        │
│ Mesaj İçeriği:                                         │
│ "Titanium Gym 3D Secure onay kodunuz: ${code}.          │
│ Bu kod 5 dakika boyunca geçerlidir."                  │
│                                                        │
│ Durum             : YAPIKREDİ/PROVİZYON BAĞLANTISI AKTİF│
└────────────────────────────────────────────────────────┘
  `);

  // 2. Kullanıcının e-posta adresine gerçek bir ödeme onay bildirim e-postası atıyoruz!
  const mailOptions = {
    from: `"Titanium Gym Ödeme Sistemi" <${process.env.EMAIL_USER || 'titaniumgymresmi@gmail.com'}>`,
    to: eposta,
    subject: 'Titanium Gym - 3D Secure Ödeme Onay Kodu',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; padding: 40px; color: #f3f4f6; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #ff5e00;">
        <h2 style="color: #ff5e00; margin-bottom: 20px; font-weight: 800; letter-spacing: 1px;">3D SECURE SMS DOĞRULAMA</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #9ca3af;">
          Yapı Kredi Sanal POS üzerinden gerçekleştireceğiniz <strong>${tutar} ₺</strong> tutarındaki üyelik ödemesi için 3D Secure doğrulama şifreniz aşağıdadır:
        </p>
        <div style="background: rgba(255, 94, 0, 0.1); border: 2px dashed #ff5e00; border-radius: 12px; padding: 20px; margin: 30px auto; width: fit-content; letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #ff5e00;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 30px; line-height: 1.5;">
          Bu şifre 5 dakika boyunca geçerlidir. Şüpheli bir işlem olduğunu düşünüyorsanız lütfen bankanızla iletişime geçiniz.<br>
          <strong>Titanium Gym Premium Spor Kompleksi</strong>
        </p>
      </div>
    `
  };

  try {
    const transporter = require('nodemailer').createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(mailOptions);
    res.json({ mesaj: 'SMS ve E-posta onay kodu başarıyla gönderildi.', devMode: false });
  } catch (error) {
    console.warn('SMTP sending error, falling back to local DevMode helper:', error.message);
    // E-posta gönderimi başarısız olsa bile, sunucu testlerinin kesilmemesi için DevMode bayrağıyla başarılı döner
    res.json({ 
      mesaj: 'Sanal ağ geçidi üzerinden onay kodu üretildi.', 
      devMode: true, 
      devCode: code 
    });
  }
});

app.post('/api/payments', async (req, res) => {
  const { cardHolder, cardNumber, expiry, cvv, packageId, trainerId, memberId, code } = req.body;

  if (!cardHolder || !cardNumber || !expiry || !cvv || !packageId || !memberId || !code) {
    return res.status(400).json({ hata: 'Ödeme ve üyelik için gerekli tüm alanları doldurmalısınız.' });
  }

  const cleanCardNumber = cardNumber.replace(/\s+/g, '');
  if (cleanCardNumber.length < 15 || cleanCardNumber.length > 16) {
    return res.status(400).json({ hata: 'Geçersiz Kredi Kartı numarası girdiniz!' });
  }

  try {
    const member = await dbHelper.get('SELECT id, eposta FROM uyeler WHERE id = ?', [memberId]);
    if (!member) {
      return res.status(404).json({ hata: 'Üye hesabı bulunamadı!' });
    }

    const record = payment3dCodes[member.eposta];
    if (!record || record.code !== code.toString().trim()) {
      return res.status(400).json({ hata: 'Girdiğiniz 3D Secure onay kodu hatalı veya süresi geçmiş!' });
    }

    delete payment3dCodes[member.eposta];

    const packageItem = await dbHelper.get('SELECT * FROM paketler WHERE id = ?', [packageId]);
    if (!packageItem) {
      return res.status(404).json({ hata: 'Satın alınmak istenen paket bulunamadı!' });
    }

    // İkincil Güvenlik Kontrolü (Satın alım aşaması)
    const existingMember = await dbHelper.get(`
      SELECT u.paket_id, u.durum, p.fiyat as current_price, p.ad as current_name
      FROM uyeler u
      LEFT JOIN paketler p ON u.paket_id = p.id
      WHERE u.id = ?
    `, [memberId]);

    if (existingMember && existingMember.durum === 'Aktif' && existingMember.paket_id) {
      if (existingMember.paket_id === parseInt(packageId, 10)) {
        return res.status(400).json({ hata: `Zaten aktif bir ${existingMember.current_name} üyeliğiniz bulunmaktadır.` });
      }
      if (packageItem.fiyat < existingMember.current_price) {
        return res.status(400).json({ hata: `Mevcut paketinizden (${existingMember.current_name}) daha düşük fiyatlı bir pakete geçiş yapamazsınız.` });
      }
    }

    const odeme_tarihi = new Date().toISOString().split('T')[0];
    const kart_son_dort = cleanCardNumber.slice(-4);
    const tutar = packageItem.fiyat;

    await dbHelper.run(
      'INSERT INTO odemeler (uye_id, paket_id, tutar, odeme_tarihi, kart_son_dort) VALUES (?, ?, ?, ?, ?)',
      [memberId, packageId, tutar, odeme_tarihi, kart_son_dort]
    );

    await dbHelper.run(
      'UPDATE uyeler SET paket_id = ?, antrenor_id = ?, durum = "Aktif" WHERE id = ?',
      [packageId, trainerId || null, memberId]
    );

    const progExists = await dbHelper.get('SELECT COUNT(*) as count FROM antrenman_programi WHERE uye_id = ?', [memberId]);
    if (progExists.count === 0) {
      const defaultProgram = [
        [memberId, 'Pazartesi', 'Bench Press', 4, 12],
        [memberId, 'Pazartesi', 'Shoulder Press', 3, 12],
        [memberId, 'Pazartesi', 'Triceps Pushdown', 3, 15],
        [memberId, 'Çarşamba', 'Squat', 4, 10],
        [memberId, 'Çarşamba', 'Leg Press', 3, 12],
        [memberId, 'Çarşamba', 'Calf Raise', 4, 15],
        [memberId, 'Cuma', 'Lat Pulldown', 4, 12],
        [memberId, 'Cuma', 'Barbell Row', 3, 10],
        [memberId, 'Cuma', 'Biceps Curl', 3, 12]
      ];
      const stmt = dbHelper.db.prepare("INSERT INTO antrenman_programi (uye_id, gun, hareket_adi, set_sayisi, tekrar_sayisi) VALUES (?, ?, ?, ?, ?)");
      defaultProgram.forEach(p => stmt.run(p));
      stmt.finalize();
    }

    await dbHelper.run(
      `INSERT INTO bildirimler (uye_id, baslik, mesaj, tarih, okundu, tip) VALUES (?, ?, ?, ?, 0, 'success')`,
      [memberId, 'Üyeliğiniz Aktif Edildi! 💳', `${packageItem.ad} paketiniz başarıyla tanımlandı. Spor salonumuzun tüm imkanlarından anında yararlanabilirsiniz!`, odeme_tarihi]
    );

    res.json({
      mesaj: 'Ödeme işleminiz başarıyla simüle edildi ve paketiniz tanımlandı!',
      tutar,
      odeme_tarihi
    });
  } catch (error) {
    console.error('Payment process error:', error);
    res.status(500).json({ hata: 'Ödeme işlemi gerçekleştirilemedi.' });
  }
});

// ==========================================
// 5. ÜYE BİLGİLERİ VE HESAP İŞLEMLERİ
// ==========================================

app.get('/api/members/:id', async (req, res) => {
  try {
    const query = `
      SELECT u.*, p.ad as paket_adi, p.fiyat as paket_fiyati, p.sure_ay as paket_suresi,
             a.ad_soyad as antrenor_adi, a.uzmanlik as antrenor_uzmanlik,
             (SELECT MAX(odeme_tarihi) FROM odemeler WHERE uye_id = u.id AND paket_id = u.paket_id) as odeme_tarihi
      FROM uyeler u
      LEFT JOIN paketler p ON u.paket_id = p.id
      LEFT JOIN antrenorler a ON u.antrenor_id = a.id
      WHERE u.id = ?
    `;
    const member = await dbHelper.get(query, [req.params.id]);
    if (!member) {
      return res.status(404).json({ hata: 'Üye bulunamadı.' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ hata: 'Profil bilgileri yüklenemedi.' });
  }
});

app.put('/api/members/:id/freeze', async (req, res) => {
  try {
    const member = await dbHelper.get('SELECT * FROM uyeler WHERE id = ?', [req.params.id]);
    if (!member) {
      return res.status(404).json({ hata: 'Üye bulunamadı.' });
    }

    if (member.durum !== 'Aktif') {
      return res.status(400).json({ hata: 'Yalnızca aktif üyelikler dondurulabilir.' });
    }

    await dbHelper.run('UPDATE uyeler SET durum = ? WHERE id = ?', ['Donduruldu', req.params.id]);

    const today = new Date().toISOString().split('T')[0];
    await dbHelper.run(
      `INSERT INTO bildirimler (uye_id, baslik, mesaj, tarih, okundu, tip) VALUES (?, ?, ?, ?, 0, 'warning')`,
      [req.params.id, 'Üyelik Donduruldu ❄️', 'Üyelik kaydınız 30 gün boyunca dondurulmuştur. Keyifli dinlenmeler dileriz!', today]
    );

    res.json({ mesaj: 'Üyeliğiniz başarıyla 30 gün süreyle dondurulmuştur.' });
  } catch (error) {
    console.error('Freeze error details:', error);
    res.status(500).json({ hata: 'Üyelik dondurulamadı: ' + error.message });
  }
});

app.put('/api/members/:id/cancel', async (req, res) => {
  try {
    const member = await dbHelper.get('SELECT * FROM uyeler WHERE id = ?', [req.params.id]);
    if (!member) {
      return res.status(404).json({ hata: 'Üye bulunamadı.' });
    }

    await dbHelper.run('UPDATE uyeler SET durum = ?, paket_id = NULL, antrenor_id = NULL WHERE id = ?', ['Iptal Edildi', req.params.id]);

    const today = new Date().toISOString().split('T')[0];
    await dbHelper.run(
      `INSERT INTO bildirimler (uye_id, baslik, mesaj, tarih, okundu, tip) VALUES (?, ?, ?, ?, 0, 'error')`,
      [req.params.id, 'Üyelik Sonlandırıldı ⚠️', 'Üyelik kaydınız kendi isteğiniz doğrultusunda iptal edilmiştir. Sizi tekrar aramızda görmeyi umuyoruz!', today]
    );

    res.json({ mesaj: 'Üyeliğiniz başarıyla iptal edilmiştir. Gelecekte sizi tekrar görmeyi dileriz.' });
  } catch (error) {
    console.error('Cancel error details:', error);
    res.status(500).json({ hata: 'Üyelik iptal edilemedi: ' + error.message });
  }
});

app.get('/api/members/:id/workout', async (req, res) => {
  try {
    const program = await dbHelper.all('SELECT * FROM antrenman_programi WHERE uye_id = ?', [req.params.id]);
    res.json(program);
  } catch (error) {
    res.status(500).json({ hata: 'Antrenman programı yüklenemedi.' });
  }
});

// ==========================================
// 6. YÖNETİCİ (ADMIN) PANELİ VE RAPORLAMA API'LERİ
// ==========================================

app.get('/api/admin/stats', async (req, res) => {
  try {
    const activeCountRow = await dbHelper.get('SELECT COUNT(*) as count FROM uyeler WHERE durum = "Aktif"');
    const totalActiveMembers = activeCountRow.count;

    const incomeRow = await dbHelper.get('SELECT SUM(tutar) as total FROM odemeler');
    const totalIncome = incomeRow.total || 0;

    const packagePopularity = await dbHelper.all(`
      SELECT p.ad, COUNT(u.id) as uye_sayisi
      FROM paketler p
      LEFT JOIN uyeler u ON u.paket_id = p.id
      GROUP BY p.id
    `);

    const trainerPopularity = await dbHelper.all(`
      SELECT a.ad_soyad, COUNT(u.id) as uye_sayisi
      FROM antrenorler a
      LEFT JOIN uyeler u ON u.antrenor_id = a.id
      GROUP BY a.id
    `);

    const monthlyRevenue = await dbHelper.all(`
      SELECT substr(odeme_tarihi, 1, 7) as ay, SUM(tutar) as gelir
      FROM odemeler
      GROUP BY ay
      ORDER BY ay ASC
    `);

    const recentPayments = await dbHelper.all(`
      SELECT o.*, u.ad_soyad as uye_adi, p.ad as paket_adi
      FROM odemeler o
      JOIN uyeler u ON o.uye_id = u.id
      JOIN paketler p ON o.paket_id = p.id
      ORDER BY o.odeme_tarihi DESC
      LIMIT 10
    `);

    const membersList = await dbHelper.all(`
      SELECT u.*, p.ad as paket_adi, a.ad_soyad as antrenor_adi
      FROM uyeler u
      LEFT JOIN paketler p ON u.paket_id = p.id
      LEFT JOIN antrenorler a ON u.antrenor_id = a.id
    `);

    res.json({
      totalActiveMembers,
      totalIncome,
      packagePopularity,
      trainerPopularity,
      monthlyRevenue,
      recentPayments,
      membersList
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ hata: 'İstatistikler ve raporlar yüklenemedi.' });
  }
});

app.put('/api/admin/members/:id/status', async (req, res) => {
  let { durum } = req.body;
  if (!durum) {
    return res.status(400).json({ hata: 'Durum bilgisi gereklidir.' });
  }
  durum = durum.trim();

  try {
    await dbHelper.run('UPDATE uyeler SET durum = ? WHERE id = ?', [durum, req.params.id]);
    res.json({ mesaj: `Üye durumu başarıyla '${durum}' olarak güncellendi.` });
  } catch (error) {
    res.status(500).json({ hata: 'Üye durumu güncellenemedi.' });
  }
});

app.put('/api/admin/members/:id/trainer', async (req, res) => {
  const { antrenor_id } = req.body;

  try {
    await dbHelper.run('UPDATE uyeler SET antrenor_id = ? WHERE id = ?', [antrenor_id || null, req.params.id]);
    res.json({ mesaj: 'Antrenör başarıyla üyeye atandı.' });
  } catch (error) {
    res.status(500).json({ hata: 'Antrenör ataması başarısız.' });
  }
});

// ==========================================
// 7. BİLDİRİMLER API'LERİ
// ==========================================

app.get('/api/members/:id/notifications', async (req, res) => {
  try {
    const notifications = await dbHelper.all('SELECT * FROM bildirimler WHERE uye_id = ? ORDER BY id DESC', [req.params.id]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ hata: 'Bildirimler yüklenemedi.' });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await dbHelper.run('UPDATE bildirimler SET okundu = 1 WHERE id = ?', [req.params.id]);
    res.json({ mesaj: 'Bildirim okundu olarak işaretlendi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Bildirim güncellenemedi.' });
  }
});

app.put('/api/members/:id/notifications/read-all', async (req, res) => {
  try {
    await dbHelper.run('UPDATE bildirimler SET okundu = 1 WHERE uye_id = ?', [req.params.id]);
    res.json({ mesaj: 'Tüm bildirimler okundu olarak işaretlendi.' });
  } catch (error) {
    res.status(500).json({ hata: 'Bildirimler güncellenemedi.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} portunda başarıyla başlatıldı.`);
});
