# Gunakan image Node.js versi ringan
FROM node:18-alpine

# Tentukan folder kerja di dalam container
WORKDIR /app

# Copy file package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh file kode ke dalam container
COPY . .

# Ekspos port sesuai dengan server.js (User Service = 4001)
EXPOSE 4002

# Perintah untuk menjalankan aplikasi
CMD ["node", "server.js"]