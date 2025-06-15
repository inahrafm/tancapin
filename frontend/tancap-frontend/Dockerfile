# --- Tahap 1: Build Aplikasi React ---
FROM node:20-alpine AS builder

# Set working directory di dalam kontainer
WORKDIR /app

# Salin file package.json dan package-lock.json (atau yarn.lock)
COPY package*.json ./

# Instal dependensi proyek frontend
RUN npm install

# Salin semua file sumber frontend
COPY . .

# Build aplikasi React untuk produksi
# Output default Vite adalah folder 'dist'
RUN npm run build


# --- Tahap 2: Sajikan Aplikasi dengan Nginx ---
FROM nginx:stable-alpine AS production

# Salin file build statis dari tahap 'builder' ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposure port default Nginx (port 80)
EXPOSE 80

# Command default Nginx
CMD ["nginx", "-g", "daemon off;"]