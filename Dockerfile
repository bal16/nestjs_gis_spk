# Tahap 1: Builder
# Menggunakan base image Node.js v22-alpine untuk proses build
FROM node:22-alpine AS builder

# Menginstal pnpm secara global di dalam container
RUN npm install -g pnpm

# Menetapkan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin file package.json dan pnpm-lock.yaml ke direktori kerja
COPY package.json pnpm-lock.yaml ./

# Menginstal dependencies menggunakan pnpm dengan --frozen-lockfile untuk memastikan instalasi yang konsisten
RUN pnpm install --frozen-lockfile

# Menyalin sisa kode sumber aplikasi
COPY . .

# Menjalankan build script untuk mengkompilasi TypeScript ke JavaScript
RUN pnpm run build

# Tahap 2: Production
# Menggunakan base image yang sama untuk runtime
FROM node:22-alpine AS production

RUN npm install -g pnpm
WORKDIR /usr/src/app

# Menyalin dependencies produksi dari tahap builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Menyalin hasil build (folder dist) dari tahap builder
COPY --from=builder /usr/src/app/dist ./dist

# Mengekspos port 3000 (port default NestJS)
EXPOSE 3001

# Perintah untuk menjalankan aplikasi di mode produksi
CMD ["node", "dist/main"]
