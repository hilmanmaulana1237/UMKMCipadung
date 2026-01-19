import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';
import { Store, ArrowLeft, Info, CheckCircle, Users, TrendingUp, Zap } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Register() {
    const benefits = [
        { icon: CheckCircle, title: 'Gratis Selamanya', desc: 'Daftar tanpa biaya apapun' },
        { icon: Users, title: 'Komunitas UMKM', desc: '50+ toko lokal terdaftar' },
        { icon: TrendingUp, title: 'Harga Terbaik', desc: 'Langsung dari produsen' },
        { icon: Zap, title: 'Pengiriman Kilat', desc: 'Kurir lokal yang handal' },
    ];

    return (
        <>
            <Head title="Daftar Akun - Marketplace Cipadung" />
            <div className="min-h-screen flex">
                {/* Left Side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                    </div>

                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-30" />

                    {/* Content - Left aligned */}
                    <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-20 pb-32">
                        <Link href="/" className="flex items-center gap-3 mb-12 hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                                <Store className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-white">Marketplace</span>
                                <span className="text-2xl font-bold text-blue-200"> Cipadung</span>
                            </div>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                            Bergabung<br />
                            <span className="text-blue-200">Sekarang!</span>
                        </h1>

                        <p className="text-lg text-blue-100 mb-10 max-w-md leading-relaxed">
                            Daftar gratis dan mulai belanja dari UMKM lokal Cipadung. Dukung ekonomi desa bersama kami.
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
                                    <benefit.icon className="w-6 h-6 text-blue-200 mb-2" />
                                    <h3 className="text-white font-semibold text-sm">{benefit.title}</h3>
                                    <p className="text-blue-100 text-xs mt-1">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stats - Centered at bottom */}
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center gap-8">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">500+</p>
                                <p className="text-blue-200 text-sm">Produk</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">50+</p>
                                <p className="text-blue-200 text-sm">UMKM</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">1K+</p>
                                <p className="text-blue-200 text-sm">Transaksi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
                    {/* Mobile Header */}
                    <div className="lg:hidden p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Kembali</span>
                        </Link>
                    </div>

                    {/* Desktop Back Button */}
                    <div className="hidden lg:block p-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Kembali ke Beranda</span>
                        </Link>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                        <div className="w-full max-w-md">
                            {/* Mobile Logo */}
                            <div className="lg:hidden text-center mb-6">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Buat Akun Baru</h1>
                                <p className="text-slate-600 text-sm">Daftar gratis, belanja mudah</p>
                            </div>

                            {/* Desktop Title */}
                            <div className="hidden lg:block mb-6">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Buat Akun Pembeli</h2>
                                <p className="text-slate-600">Sudah punya akun? <TextLink href={login()} className="font-semibold text-blue-600 hover:text-blue-700">Masuk</TextLink></p>
                            </div>

                            {/* Buyer Info Banner */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Info className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-900 font-semibold">Khusus Pembeli</p>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        Untuk UMKM & Affiliator, hubungi admin desa.
                                    </p>
                                </div>
                            </div>

                            {/* Form Card */}
                            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
                                <Form
                                    {...store.form()}
                                    resetOnSuccess={['password', 'password_confirmation']}
                                    disableWhileProcessing
                                    className="flex flex-col gap-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">
                                                    Nama Lengkap
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    name="name"
                                                    placeholder="Masukkan nama lengkap"
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                />
                                                <InputError message={errors.name} className="mt-1" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                                                    Alamat Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder="nama@email.com"
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                                                        Kata Sandi
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        required
                                                        tabIndex={3}
                                                        autoComplete="new-password"
                                                        name="password"
                                                        placeholder="Min. 8 karakter"
                                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                    />
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation" className="text-slate-700 font-semibold text-sm">
                                                        Konfirmasi
                                                    </Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        required
                                                        tabIndex={4}
                                                        autoComplete="new-password"
                                                        name="password_confirmation"
                                                        placeholder="Ulangi sandi"
                                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                    />
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 mt-2"
                                                tabIndex={5}
                                                data-test="register-user-button"
                                            >
                                                {processing && <Spinner />}
                                                Daftar Sekarang
                                            </Button>

                                            <p className="text-xs text-center text-slate-500 mt-2">
                                                Dengan mendaftar, Anda menyetujui syarat & ketentuan kami
                                            </p>
                                        </>
                                    )}
                                </Form>
                            </div>

                            {/* Mobile Login Link */}
                            <div className="lg:hidden text-center mt-6">
                                <p className="text-slate-600">
                                    Sudah punya akun?{' '}
                                    <TextLink href={login()} className="font-semibold text-blue-600 hover:text-blue-700">
                                        Masuk
                                    </TextLink>
                                </p>
                            </div>

                            {/* UMKM/Affiliate Section */}
                            <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-amber-900 mb-1">
                                            Ingin Jadi UMKM, Kurir atau Affiliator?
                                        </h3>
                                        <p className="text-xs text-amber-700 mb-3">
                                            Hubungi Admin Kelurahan Cipadung untuk proses verifikasi dan pendaftaran usaha Anda.
                                        </p>
                                        <a
                                            href="https://wa.me/6287827718245"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            WhatsApp Admin
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for blob animation */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
