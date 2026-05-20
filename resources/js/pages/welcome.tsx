import { Link, usePage } from '@inertiajs/react';
import { Sparkles, Video, Image, ArrowRight, Zap, Bot, Wand2, Star, Store } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import SeoHead from '@/components/SeoHead';
import { type SharedData } from '@/types';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Video,
            title: 'AI Video Generator',
            description: 'Buat video promosi profesional dari foto produk Anda secara otomatis dengan teknologi AI terkini.',
            color: 'from-blue-500 to-indigo-600',
            glow: 'shadow-blue-500/20',
            bg: 'bg-blue-500/10',
        },
        {
            icon: Image,
            title: 'AI Poster Maker',
            description: 'Generate poster promosi menarik untuk media sosial langsung dari template AI yang canggih.',
            color: 'from-pink-500 to-rose-600',
            glow: 'shadow-pink-500/20',
            bg: 'bg-pink-500/10',
        },
        {
            icon: Bot,
            title: 'AI Business Mentor',
            description: 'Konsultasi bisnis 24/7 dengan AI mentor yang paham strategi pemasaran dan operasional UMKM.',
            color: 'from-emerald-500 to-teal-600',
            glow: 'shadow-emerald-500/20',
            bg: 'bg-emerald-500/10',
        },
        {
            icon: Wand2,
            title: 'AI Copywriting',
            description: 'Generate deskripsi produk, caption sosial media, dan script video yang menjual secara otomatis.',
            color: 'from-amber-500 to-orange-600',
            glow: 'shadow-amber-500/20',
            bg: 'bg-amber-500/10',
        },
        {
            icon: Store,
            title: 'Katalog UMKM Digital',
            description: 'Tampilkan produk UMKM desa dalam katalog online modern yang mudah diakses oleh masyarakat dan pelanggan.',
            color: 'from-cyan-500 to-blue-600',
            glow: 'shadow-cyan-500/20',
            bg: 'bg-cyan-500/10',
        },
    ];

    const steps = [
        { number: '01', title: 'Daftar Gratis', description: 'Buat akun penjual dalam hitungan detik', emoji: '📝' },
        { number: '02', title: 'Upload Foto', description: 'Upload foto Anda sebagai bahan konten AI', emoji: '📸' },
        { number: '03', title: 'Generate Konten', description: 'Pilih jenis konten: video, poster, atau teks', emoji: '✨' },
        { number: '04', title: 'Publish & Promosi', description: 'Download dan bagikan ke media sosial', emoji: '🚀' },
    ];

    const testimonials = [
        {
            name: 'Pak Ahmad',
            role: 'Pemilik Warung Makan',
            quote: 'Bikin video promosi yang tadinya bayar mahal, sekarang bisa gratis pakai AI. Mantap banget!',
            avatar: '👨',
        },
        {
            name: 'Ibu Siti',
            role: 'Penjual Kue',
            quote: 'Poster untuk Instagram langsung jadi dalam hitungan detik. Desainnya profesional dan eye-catching!',
            avatar: '👩',
        },
        {
            name: 'Dinda',
            role: 'Penjual Fashion',
            quote: 'AI Mentor-nya bantu saya nentuin strategi harga yang pas. Omset naik 2x lipat sejak pakai tips-nya.',
            avatar: '👧',
        },
    ];

    const partners = [
        { src: '/mitra-lomba/LOGO INNOVILLAGE6TH (1).png', name: 'Innovillage' },
        { src: '/mitra-lomba/logo-danantara-indonesia.webp', name: 'Danantara Indonesia' },
        { src: '/mitra-lomba/Telkom-Indonesia.webp', name: 'Telkom Indonesia' },
        { src: '/mitra-lomba/Telkom-U.webp', name: 'Telkom University' },
        { src: '/mitra-lomba/Logo-uinsgd_official-209x300.webp', name: 'UIN SGD Bandung' },
        { src: '/mitra-lomba/logo_if.webp', name: 'Teknik Informatika UIN SGD' },
        { src: '/mitra-lomba/cipadung.webp', name: 'Kelurahan Cipadung' },
        { src: '/mitra-lomba/Himatif.png', name: 'HIMATIF' },
    ];

    const supporters = [
        { src: '/mitra-lomba/logo Informatika Sakti.webp', name: 'IF Sakti Production' },
    ];

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "MudaPreneur AI - UMKM Cipadung",
        "url": "https://umkmcipadung.com",
        "description": "Platform AI Content Generator untuk membantu UMKM membuat konten promosi video, poster, dan copywriting secara otomatis."
    };

    return (
        <>
            <SeoHead
                title="MudaPreneur AI - AI Content Generator untuk UMKM"
                description="Buat video promosi, poster, dan copywriting secara otomatis dengan AI. Platform gratis untuk membantu penjual UMKM Cipadung membuat konten profesional."
                schema={schema}
            />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.3; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
                .animate-glow { animation: glow-pulse 4s ease-in-out infinite; }
                .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
                .animate-slide-up-d1 { animation: slide-up 0.6s ease-out 0.1s forwards; opacity: 0; }
                .animate-slide-up-d2 { animation: slide-up 0.6s ease-out 0.2s forwards; opacity: 0; }
                .animate-slide-up-d3 { animation: slide-up 0.6s ease-out 0.3s forwards; opacity: 0; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(226, 232, 240, 0.95);
                    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
                }
                .glass-card:hover {
                    background: #ffffff;
                    border-color: rgba(59, 130, 246, 0.35);
                    box-shadow: 0 18px 44px rgba(37, 99, 235, 0.12);
                }
            `}</style>

            <div className="min-h-screen bg-slate-50 text-slate-950" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

                {/* ─── NAVIGATION ─── */}
                <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-2xl">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">
                                    MudaPreneur<span className="text-blue-600">.AI</span>
                                </span>
                            </Link>
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href="/umkm/dashboard"
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className="px-4 py-2 text-slate-600 hover:text-slate-950 font-medium text-sm transition-colors">
                                            Masuk
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                            >
                                                Daftar Gratis
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ─── HERO ─── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 lg:py-24">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.24),transparent_34%)]" />

                    <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
                        <div className="text-center">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 border border-white/20 text-white rounded-full text-sm font-semibold mb-8 shadow-lg shadow-blue-900/10 animate-slide-up">
                                <Sparkles className="w-4 h-4" />
                                Platform Digital UMKM Desa
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] text-white mb-6 animate-slide-up-d1">
                                Digitalisasi Produk dan{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-100">
                                    Promosi AI
                                </span>
                                <br className="hidden sm:block" />
                                {' '}untuk UMKM Anda
                            </h1>

                            {/* Subheading */}
                            <p className="text-base sm:text-lg lg:text-xl text-blue-50/90 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up-d2">
                                Kelola katalog produk UMKM, promosikan usaha secara digital, dan manfaatkan teknologi AI untuk membuat konten pemasaran lebih cepat, menarik, dan profesional.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-d3">
                                <Link
                                    href={auth.user ? "/umkm/dashboard" : "/register"}
                                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50"
                                >
                                    <Zap className="w-5 h-5" />
                                    Mulai Digitalisasi UMKM
                                </Link>
                                <Link
                                    href="/portal-umkm"
                                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 border border-white/25 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <Store className="w-5 h-5" />
                                    Temukan Produk UMKM
                                </Link>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center justify-center gap-10 sm:gap-14 mt-16 sm:mt-20">
                                {[
                                    { value: '100%', label: 'Gratis' },
                                    { value: 'AI', label: 'Powered' },
                                    { value: '24/7', label: 'Tersedia' },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                                        <p className="text-xs sm:text-sm text-blue-50/75 mt-1 font-medium">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FEATURES ─── */}
                <section className="py-20 lg:py-28 relative">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Fitur Unggulan</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Fitur AI yang Powerful
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                                Semua tools AI yang Anda butuhkan untuk membuat konten promosi profesional
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="glass-card rounded-2xl p-6 transition-all duration-300 group cursor-default"
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── HOW IT WORKS ─── */}
                <section className="py-20 lg:py-28 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-transparent" />
                    <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Langkah Mudah</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Cara Kerjanya
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600">
                                Mudah dan cepat dalam 4 langkah
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {steps.map((step, index) => (
                                <div key={index} className="relative text-center group">
                                    {/* Connector line (desktop) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                                    )}
                                    <div className="relative inline-flex flex-col items-center">
                                        <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-5 group-hover:border-blue-500/40 transition-colors duration-300 shadow-lg shadow-blue-100/60">
                                            <span className="text-3xl">{step.emoji}</span>
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-[11px] font-bold shadow-lg shadow-blue-500/25">
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1.5">{step.title}</h3>
                                    <p className="text-slate-600 text-sm">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── TESTIMONIALS ─── */}
                <section className="py-20 lg:py-28">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Testimoni</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Apa Kata Mereka?
                            </h2>
                            <p className="text-base sm:text-lg text-slate-600">
                                Testimoni dari penjual UMKM yang sudah menggunakan MudaPreneur AI
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {testimonials.map((t, index) => (
                                <div
                                    key={index}
                                    className="glass-card rounded-2xl p-6 transition-all duration-300 flex flex-col"
                                >
                                    {/* Stars */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    {/* Quote */}
                                    <p className="text-slate-700 mb-6 text-sm leading-relaxed flex-1">
                                        "{t.quote}"
                                    </p>
                                    {/* Author */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center text-xl border border-blue-100">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{t.name}</p>
                                            <p className="text-xs text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CTA ─── */}
                <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent" />
                    <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-5">
                            Siap Membuat Konten AI untuk Bisnis Anda?
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
                            Daftar gratis sekarang dan mulai generate video promosi, poster menarik, dan konsultasi bisnis dengan AI.
                        </p>
                        <Link
                            href={auth.user ? "/umkm/ai-content" : "/register"}
                            className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <Sparkles className="w-5 h-5" />
                            {auth.user ? 'Buat Konten Sekarang' : 'Daftar Gratis Sekarang'}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>

                {/* ─── MITRA & PENYELENGGARA ─── */}
                <section className="py-16 lg:py-20 border-t border-slate-200 bg-white">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Our Partners</p>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Mitra & Penyelenggara
                            </h2>
                            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
                                Terima kasih kepada para penyelenggara dan mitra yang telah mendukung terciptanya platform ini
                            </p>
                        </div>

                        {/* Partners Grid */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mb-14 max-w-5xl mx-auto">
                            {partners.map((partner, i) => (
                                <div key={i} className="w-28 sm:w-32 flex flex-col items-center group">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-center shadow-sm shadow-slate-200/70 group-hover:border-blue-500/40 group-hover:shadow-blue-100 transition-all duration-300 mx-auto">
                                        <CachedImage src={partner.src} alt={partner.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-2 font-medium text-center leading-tight">{partner.name}</p>
                                </div>
                            ))}
                        </div>

                        {/* Supporters */}
                        <div className="text-center">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
                                Supported By
                            </p>
                            <div className="flex items-center justify-center gap-6 sm:gap-10">
                                {supporters.map((supporter, i) => (
                                    <div key={i} className="flex flex-col items-center group">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-center shadow-sm shadow-slate-200/70 group-hover:border-blue-500/40 group-hover:shadow-blue-100 transition-all duration-300">
                                            <CachedImage src={supporter.src} alt={supporter.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-2 font-medium">{supporter.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ─── */}
                <footer className="py-10 border-t border-slate-200 bg-white">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">
                                    MudaPreneur<span className="text-blue-600">.AI</span>
                                </span>
                            </Link>
                            <div className="text-center sm:text-right">
                                <p className="text-slate-500 text-xs">
                                    © 2025 MudaPreneur AI — Innovillage UMKM Cipadung
                                </p>
                                <p className="text-slate-600 text-[11px] mt-0.5">
                                    Didukung oleh Pemerintah Kelurahan Cipadung
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
