import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';

type RoleKey = 'umkm' | 'pengguna' | 'kurir';

interface SectionData {
    role: RoleKey;
    title: string;
    purpose: string;
    steps: string[];
    highlights: string[];
}

const sections: SectionData[] = [
    {
        role: 'umkm',
        title: 'Manual UMKM (Penjual)',
        purpose: 'Panduan pemilik toko untuk operasional harian dari setup toko sampai pesanan selesai.',
        steps: [
            'Setup toko: isi data toko, kontak, rekening, jam operasional, dan lokasi.',
            'Kelola produk: tambah produk, atur stok, harga, kategori, dan foto produk.',
            'Verifikasi pesanan: cek bukti pembayaran saat status menunggu verifikasi.',
            'Proses pesanan: terima pesanan, siapkan barang, lalu tandai siap kirim.',
            'Pantau pengiriman sampai selesai dan evaluasi dari ulasan pembeli.',
        ],
        highlights: [
            'Upload gambar maksimal 10MB.',
            'Toko tutup berarti pembeli tidak bisa checkout.',
            'Tolak pesanan saat verifikasi akan mengembalikan stok otomatis.',
        ],
    },
    {
        role: 'pengguna',
        title: 'Manual Pengguna (Pembeli)',
        purpose: 'Panduan pembeli dari cari produk sampai menerima pesanan dan memberi ulasan.',
        steps: [
            'Cari produk melalui marketplace dan masukkan ke keranjang.',
            'Checkout: isi alamat/patokan, aktifkan lokasi, dan cek rincian biaya.',
            'Gunakan kode promo jika tersedia dan valid.',
            'Upload bukti pembayaran lalu kirim pesanan.',
            'Pantau status pesanan sampai selesai lalu beri rating atau review.',
        ],
        highlights: [
            'Bukti pembayaran maksimal 5MB.',
            'Pembatalan hanya bisa saat status menunggu verifikasi.',
            'Jika ada kendala, pengguna dapat kirim keluhan melalui menu komplain.',
        ],
    },
    {
        role: 'kurir',
        title: 'Manual Kurir',
        purpose: 'Panduan kurir dari aktifkan radar sampai komisi masuk dompet dan penarikan saldo.',
        steps: [
            'Aktifkan mode kurir di radar dan pastikan GPS aktif.',
            'Ambil job yang tersedia di radar sesuai validasi sistem.',
            'Jalankan status pengiriman sesuai urutan: pickup OTW, picked up, complete.',
            'Antarkan pesanan dan konfirmasi selesai ketika barang diterima pembeli.',
            'Cek dompet dan ajukan penarikan saldo bila sudah memenuhi syarat.',
        ],
        highlights: [
            'Kurir hanya dapat mengambil satu order aktif dalam satu waktu.',
            'Order tidak dapat dibatalkan jika barang sudah dibawa kurir.',
            'Minimum penarikan saldo Rp 10.000.',
        ],
    },
];

export default function ManualBookReport() {
    const isPrintMode =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('print') === '1';

    useEffect(() => {
        if (!isPrintMode) return;

        const timer = setTimeout(() => {
            window.print();
        }, 400);

        return () => clearTimeout(timer);
    }, [isPrintMode]);

    return (
        <>
            <Head title="Laporan Manual Book" />

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

                    .print-break {
                        break-before: page;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <header className="print-hide border-b border-slate-200 bg-white sticky top-0 z-20">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                        <Link href="/manual-book" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">Kembali ke Manual Book</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak PDF Laporan
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <section className="print-card bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-5">
                            <BookOpen className="w-4 h-4" />
                            Lampiran Manual Book Publik
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            Laporan Manual Book
                            <br />
                            Aplikasi UMKM Cipadung
                        </h1>

                        <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl">
                            Dokumen ini disusun sebagai bahan pelaporan kepada dewan juri.
                            Isi dokumen menggunakan bahasa sederhana agar mudah dipahami oleh pengguna non-teknis.
                        </p>

                        <div className="mt-6 grid md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-sm text-slate-500">Tanggal Dokumen</p>
                                <p className="mt-1 font-semibold text-slate-900 inline-flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    11 April 2026
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-sm text-slate-500">Status Akses</p>
                                <p className="mt-1 font-semibold text-slate-900 inline-flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Publik (tanpa login)
                                </p>
                            </div>
                        </div>
                    </section>

                    {sections.map((section, idx) => (
                        <section
                            key={section.role}
                            className={`print-card mt-6 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm ${idx > 0 ? 'print-break' : ''}`}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{section.title}</h2>
                            <p className="mt-2 text-slate-600 text-base md:text-lg leading-relaxed">{section.purpose}</p>

                            <div className="mt-6">
                                <h3 className="text-xl font-bold text-slate-900">Langkah Inti</h3>
                                <div className="mt-3 space-y-3">
                                    {section.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-slate-800 leading-relaxed">
                                                <span className="font-bold">{stepIndex + 1}. </span>
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    Poin Penting
                                </h3>
                                <div className="mt-3 space-y-3">
                                    {section.highlights.map((point, pointIdx) => (
                                        <div key={pointIdx} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                            <p className="text-emerald-900 leading-relaxed">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </>
    );
}
