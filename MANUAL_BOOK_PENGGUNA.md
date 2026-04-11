# Manual Book Pengguna (Pembeli)

Dokumen ini menjelaskan alur belanja untuk pengguna aplikasi dari cari produk sampai pesanan selesai.

## 1. Menu Utama

- Belanja (Marketplace): `/marketplace`
- Riwayat: `/history`
- Akun: `/profile`
- Checkout: `/checkout`

## 2. Alur Belanja Cepat

1. Buka Marketplace.
2. Cari produk dengan fitur search atau kategori.
3. Tambahkan produk ke keranjang.
4. Masuk ke Checkout.
5. Pilih toko (jika keranjang berisi lebih dari 1 toko).
6. Isi patokan pengiriman dan titik lokasi.
7. Masukkan kode promo (opsional).
8. Upload bukti transfer.
9. Submit pesanan.
10. Pantau status di halaman status pesanan atau riwayat.

## 3. Marketplace

Fitur utama:

- Cari produk dan toko
- Filter kategori
- Urutkan hasil (termasuk terdekat jika lokasi aktif)
- Lihat rating toko
- AI Assistant belanja

Tips:

- Aktifkan lokasi agar urutan toko terdekat lebih akurat.
- Cek status toko buka/tutup sebelum checkout.

## 4. Checkout

Data penting yang harus diisi:

- Alamat/patokan pengiriman
- Lokasi (latitude/longitude)
- Bukti pembayaran (gambar)

Validasi penting:

- Bukti pembayaran wajib dan maksimal 5MB.
- Toko harus dalam status buka.
- Stok produk harus mencukupi.

Komponen biaya:

- Subtotal produk
- Biaya layanan aplikasi
- Biaya operasional toko (jika ada)
- Ongkos kirim (bisa terpotong promo free shipping)

## 5. Kode Promo

Jenis kode yang didukung:

- Kode affiliate
- Kode promo umum

Aturan validasi:

- Kode harus aktif
- Kuota belum habis
- Minimal belanja terpenuhi
- Tidak boleh pakai kode affiliate milik sendiri

## 6. Status Pesanan

Status yang akan terlihat pengguna:

1. `waiting_verification`
2. `processing`
3. `ready_to_ship`
4. `on_delivery`
5. `completed`
6. `cancelled`

Makna singkat:

- `waiting_verification`: penjual belum verifikasi bukti bayar
- `processing`: pesanan diproses penjual
- `ready_to_ship`: barang siap dan menunggu/siap dibawa kurir
- `on_delivery`: kurir sedang mengantar
- `completed`: pesanan selesai
- `cancelled`: pesanan dibatalkan

## 7. Pembatalan Pesanan

Pengguna hanya bisa membatalkan saat status:

- `waiting_verification`

Saat dibatalkan:

- Sistem memberi kode pembatalan.
- Pengembalian dana dilakukan manual/offline ke penjual dengan kode tersebut.

## 8. Review, Rating, dan Keluhan

Setelah pesanan selesai (`completed`):

- Beri review toko
- Beri rating bintang untuk toko/kurir (jika ada kurir)
- Laporkan masalah via menu keluhan

Jenis keluhan:

- Kualitas produk
- Pengiriman
- Penjual
- Kurir
- Lainnya

## 9. Aturan Area Pengiriman

Di halaman checkout, aplikasi mengecek lokasi pengguna terhadap area layanan.

Jika lokasi di luar area layanan, konfirmasi lokasi bisa ditolak sampai pengguna berada di area yang didukung.

## 10. Troubleshooting Pengguna

- "Stok tidak mencukupi"
  - Kurangi jumlah item atau pilih produk lain.
- "Toko sedang tutup"
  - Ulangi checkout saat toko buka.
- "Kode promo tidak valid / kuota habis"
  - Cek ulang kode atau gunakan promo lain.
- "Gagal ambil lokasi"
  - Aktifkan GPS dan izinkan akses lokasi di browser.
- "Upload bukti pembayaran gagal"
  - Pastikan file gambar dan ukuran <= 5MB.
- "Tidak bisa batalkan pesanan"
  - Pembatalan hanya tersedia di `waiting_verification`.

## 11. Checklist Pengguna

1. Pastikan toko buka.
2. Cek detail produk dan harga.
3. Isi alamat dan lokasi dengan jelas.
4. Upload bukti transfer yang terbaca.
5. Pantau status sampai selesai.
6. Beri rating/review setelah pesanan selesai.
