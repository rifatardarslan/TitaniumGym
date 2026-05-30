# 1. Base Image Olarak Resmi Node.js LTS Sürümünü Kullanıyoruz
FROM node:20

# 2. Konteyner İçindeki Çalışma Dizinini Ayarlıyoruz
WORKDIR /app

# 3. Kök Dizin Bağımlılık Dosyalarını Kopyalıyoruz
COPY package*.json ./

# 4. Kök Dizin (Backend) Bağımlılıklarını Yüklüyoruz
RUN npm install

# 5. Frontend Bağımlılık Dosyalarını Kopyalıyoruz
COPY frontend/package*.json ./frontend/

# 6. Frontend Bağımlılıklarını Yüklüyoruz
RUN npm install --prefix frontend

# 7. Tüm Proje Kodlarını Konteyner İçine Kopyalıyoruz
COPY . .

# 8. React Arayüzünü Derliyoruz (frontend/dist Klasörü Oluşur)
RUN npm run build

# 9. Uygulamanın Çalışacağı Portu Belirtiyoruz (Express Portu: 3001)
EXPOSE 3001

# 10. Ortam Değişkeni Olarak Port Ayarlıyoruz
ENV PORT=3001
ENV NODE_ENV=production

# 11. Uygulamayı Başlatma Komutu
CMD ["npm", "start"]
