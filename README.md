# Tancap

Platform pertanian cerdas berbasis *microservices* untuk membantu petani memantau kondisi lahan, mendapatkan prediksi hasil panen dan risiko hama, serta menerima rekomendasi pertanian yang cerdas.

## Fitur Utama

* **Pemantauan Data IoT:** Mengumpulkan dan menampilkan data sensor tanah (nitrogen, fosfor, kalium, pH, suhu, kelembaban).
* **Prediksi Cerdas:** Memberikan estimasi hasil panen dan prediksi risiko serangan hama berdasarkan data sensor terbaru.
* **Rekomendasi Pertanian:** Menghasilkan saran praktis (pemupukan, penyiraman) berdasarkan analisis data sensor dan hasil prediksi.
* **Manajemen Pengguna:** Sistem registrasi, login, logout, dan pengelolaan daftar pengguna (dengan kolom email).
* **Laporan Data:** Mengunduh laporan historis data sensor dalam format Excel dengan filter waktu kustom.

## Arsitektur

Proyek ini mengadopsi arsitektur *microservices* menggunakan **FastAPI** (Python) untuk *backend* dan **React.js** dengan **Tailwind CSS** untuk *frontend*. Semua layanan di-*containerize* menggunakan **Docker Compose** dan berkomunikasi melalui jaringan internal Docker.

**Komponen Utama:**

* **User Service (Backend):** Mengelola autentikasi (registrasi, login, JWT) dan manajemen pengguna (dengan dukungan email).
* **IoT Service (Backend):** Menerima, menyimpan, dan menyediakan data sensor dari perangkat.
* **Prediction Service (Backend):** Melakukan prediksi hasil panen dan risiko hama.
* **Recommendation Service (Backend):** Memberikan rekomendasi berdasarkan data sensor dan prediksi.
* **Report Service (Backend):** Menghasilkan laporan data historis.
* **PostgreSQL with TimescaleDB (Database):** Database utama untuk menyimpan semua data, dengan ekstensi TimescaleDB untuk data *time-series*.
* **Mosquitto MQTT Broker:** Broker MQTT untuk komunikasi dengan perangkat IoT (siap untuk integrasi di masa depan).
* **Frontend (React.js):** Antarmuka pengguna berbasis web yang mengonsumsi API dari layanan backend.

## Teknologi

**Backend (Python FastAPI):**
* **FastAPI:** Framework API web performa tinggi.
* **SQLAlchemy:** ORM (Object Relational Mapper) untuk interaksi database.
* **Psycopg2:** Driver PostgreSQL.
* **Passlib (bcrypt):** Untuk hashing password.
* **Python-jose:** Untuk implementasi JWT.
* **Pydantic:** Untuk validasi data dan skema (termasuk `EmailStr` dan `email-validator`).
* **python-dotenv:** Untuk memuat variabel lingkungan.
* **Pandas, OpenPyXL:** Untuk layanan laporan (pembuatan Excel).
* **email-validator:** Validasi format email.
* **python-multipart:** Untuk pemrosesan form data.

**Frontend (React.js):**
* **React.js:** Library JavaScript untuk membangun antarmuka pengguna.
* **Vite:** Tooling frontend cepat untuk pengembangan dan *build*.
* **Tailwind CSS:** Framework CSS utility-first untuk styling.
* **Chart.js, React-Chartjs-2:** Untuk visualisasi data grafik.

**Database & Messaging:**
* **PostgreSQL**
* **TimescaleDB**
* **Mosquitto**

**Containerization:**
* **Docker**
* **Docker Compose**

## Persyaratan Sistem

Pastikan Anda telah menginstal yang berikut ini di komputer Anda:

* **Git:** Untuk meng-clone repositori.
* **Docker Desktop:** Menjalankan semua *microservices* di dalam *container*.
* **Node.js dan npm:** Diperlukan untuk pengembangan *frontend* (npm sudah termasuk Node.js).
* **Python 3.9+ dan pip:** Diperlukan untuk menjalankan *script* pengisi data dummy secara lokal.

## Setup dan Menjalankan Aplikasi

Ikuti langkah-langkah ini untuk menyiapkan dan menjalankan seluruh aplikasi:

### 1. Clone Repositori

Buka terminal Anda dan *clone* repositori proyek:

git clone [https://github.com/inahrafm/tancapin.git](https://github.com/inahrafm/tancapin.git) # Ganti dengan URL repo Anda yang sebenarnya
cd tancapin # Masuk ke direktori proyek

### 2. Run
Buka terminal dan ketik : docker-compose up --build

### 3. Add db
Buka terminal Anda dan ketik : 
docker exec -i tancap_db psql -U petani_tancap -d tancap_db < data_dump_tancap_project.sql