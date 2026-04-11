import { Head, Link } from '@inertiajs/react';
import { BookOpen, Store, User, Truck, ArrowRight, Phone, Printer } from 'lucide-react';

const roleCards = [
    {
        role: 'umkm',
        title: 'Panduan UMKM (Penjual)',
        description: 'Untuk pemilik toko: cara atur toko, kelola produk, dan proses pesanan.',
        icon: Store,
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'Untuk Penjual',
    },
    {
        role: 'pengguna',
        title: 'Panduan Pengguna (Pembeli)',
        description: 'Untuk pembeli: cara belanja, checkout, cek status pesanan, dan komplain.',
        icon: User,
        gradient: 'from-emerald-500 to-green-600',
        badge: 'Untuk Pembeli',
    },
    {
        role: 'kurir',
        title: 'Panduan Kurir',
        description: 'Untuk kurir: cara ambil order di radar, antar pesanan, dan tarik saldo.',
        icon: Truck,
        gradient: 'from-orange-500 to-amber-600',
        badge: 'Untuk Kurir',
    },
];

export default function ManualBookIndex() {
    return (
        <>
            <Head title="Manual Book" />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
                            <BookOpen className="w-5 h-5" />
                            <span className="font-semibold">Manual Book UMKM Cipadung</span>
                        </Link>
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
                </header>

                <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm mb-8">
                        <p className="text-sm md:text-base text-blue-700 font-semibold mb-2">Panduan Resmi</p>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            Pilih Panduan Sesuai Peran Anda
                        </h1>
                        <p className="text-slate-600 mt-4 text-base md:text-lg leading-relaxed max-w-3xl">
                            Halaman ini dibuat dengan bahasa sederhana agar mudah dipahami oleh semua kalangan,
                            termasuk yang belum terbiasa menggunakan teknologi.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/manual-book/report"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <BookOpen className="w-4 h-4" />
                                Halaman Laporan Juri
                            </Link>
                            <a
                                href="/manual-book/report?print=1"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak PDF Gabungan
                            </a>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {roleCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <Link
                                    key={card.role}
                                    href={`/manual-book/${card.role}`}
                                    className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                            {card.badge}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{card.title}</h2>
                                    <p className="text-slate-600 mt-2 leading-relaxed">{card.description}</p>

                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 group-hover:text-blue-800">
                                        Buka Panduan
                                        <ArrowRight className="w-4 h-4" />
                                    </div>

                                    <div className="mt-3">
                                        <a
                                            href={`/manual-book/${card.role}?print=1`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            Cetak PDF
                                        </a>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <p className="text-amber-900 font-semibold">Tips cepat</p>
                        <p className="text-amber-800 mt-1 leading-relaxed">
                            Jika bingung, buka panduan sesuai peran Anda lalu ikuti langkah dari atas ke bawah.
                            Setiap langkah sudah ditulis sesingkat dan sejelas mungkin.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
