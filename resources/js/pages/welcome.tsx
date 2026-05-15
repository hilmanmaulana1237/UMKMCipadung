import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, Video, Image, MessageCircle, ArrowRight, Zap, Bot, Wand2, ChevronRight, Star, Quote } from 'lucide-react';
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
    ];

    const supporters = [
        { src: '/mitra-lomba/sobatkampus.webp', name: 'Sobat Kampus' },
        { src: '/mitra-lomba/logo Informatika Sakti.webp', name: 'IF Sakti Production' },
        { src: '/mitra-lomba/Himatif.png', name: 'HIMATIF' },
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
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    backdrop-filter: blur(12px);
                }
                .glass-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(99, 102, 241, 0.2);
                }
            `}</style>

            <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

                {/* ─── NAVIGATION ─── */}
                <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">
                                    MudaPreneur<span className="text-blue-400">.AI</span>
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
                                        <Link href="/login" className="px-4 py-2 text-slate-400 hover:text-white font-medium text-sm transition-colors">
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
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36">
                    {/* Background orbs */}
                    <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-glow" />
                    <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-full blur-[140px]" />

                    <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
                        <div className="text-center">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-8 animate-slide-up">
                                <Sparkles className="w-4 h-4" />
                                Innovillage 2025 — Powered by AI
                            </div>

                            {/* Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6 animate-slide-up-d1">
                                Buat Konten{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                                    Promosi AI
                                </span>
                                <br className="hidden sm:block" />
                                {' '}untuk UMKM Anda
                            </h1>

                            {/* Subheading */}
                            <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up-d2">
                                Generate video promosi, poster menarik, dan copywriting yang menjual — semuanya otomatis dengan kekuatan Artificial Intelligence.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-d3">
                                <Link
                                    href={auth.user ? "/umkm/dashboard" : "/register"}
                                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Zap className="w-5 h-5" />
                                    Mulai Buat Konten AI
                                </Link>
                                <Link
                                    href={auth.user ? "/umkm/ai-mentor" : "/register"}
                                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-base sm:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <Bot className="w-5 h-5" />
                                    Chat AI Mentor
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
                                        <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{stat.value}</p>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
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
                            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Fitur Unggulan</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Fitur AI yang Powerful
                            </h2>
                            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
                                Semua tools AI yang Anda butuhkan untuk membuat konten promosi profesional
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="glass-card rounded-2xl p-6 transition-all duration-300 group cursor-default"
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── HOW IT WORKS ─── */}
                <section className="py-20 lg:py-28 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
                    <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Langkah Mudah</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Cara Kerjanya
                            </h2>
                            <p className="text-base sm:text-lg text-slate-400">
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
                                        <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-5 group-hover:border-blue-500/30 transition-colors duration-300 shadow-xl">
                                            <span className="text-3xl">{step.emoji}</span>
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-[11px] font-bold shadow-lg shadow-blue-500/25">
                                            {step.number}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1.5">{step.title}</h3>
                                    <p className="text-slate-400 text-sm">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── TESTIMONIALS ─── */}
                <section className="py-20 lg:py-28">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Testimoni</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                                Apa Kata Mereka?
                            </h2>
                            <p className="text-base sm:text-lg text-slate-400">
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
                                    <p className="text-slate-300 mb-6 text-sm leading-relaxed flex-1">
                                        "{t.quote}"
                                    </p>
                                    {/* Author */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center text-xl border border-white/10">
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
                <section className="py-20 lg:py-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
                    <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-5">
                            Siap Membuat Konten AI untuk Bisnis Anda?
                        </h2>
                        <p className="text-base sm:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
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
                <section className="py-16 lg:py-20 border-t border-white/5">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Innovillage 2025</p>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Mitra & Penyelenggara
                            </h2>
                            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
                                Terima kasih kepada para penyelenggara dan mitra yang telah mendukung terciptanya platform ini
                            </p>
                        </div>

                        {/* Partners Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5 mb-14 max-w-4xl mx-auto">
                            {partners.map((partner, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className="w-full aspect-square max-w-[100px] bg-white/[0.04] rounded-2xl border border-white/[0.08] p-3.5 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-white/[0.08] transition-all duration-300 mx-auto">
                                        <CachedImage src={partner.src} alt={partner.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-2 font-medium text-center leading-tight">{partner.name}</p>
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
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.04] rounded-2xl border border-white/[0.08] p-3 flex items-center justify-center group-hover:border-blue-500/30 group-hover:bg-white/[0.08] transition-all duration-300">
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
                <footer className="py-10 border-t border-white/5">
                    <div className="max-w-6xl mx-auto px-5 sm:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-sm tracking-tight">
                                    MudaPreneur<span className="text-blue-400">.AI</span>
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
