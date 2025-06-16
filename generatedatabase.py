# generate_dummy_sensor_data.py
import os
import psycopg2
from datetime import datetime, timedelta
import random
import time
from dotenv import load_dotenv

# Muat variabel lingkungan dari .env
# Asumsi file .env berada di root folder proyek (satu level di atas script ini jika script ada di subfolder)
# Jika script ini berada di root proyek, maka load_dotenv() akan mencarinya di direktori saat ini
load_dotenv()

DB_HOST = "localhost" # Hostname database dari sudut pandang script ini (di host Anda)
DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_PORT = "5432"

def generate_and_insert_historical_data(days_to_generate=30, records_per_day=24):
    """
    Menghasilkan data sensor dummy historis (per jam) dan memasukkannya ke database.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cur = conn.cursor()

        print(f"Memasukkan data sensor dummy historis untuk {days_to_generate} hari terakhir...")

        end_date = datetime.now().replace(minute=0, second=0, microsecond=0) # Mulai dari jam saat ini
        
        # Iterasi mundur dari tanggal saat ini
        for d in range(days_to_generate -1, -1, -1): # Loop dari 29 (30 hari lalu) sampai 0 (hari ini)
            current_day = end_date - timedelta(days=d)
            print(f"\nGenerating data for: {current_day.strftime('%Y-%m-%d')}")

            for h in range(records_per_day): # Loop 24 jam dalam sehari
                timestamp = current_day.replace(hour=h, minute=0, second=0, microsecond=0)

                # Generate nilai sensor acak untuk setiap jam
                # Tambahkan sedikit variasi untuk membuat grafik lebih menarik
                nitrogen = round(random.uniform(10, 30) + random.uniform(-2, 2), 1)
                phosphorus = round(random.uniform(5, 15) + random.uniform(-1, 1), 1)
                potassium = round(random.uniform(18, 35) + random.uniform(-3, 3), 1)
                ph = round(random.uniform(6.0, 7.0) + random.uniform(-0.2, 0.2), 1)
                temperature = round(random.uniform(22, 30) + random.uniform(-1, 1), 1)
                humidity = round(random.uniform(60, 85) + random.uniform(-5, 5), 1)

                # Batasi nilai agar tetap realistis
                nitrogen = max(0, min(nitrogen, 50))
                phosphorus = max(0, min(phosphorus, 30))
                potassium = max(0, min(potassium, 60))
                ph = max(4.0, min(ph, 9.0))
                temperature = max(15, min(temperature, 40))
                humidity = max(30, min(humidity, 100))

                cur.execute(
                    """
                    INSERT INTO sensor_readings (timestamp, nitrogen, phosphorus, potassium, ph, temperature, humidity)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """,
                    (timestamp, nitrogen, phosphorus, potassium, ph, temperature, humidity)
                )
                if (h + 1) % 4 == 0: # Print setiap 4 jam untuk tidak terlalu verbose
                    print(f"  Inserted {timestamp.strftime('%H:%M')}: N={nitrogen}, P={phosphorus}, K={potassium}, pH={ph}, Temp={temperature}, Hum={humidity}")

        conn.commit()
        print(f"\nBerhasil memasukkan total {days_to_generate * records_per_day} data dummy historis.")

    except Exception as e:
        print(f"Error saat memasukkan data dummy: {e}")
        if conn:
            conn.rollback() # Rollback jika ada error
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    generate_and_insert_historical_data(days_to_generate=30, records_per_day=24)
