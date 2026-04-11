# Manual Book Kurir

Dokumen ini menjelaskan cara kerja kurir dari aktivasi, ambil job, antar barang, sampai pencairan saldo.

## 1. Menu Utama

- Radar: `/courier/radar`
- Aktif: `/courier/active`
- Dompet: `/wallet`
- Akun: `/profile`
- Riwayat: `/courier/history`

## 2. Aktivasi Mode Kurir

1. Masuk ke halaman Radar.
2. Aktifkan mode kurir.
3. Izinkan akses GPS/lokasi.

Catatan:

- Jika akun disuspend, kurir tidak bisa aktif mengambil order.
- Lokasi dapat di-update manual dari halaman radar.

## 3. Ambil Job dari Radar

Job yang tampil di radar adalah pesanan:

- Status order: `ready_to_ship`
- Belum ada kurir
- `courier_status = finding_driver`

Saat menekan ambil job, sistem validasi:

- Kurir aktif
- Tidak sedang membawa pesanan aktif lain
- Akun tidak ditangguhkan
- Lokasi kurir berada dalam radius operasional Cipadung (3 km dari titik referensi)

Jika lolos validasi:

- Order di-assign ke kurir
- `courier_status` menjadi `driver_assigned`

## 4. Alur Pengiriman Aktif

Urutan kerja di halaman Aktif:

1. `driver_assigned`
2. Tekan "Pickup OTW" -> `pickup_otw`
3. Tekan "Picked Up" -> order jadi `on_delivery`, `courier_status = delivery_otw`
4. Tekan "Complete" -> order jadi `completed`, `courier_status = delivered`

Setelah selesai:

- Komisi kurir (`courier_fee`) otomatis masuk ke saldo dompet.

## 5. Pembatalan oleh Kurir

Kurir bisa membatalkan pesanan saat masih tahap awal.

Aturan penting:

- Tidak boleh batalkan jika sudah `delivery_otw` (barang sudah diambil).
- Jika dibatalkan saat masih boleh, order kembali ke radar:
  - `courier_id = null`
  - `courier_status = finding_driver`
  - `status = ready_to_ship`

## 6. Navigasi dan Komunikasi

Di halaman aktif, kurir bisa:

- Buka peta ke lokasi toko/pembeli
- Chat WhatsApp ke toko
- Chat WhatsApp ke pembeli
- Lihat detail barang pesanan
- Lihat foto toko (jika UMKM upload)

## 7. Dompet dan Penarikan

Menu dompet menampilkan:

- Saldo saat ini
- Total pengiriman selesai
- Pendapatan bulan berjalan
- Riwayat pengiriman terbaru
- Riwayat withdrawal

Syarat penarikan saldo:

- Minimal Rp 10.000
- Hanya untuk role kurir (juga tersedia untuk affiliator)
- Tidak boleh ada withdrawal berstatus pending
- Data bank wajib lengkap (nama bank, rekening, pemilik)

## 8. Status Kurir di Sistem

Status kurir internal pesanan:

1. `finding_driver`
2. `driver_assigned`
3. `pickup_otw`
4. `delivery_otw`
5. `delivered`

Untuk pesanan digital, status kurir bisa `not_required`.

## 9. Troubleshooting Kurir

- "Anda berada di luar area operasional"
  - Pindah ke area jangkauan Cipadung lalu coba lagi.
- "Aktifkan mode kurir terlebih dahulu"
  - Nyalakan mode kurir di radar.
- "Selesaikan pesanan aktif Anda terlebih dahulu"
  - Kurir hanya bisa pegang satu pesanan aktif pada satu waktu.
- "Pesanan sudah diambil kurir lain"
  - Ambil job lain yang tersedia.
- "Akses lokasi ditolak"
  - Izinkan akses GPS/lokasi dari browser/perangkat.
- "Tidak bisa batalkan, barang sudah diambil"
  - Hubungi admin jika ada keadaan darurat.

## 10. Checklist Kurir Harian

1. Aktifkan mode kurir.
2. Pastikan GPS akurat.
3. Pilih job terdekat dari radar.
4. Update status tepat urutan.
5. Selesaikan pengiriman hingga `delivered`.
6. Cek saldo dan ajukan withdrawal bila perlu.
