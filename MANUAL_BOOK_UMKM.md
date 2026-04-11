# Manual Book UMKM (Penjual)

Dokumen ini menjelaskan cara memakai aplikasi dari sisi UMKM berdasarkan alur yang ada di backend dan frontend.

## 1. Menu Utama

- Dashboard: `/umkm/dashboard`
- Produk: `/products`
- Pesanan: `/umkm/orders`
- Setup Toko: `/umkm/setup-toko`
- Akun: `/profile`
- Analitik: `/umkm/analytics`
- AI Mentor: `/umkm/ai-mentor`
- AI Content: `/umkm/ai-content`
- Landing Page UMKM: `/umkm/landing-page`

## 2. Setup Awal Toko

1. Masuk ke menu Setup Toko.
2. Isi data wajib:
- Nama toko
- Deskripsi
- Alamat pickup
- Koordinat latitude dan longitude
- Nomor kontak
- Data bank (nama bank, nomor rekening, pemilik)
- Jam buka dan jam tutup
- Hari operasional
3. Upload media opsional:
- Banner toko
- Foto profil toko
- Foto bangunan toko (sangat membantu kurir)
- QRIS
4. Simpan pengaturan.

Catatan:
- Batas ukuran upload gambar: maksimal 10MB.
- Biaya admin toko bisa diisi dan dibatasi maksimal Rp 500.

## 3. Kelola Produk

1. Buka menu Produk.
2. Tambah produk baru dengan data:
- Nama
- Harga
- Stok
- Kategori (`kuliner`, `kriya`, `jasa`)
- Deskripsi (opsional)
- Gambar (opsional)
3. Atur status produk (aktif/nonaktif).
4. Gunakan kategori menu produk untuk mengelompokkan produk.

Catatan:
- Produk yang pernah masuk transaksi tidak dihapus permanen, tetapi dinonaktifkan.

## 4. Alur Pesanan UMKM

Status utama pesanan dari sisi UMKM:

1. `waiting_verification`
2. `processing`
3. `ready_to_ship`
4. `on_delivery`
5. `completed`
6. `cancelled`

Langkah operasional:

1. Saat pesanan masuk (`waiting_verification`), cek bukti pembayaran.
2. Jika valid, klik Terima Pesanan -> status jadi `processing`.
3. Siapkan barang, lalu klik Siap Kirim -> status jadi `ready_to_ship`.
4. Sistem akan mencari kurir.
5. Pantau progres kurir sampai `completed`.

Jika pesanan bermasalah saat verifikasi:

- Klik Tolak.
- Sistem otomatis mengubah status menjadi `cancelled` dan mengembalikan stok.

## 5. Pesanan Digital

Jika pesanan bertipe digital (`is_digital_order`):

- Tidak perlu kurir (`courier_status = not_required`).
- Setelah diproses, UMKM dapat menyelesaikan langsung dengan aksi selesai digital.

## 6. Buka/Tutup Toko Harian

- UMKM dapat toggle buka/tutup toko dari dashboard.
- Jika toko tutup, pembeli tidak bisa checkout.
- Sistem juga memiliki reset status buka harian terjadwal.

## 7. Biaya dan Nominal Pesanan

Komponen total transfer pembeli di order:

- Subtotal produk
- Biaya layanan aplikasi (`admin_fee`)
- Biaya operasional toko (`store_fee`)

Ongkir (`courier_fee`) ditampilkan terpisah pada pengalaman pembeli/kurir.

## 8. AI untuk UMKM

Fitur AI yang tersedia:

- AI Mentor (tanya jawab bisnis)
- Generator deskripsi produk
- Saran harga
- Insight dan tren
- Generator konten (poster/video/copy)
- Builder landing page UMKM

Tips pakai:

1. Mulai dari AI Mentor untuk strategi.
2. Lanjutkan ke AI Content untuk materi promosi.
3. Publikasikan landing page untuk promosi eksternal.

## 9. Troubleshooting UMKM

- "Pesanan tidak dapat diverifikasi"
  - Pastikan status pesanan masih `waiting_verification`.
- "Pesanan tidak dapat diproses"
  - Aksi siap kirim hanya berlaku saat status `processing`.
- Upload gambar gagal
  - Cek format gambar dan ukuran file (maks 10MB).
- Pembeli tidak bisa checkout
  - Cek status buka toko dan jam operasional.

## 10. Checklist Operasional Harian UMKM

1. Buka toko (toggle open).
2. Cek pesanan baru dan verifikasi cepat.
3. Update stok jika ada perubahan.
4. Tandai pesanan siap kirim tepat waktu.
5. Tinjau analitik dan feedback pelanggan.
