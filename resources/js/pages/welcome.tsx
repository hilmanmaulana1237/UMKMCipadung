import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Store, ShoppingBag, Truck, Sparkles, MessageCircle, Star, ArrowRight, Phone } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import SeoHead from '@/components/SeoHead';

interface FeaturedStore {
    id: number;
    name: string;
    category: string;
    logo_path?: string;
    products_count: number;
    ratings_avg_stars?: number;
    ratings_count?: number;
    products?: Array<{
        id: number;
        name: string;
        price: number;
        image_path?: string;
    }>;
}

export default function Welcome({
    canRegister = true,
    featuredStores = [],
    topRatedStores = [],
}: {
    canRegister?: boolean;
    featuredStores?: FeaturedStore[];
    topRatedStores?: Array<{
        id: number;
        name: string;
        category: string;
        logo_path?: string;
        banner_path?: string;
        store_photo_path?: string;
        ratings_avg_stars: number;
        ratings_count: number;
        slug: string;
    }>;
}) {
    const { auth } = usePage<SharedData>().props;
    const isUmkm = auth.user?.role === 'umkm';
    const marketplaceUrl = isUmkm ? '/umkm/dashboard' : '/marketplace';

    const features = [
        {
            icon: Store,
            title: 'UMKM Lokal',
            description: 'Dukung pelaku usaha lokal Cipadung dengan berbelanja produk berkualitas dari toko-toko terdekat.',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            icon: Truck,
            title: 'Pengiriman Cepat',
            description: 'Kurir lokal siap antar pesanan Anda dengan cepat dan aman ke seluruh wilayah desa.',
            color: 'from-green-500 to-emerald-600',
        },
        {
            icon: Sparkles,
            title: 'AI Shopping Assistant',
            description: 'Temukan produk yang tepat dengan bantuan asisten belanja AI yang pintar dan responsif.',
            color: 'from-purple-500 to-pink-600',
        },
        {
            icon: MessageCircle,
            title: 'Chat Langsung',
            description: 'Komunikasi langsung dengan penjual melalui WhatsApp untuk diskusi produk dan pengiriman.',
            color: 'from-orange-500 to-red-600',
        },
    ];

    const steps = [
        { number: '1', title: 'Daftar Akun', description: 'Buat akun gratis dalam hitungan detik' },
        { number: '2', title: 'Pilih Produk', description: 'Jelajahi dan pilih produk dari UMKM lokal' },
        { number: '3', title: 'Checkout', description: 'Bayar dengan QRIS atau transfer bank' },
        { number: '4', title: 'Terima Pesanan', description: 'Kurir lokal antar ke rumah Anda' },
    ];

    const testimonials = [
        {
            name: 'Ibu Siti',
            role: 'Pembeli',
            quote: 'Sekarang belanja jadi lebih mudah! Produk UMKM Cipadung berkualitas dan pengirimannya cepat.',
            avatar: '👩',
        },
        {
            name: 'Pak Ahmad',
            role: 'Pemilik Warung',
            quote: 'Omset naik 3x lipat sejak bergabung! Pelanggan dari seluruh desa bisa order online.',
            avatar: '👨',
        },
        {
            name: 'Dinda',
            role: 'Mahasiswa',
            quote: 'AI Assistant-nya keren banget, langsung kasih rekomendasi produk yang pas sama budget.',
            avatar: '👧',
        },
    ];

    // Imports removed from here

    // ... imports

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Marketplace UMKM Cipadung",
        "url": "https://umkmcipadung.com",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://umkmcipadung.com/marketplace?search={search_term_string}",
            "query-input": "required name=search_term_string"
        },
        "description": "Platform marketplace digital desa untuk mendukung pelaku usaha lokal Cipadung. Belanja produk kuliner, kriya, dan jasa dari UMKM terpercaya."
    };

    return (
        <>
            <SeoHead
                title="Marketplace Cipadung - Belanja Online UMKM Desa"
                description="Pusat belanja online produk UMKM Desa Cipadung. Temukan makanan enak, kerajinan tangan unik, dan jasa terpercaya langsung dari penjual lokal."
                schema={schema}
            />

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-14 sm:h-16">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                    <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="font-bold text-slate-900">Marketplace</span>
                                    <span className="font-bold text-blue-600"> Cipadung</span>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2 sm:gap-3">
                                {auth.user ? (
                                    <Link
                                        href={marketplaceUrl}
                                        className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                    >
                                        <span className="sm:hidden">Marketplace</span>
                                        <span className="hidden sm:inline">Masuk Marketplace</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm transition-colors"
                                        >
                                            Masuk
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                                            >
                                                <span className="sm:hidden">Daftar</span>
                                                <span className="hidden sm:inline">Daftar Gratis</span>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    Innovillage 2025 - Desa Digital
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                                    Belanja Online dari{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                        UMKM Cipadung
                                    </span>
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                                    Platform marketplace digital untuk mendukung pelaku usaha lokal. Temukan produk berkualitas dari kuliner, kerajinan, hingga jasa.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link
                                        href={auth.user ? marketplaceUrl : "/register"}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Mulai Belanja
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href="https://wa.me/6287827718245"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Hubungi Kami
                                    </a>
                                </div>
                                <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-slate-900">50+</p>
                                        <p className="text-sm text-slate-500">UMKM Terdaftar</p>
                                    </div>
                                    <div className="w-px h-12 bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-slate-900">500+</p>
                                        <p className="text-sm text-slate-500">Produk Tersedia</p>
                                    </div>
                                    <div className="w-px h-12 bg-slate-200" />
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-slate-900">1000+</p>
                                        <p className="text-sm text-slate-500">Transaksi</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-2xl opacity-20" />
                                <CachedImage
                                    src="/images/hero-marketplace.webp"
                                    alt="Marketplace Cipadung"
                                    className="relative w-full rounded-3xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Kenapa Pilih Marketplace Cipadung?
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Platform yang dibangun khusus untuk memajukan ekonomi digital desa
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300"
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Store Preview Section */}
                {featuredStores.length > 0 && (
                    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                    <Store className="w-4 h-4" />
                                    Jelajahi UMKM
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                    Toko UMKM Cipadung
                                </h2>
                                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                    Belanja langsung dari UMKM lokal terpercaya. Dukung ekonomi desa!
                                </p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {featuredStores.map((store) => (
                                    <div
                                        key={store.id}
                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                                    >
                                        {/* Store Header */}
                                        <div className="p-4 border-b border-slate-100">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    {/* Store Logo */}
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                                        {store.logo_path ? (
                                                            <CachedImage src={`/storage/${store.logo_path}`} alt={store.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Store className="w-6 h-6 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                            {store.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                                BUKA
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {store.products_count} produk
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!auth.user) {
                                                            router.visit('/login');
                                                        } else {
                                                            router.visit(`/marketplace/store/${store.id}`);
                                                        }
                                                    }}
                                                    className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1 shrink-0"
                                                >
                                                    Lihat Toko
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-semibold text-slate-900">
                                                        {store.ratings_avg_stars ? Number(store.ratings_avg_stars).toFixed(1) : '0.0'}
                                                    </span>
                                                    <span className="text-slate-400">({store.ratings_count || 0})</span>
                                                </div>
                                                <span className="text-slate-300">|</span>
                                                <span className="capitalize">{store.category}</span>
                                            </div>
                                        </div>

                                        {/* Product Previews */}
                                        {store.products && store.products.length > 0 ? (
                                            <div className="p-4">
                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                                                    {store.products.slice(0, 4).map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="shrink-0 w-24"
                                                        >
                                                            <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden mb-2">
                                                                {product.image_path ? (
                                                                    <CachedImage
                                                                        src={`/storage/${product.image_path}`}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-600 truncate">{product.name}</p>
                                                            <p className="text-sm font-bold text-blue-600">
                                                                Rp {(product.price / 1000).toFixed(0)}k
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-slate-400 text-sm">
                                                Belum ada produk
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-10">
                                <button
                                    onClick={() => {
                                        if (!auth.user) {
                                            router.visit('/login');
                                        } else {
                                            router.visit('/marketplace');
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    {auth.user ? 'Jelajahi Semua Toko' : 'Gabung & Belanja'}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* How It Works Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Cara Belanja
                            </h2>
                            <p className="text-lg text-slate-600">
                                Mudah dan cepat dalam 4 langkah
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <div key={index} className="text-center relative">
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-100" />
                                    )}
                                    <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl text-2xl font-bold mb-5 shadow-lg shadow-blue-500/25">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                                Apa Kata Mereka?
                            </h2>
                            <p className="text-lg text-slate-600">
                                Testimoni dari pengguna Marketplace Cipadung
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{testimonial.name}</p>
                                            <p className="text-sm text-slate-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Siap Bergabung dengan Marketplace Cipadung?
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Daftar sekarang dan nikmati kemudahan berbelanja dari UMKM lokal. Gratis!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={auth.user ? marketplaceUrl : "/register"}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {auth.user ? 'Mulai Belanja' : 'Daftar Sekarang'}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* UMKM/Affiliate Registration Info */}
                <section className="py-16 bg-slate-900">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 border border-green-500/30">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-white mb-3">
                                    Ingin Bergabung Sebagai UMKM, Kurir atau Affiliator?
                                </h3>
                                <p className="text-slate-300 mb-6 max-w-xl mx-auto">
                                    Untuk mendaftarkan usaha Anda di Marketplace Cipadung, silakan hubungi pihak Desa untuk proses verifikasi dan pendaftaran.
                                </p>
                                <a
                                    href="https://wa.me/6287827718245"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-lg hover:bg-green-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Hubungi Admin Desa (087827718245)
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mitra & Penyelenggara Section */}
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Innovillage 2025</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                                Mitra & Penyelenggara
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                Terima kasih kepada para penyelenggara dan mitra yang telah mendukung terciptanya Marketplace Cipadung dalam ajang Innovillage 2025
                            </p>
                        </div>

                        {/* Logos Grid */}
                        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-16">
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/LOGO INNOVILLAGE6TH (1).png" alt="Innovillage" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Innovillage</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/logo-danantara-indonesia.webp" alt="Danantara Indonesia" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Danantara Indonesia</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/Telkom-Indonesia.webp" alt="Telkom Indonesia" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Telkom Indonesia</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/Telkom-U.webp" alt="Telkom University" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Telkom University</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/Logo-uinsgd_official-209x300.webp" alt="UIN SGD Bandung" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">UIN SGD Bandung</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/logo_if.webp" alt="Informatika" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Teknik Informatika UIN SGD</p>
                            </div>
                            <div className="flex flex-col items-center group">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                    <CachedImage src="/mitra-lomba/cipadung.webp" alt="Desa Cipadung" className="max-w-full max-h-full object-contain" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Kelurahan Cipadung</p>
                            </div>
                        </div>

                        {/* Supported By Section */}
                        <div className="text-center mb-8">
                            <h3 className="text-lg font-semibold text-slate-800 mb-6 uppercase tracking-wider">
                                Supported By
                            </h3>
                            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                                <div className="flex flex-col items-center group">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                        <CachedImage src="/mitra-lomba/sobatkampus.webp" alt="Sobat Kampus" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">Sobat Kampus</p>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 p-4 flex items-center justify-center group-hover:shadow-xl group-hover:border-blue-200 transition-all">
                                        <CachedImage src="/mitra-lomba/logo Informatika Sakti.webp" alt="IF Sakti Podcast" className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">IF Sakti Production</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <p className="text-slate-500 text-sm">
                                Bersama membangun ekosistem digital desa yang inklusif dan berkelanjutan
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-slate-900 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-white">Marketplace</span>
                                    <span className="font-bold text-blue-400"> Cipadung</span>
                                </div>
                            </div>
                            <div className="text-center md:text-right">
                                <p className="text-slate-400 text-sm">
                                    © 2025 Marketplace Cipadung - Innovillage
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                    Didukung oleh Pemerintah Kelurahan Cipadung
                                </p>
                                <p className="text-slate-600 text-[10px] mt-2 font-medium opacity-70">
                                    Powered by UMKMCipadung
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
