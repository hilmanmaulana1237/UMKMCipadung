import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Phone, Printer, Store, User, Truck, AlertTriangle, BookText } from 'lucide-react';
import { useEffect } from 'react';

type RoleType = 'umkm' | 'pengguna' | 'kurir';

interface Props {
    role: RoleType;
}

interface ManualContent {
    title: string;
    subtitle: string;
    icon: typeof Store;
    color: string;
    steps: string[];
    notes: string[];
    troubles: Array<{ problem: string; solution: string }>;
}

const CONTENT: Record<RoleType, ManualContent> = {
    umkm: {
        title: 'Panduan UMKM (Penjual)',
        subtitle: 'Panduan harian untuk pemilik toko: dari setup sampai pesanan selesai.',
        icon: Store,
        color: 'from-blue-500 to-indigo-600',
        steps: [
            'Buka menu Setup Toko, lalu isi data toko dengan lengkap: nama, alamat, kontak, rekening, jam operasional.',
            'Tambahkan produk: nama produk, harga, stok, kategori, dan foto produk agar pembeli mudah melihat.',
            'Saat ada pesanan masuk, buka menu Pesanan dan cek bukti pembayaran dengan teliti.',
            'Jika pembayaran valid, tekan tombol Terima Pesanan agar status lanjut ke proses.',
            'Setelah barang siap, tekan Siap Kirim agar pesanan muncul di radar kurir.',
            'Pantau status pengiriman sampai selesai, lalu cek ulasan pembeli untuk evaluasi layanan.',
        ],
        notes: [
            'Jika toko tutup, pembeli tidak bisa checkout.',
            'Upload gambar maksimal 10MB.',
            'Jika menolak pesanan saat verifikasi, stok akan kembali otomatis.',
            'Untuk produk digital, pesanan bisa diselesaikan tanpa kurir.',
        ],
        troubles: [
            {
                problem: 'Pesanan tidak bisa diverifikasi.',
                solution: 'Pastikan status pesanan masih Menunggu Verifikasi, lalu coba lagi.',
            },
            {
                problem: 'Pembeli mengeluh tidak bisa checkout.',
                solution: 'Cek status buka toko, jam operasional, dan stok produk.',
            },
            {
                problem: 'Upload gambar gagal.',
                solution: 'Perkecil ukuran gambar dan pastikan format file adalah gambar.',
            },
        ],
    },
    pengguna: {
        title: 'Panduan Pengguna (Pembeli)',
        subtitle: 'Panduan belanja untuk pengguna: cari produk, bayar, dan pantau pesanan.',
        icon: User,
        color: 'from-emerald-500 to-green-600',
        steps: [
            'Buka Marketplace, cari produk yang diinginkan, lalu masukkan ke keranjang.',
            'Masuk ke Checkout, pilih toko, lalu isi patokan alamat dengan jelas.',
            'Aktifkan lokasi agar titik pengiriman lebih akurat.',
            'Masukkan kode promo jika ada, lalu cek total pembayaran.',
            'Upload bukti transfer yang jelas, lalu kirim pesanan.',
            'Pantau status pesanan dari Riwayat sampai pesanan diterima.',
            'Setelah selesai, beri rating atau ulasan agar membantu pengguna lain.',
        ],
        notes: [
            'Upload bukti pembayaran maksimal 5MB.',
            'Pembatalan pesanan hanya bisa saat status Menunggu Verifikasi.',
            'Jika pesanan dibatalkan, pengembalian dana dilakukan sesuai alur yang ditentukan penjual.',
            'Jika ada masalah, gunakan menu keluhan agar bisa ditindaklanjuti.',
        ],
        troubles: [
            {
                problem: 'Kode promo tidak bisa dipakai.',
                solution: 'Cek apakah kode masih aktif, kuota tersedia, dan syarat minimal belanja terpenuhi.',
            },
            {
                problem: 'Tidak bisa mengirim pesanan.',
                solution: 'Cek lagi stok produk, status buka toko, alamat, dan bukti pembayaran.',
            },
            {
                problem: 'Lokasi tidak terdeteksi.',
                solution: 'Izinkan akses GPS di browser atau perangkat, lalu coba ulang.',
            },
        ],
    },
    kurir: {
        title: 'Panduan Kurir',
        subtitle: 'Panduan operasional kurir: dari aktifkan radar sampai komisi masuk dompet.',
        icon: Truck,
        color: 'from-orange-500 to-amber-600',
        steps: [
            'Masuk ke halaman Radar dan aktifkan mode kurir.',
            'Pastikan GPS menyala agar sistem bisa membaca lokasi Anda.',
            'Pilih pesanan di Radar, lalu ambil job jika tersedia.',
            'Di halaman Aktif, jalankan urutan status: Pickup OTW, lalu Picked Up.',
            'Antarkan pesanan ke pembeli dan tekan Complete saat barang sudah diterima.',
            'Setelah selesai, komisi otomatis masuk ke Dompet.',
            'Ajukan penarikan saldo dari menu Dompet jika saldo sudah cukup.',
        ],
        notes: [
            'Kurir hanya bisa pegang satu pesanan aktif dalam satu waktu.',
            'Jika sudah bawa barang, pesanan tidak bisa dibatalkan.',
            'Penarikan saldo minimal Rp 10.000.',
            'Jika akun ditangguhkan, kurir tidak bisa mengambil pesanan baru.',
        ],
        troubles: [
            {
                problem: 'Tidak bisa ambil order.',
                solution: 'Pastikan mode kurir aktif, GPS aktif, dan tidak ada order aktif lain.',
            },
            {
                problem: 'Muncul peringatan di luar area operasional.',
                solution: 'Dekati area layanan yang didukung, lalu coba ambil order lagi.',
            },
            {
                problem: 'Tidak bisa tarik saldo.',
                solution: 'Cek minimal penarikan, saldo cukup, dan pastikan tidak ada penarikan pending.',
            },
        ],
    },
};

export default function ManualBookRole({ role }: Props) {
    const content = CONTENT[role];
    const Icon = content.icon;
    const isPrintMode =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('print') === '1';

    useEffect(() => {
        if (!isPrintMode)
            return;

        const timer = setTimeout(() => {
            window.print();
        }, 350);

        return () => clearTimeout(timer);
    }, [isPrintMode]);

    return (
        <>
            <Head title={content.title} />

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 14mm;
                    }

                    body {
                        background: white !important;
                    }

                    .print-hide {
                        display: none !important;
                    }

                    .print-card {
                        border: 1px solid #d1d5db !important;
                        box-shadow: none !important;
                        break-inside: avoid;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <header className="print-hide border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                        <Link href="/manual-book" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">Kembali ke Pilihan Panduan</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak
                            </button>
                            <a
                                href={`/manual-book/${role}?print=1`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak PDF
                            </a>
                            <a
                                href="https://wa.me/6287827718245"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                            >
                                <Phone className="w-4 h-4" />
                                Bantuan
                            </a>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <section className="print-card bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${content.color} text-white flex items-center justify-center shrink-0`}>
                                <Icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">{content.title}</h1>
                                <p className="text-slate-600 mt-3 text-base md:text-lg leading-relaxed">{content.subtitle}</p>
                            </div>
                        </div>
                    </section>

                    {isPrintMode && (
                        <section className="print-card mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <p className="text-blue-900 font-semibold">Dokumen Manual Book Publik</p>
                            <p className="text-blue-800 mt-1">
                                Dokumen ini disiapkan untuk kebutuhan panduan pengguna dan pelaporan.
                            </p>
                        </section>
                    )}

                    <section className="print-card mt-6 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <BookText className="w-5 h-5 text-slate-700" />
                            <h2 className="text-2xl font-bold text-slate-900">Langkah-langkah Utama</h2>
                        </div>

                        <div className="space-y-3">
                            {content.steps.map((step, index) => (
                                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                                            {index + 1}
                                        </div>
                                        <p className="text-slate-800 text-base md:text-lg leading-relaxed">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-6 grid md:grid-cols-2 gap-6">
                        <div className="print-card bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-xl font-bold text-slate-900">Hal Penting</h3>
                            </div>

                            <div className="space-y-3">
                                {content.notes.map((note, index) => (
                                    <div key={index} className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
                                        <p className="text-emerald-900 leading-relaxed">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="print-card bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <h3 className="text-xl font-bold text-slate-900">Jika Ada Kendala</h3>
                            </div>

                            <div className="space-y-3">
                                {content.troubles.map((item, index) => (
                                    <div key={index} className="rounded-xl bg-amber-50 border border-amber-200 p-3.5">
                                        <p className="text-amber-900 font-semibold">Masalah: {item.problem}</p>
                                        <p className="text-amber-800 mt-1 leading-relaxed">Solusi: {item.solution}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
