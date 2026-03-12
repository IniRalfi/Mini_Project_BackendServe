CREATE DATABASE kampus;
USE kampus;

-- Buat tabel mahasiswa:

CREATE TABLE mahasiswa (
id INT AUTO_INCREMENT PRIMARY KEY,
nama VARCHAR(100),
jurusan VARCHAR(100),
angkatan INT
);

INSERT INTO mahasiswa (nama,jurusan,angkatan)
VALUES
('Andi','Sistem Informasi',2022),
('Siti','Informatika',2023);

-- Buat tabel jurusan

CREATE TABLE jurusan (
id INT AUTO_INCREMENT PRIMARY KEY,
nama_jurusan VARCHAR(100)
);

INSERT INTO jurusan (nama_jurusan)
VALUES
('Sistem Informasi'),
('Informatika'),
('Teknik Komputer');

-- Menambahkan kolom baru di tabel mahasiswa
ALTER TABLE mahasiswa
ADD jurusan_id INT;

-- Tambahkan foreign key:
ALTER TABLE mahasiswa
ADD CONSTRAINT fk_jurusan
FOREIGN KEY (jurusan_id)
REFERENCES jurusan(id);

-- Menampilkan Data Join
-- Query yang digunakan:
SELECT
mahasiswa.id,
mahasiswa.nama,
jurusan.nama_jurusan,
mahasiswa.angkatan
FROM mahasiswa
JOIN jurusan
ON mahasiswa.jurusan_id = jurusan.id;