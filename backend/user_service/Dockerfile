# Isi untuk user_service/Dockerfile (Sama seperti iot_service/Dockerfile)

# 1. Gunakan image dasar Python yang ringan
FROM python:3.9-slim

# 2. Set direktori kerja di dalam container
WORKDIR /code

# 3. Salin file requirements.txt terlebih dahulu (untuk caching)
COPY ./requirements.txt /code/requirements.txt

# 4. Install semua library yang dibutuhkan
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 5. Salin semua kode aplikasi Anda
COPY ./app /code/app

# 6. Perintah untuk menjalankan aplikasi saat container dimulai
#    Gunakan 0.0.0.0 agar bisa diakses dari luar container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]