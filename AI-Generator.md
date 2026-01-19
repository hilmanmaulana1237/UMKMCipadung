http://localhost:8000/umkm/ai-content

nah sekarang kita fokus ke ai content, yang video generator dulu. jadi gini, saya tuh ingin user bisa geenrate konten video AI tapi ada 2 versi, yaitu video konten ai jika referensi fotonya menggunakan foto umkm dia (kaya fotoin warung atau gerobak umkmnya), dan yang kedua bagi umkm yang tidak mempunyai gerobak atau hanya punya foto produknya doang. nah saya ingin mereka gk usah mikir prompt nya lagi, saya ingin sistem medapat nya dari data toko yang sedang dia jalankan, kaya dia ternyata umkm yang bergerak di bidang jasa. jadi kita menggabungkan api AI Text yang pintar untuk membuatkan dia prompt, dengan tempalte prompt nya yang ini 
(Gunakan foto usaha / produk yang diunggah sebagai REFERENSI LOKASI ATAU REFERENSI VISUAL SAJA.
AI harus MENYESUAIKAN jenis aktivitas, alat, produk, dan interaksi
sesuai dengan jenis usaha atau produk yang terdeteksi,
tanpa mengubah struktur adegan.

Perbaiki kualitas visual agar terlihat lebih bersih, rapi, dan estetik,
namun tetap terlihat realistis dan alami seperti usaha UMKM Indonesia asli.

Buat video iklan UMKM yang DINAMIS dan HIDUP,
dengan PERPINDAHAN SUDUT KAMERA yang NATURAL,
bukan kamera diam, bukan satu angle saja.

TOTAL DURASI VIDEO MAKSIMAL 15 DETIK.
Seluruh adegan harus SELESAI UTUH sebelum video berakhir,
tidak boleh ada gerakan, teks, atau transisi yang terpotong di akhir.

VOICE OVER HARUS SELESAI SEBELUM DETIK KE-12.
DETIK 12–15 TANPA VOICE OVER (HANYA MUSIK LATAR & TEKS).

────────────────────
Adegan Opening:
Wide shot tampilan depan lokasi usaha atau area utama produk,
pencahayaan natural sesuai waktu (pagi / siang),
kamera bergerak pelan ke depan,
suasana hidup, profesional, dan ramah.
Durasi adegan singkat dan selesai dengan mulus.

Voice over (pendek, umum, universal):
"Usaha [JENIS PRODUK / JASA] terpercaya."

────────────────────
Adegan Aktivitas:
Medium shot pemilik atau pekerja usaha (dewasa),
berpakaian rapi dan sesuai jenis usaha,
melakukan AKTIVITAS UTAMA PRODUK
(misal: melayani pelanggan, menyiapkan produk,
mengolah, merapikan, atau mengemas).
Gerakan tangan natural, aktif, tidak kaku,
seluruh aktivitas selesai dalam satu segmen pendek.

Voice over:
"Dikerjakan dengan rapi dan profesional."

────────────────────
Adegan Detail:
Perpindahan cepat ke close-up detail produk,
alat kerja, tekstur, atau proses utama,
lalu cut ke detail lain yang relevan.
Fokus tajam, depth of field lembut,
cut rapi tanpa memperpanjang adegan.

Voice over:
"Memberikan kualitas terbaik."

────────────────────
Adegan Interaksi:
Side angle shot,
interaksi nyata antara pelaku usaha dan pelanggan
(serah terima produk, pelayanan, atau komunikasi singkat),
kamera mengikuti gerakan secara smooth,
tidak berhenti di satu posisi,
interaksi selesai sebelum masuk penutup.

Voice over (KALIMAT TERAKHIR, HARUS SELESAI SEBELUM DETIK 12):
"Pelayanan cepat dan ramah."

────────────────────
Adegan Penutup:
Pelaku usaha atau representasi produk
menoleh ke kamera sambil tersenyum,
gesture ramah dan mengundang,
kamera tetap bergerak halus,
bukan freeze frame,
penutup harus tenang dan stabil hingga akhir video.

────────────────────
Tambahkan teks overlay yang bersih dan profesional
muncul secara HALUS (fade in), tidak mendadak,
teks HARUS MUNCUL PENUH dan TERBACA sebelum video berakhir:
(NAMA USAHA / PRODUK)
(ALAMAT / LOKASI / KOTA)
(NOMOR TELEPON / WHATSAPP / MEDIA SOSIAL)

────────────────────
Gaya visual:
realistic cinematic video,
natural Indonesian atmosphere,
handheld cinematic feel ringan,
pencahayaan sesuai konteks usaha,
smooth motion,
hidup, tidak kaku, tidak seperti pose iklan studio.

Durasi fleksibel hingga MAKSIMAL 15 DETIK,
konten harus UTUH, NATURAL, dan SELESAI SEMPURNA,
tidak boleh ada bagian terpotong.

────────────────────
NEGATIVE PROMPT
pose kaku,
kamera diam terlalu lama,
freeze frame,
satu angle saja,
gerakan robot,
wajah aneh, uncanny,
kartun, animasi,
blur, low quality,
teks typo,
voice over terpotong,
voice over terlalu panjang)

nah tapi template diatas kamu improve lagi biar nyambung dengan database user, jadi nnti kita get informasi user dan mengcombokannya dengan template diatas yang dimana hasilnya akan WOW dan umkm yagn kurang pintar juga kita bisa bikin mereka gk usah mikir prompting karena kita sudah buatkan prompting nya. 

tapi saya masih bingung alurnya gmna, coba kamu improve. saya sudah beli AI Sora generate videonya, dan ini apinya dibawah 7