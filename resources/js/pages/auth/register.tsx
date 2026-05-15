import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, Video, Image, Bot, Zap } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function Register() {
    const benefits = [
        { icon: Video, title: 'AI Video Generator', desc: 'Buat video promosi otomatis' },
        { icon: Image, title: 'AI Poster Maker', desc: 'Poster profesional dalam detik' },
        { icon: Bot, title: 'AI Business Mentor', desc: 'Konsultasi bisnis 24/7' },
        { icon: Zap, title: '100% Gratis', desc: 'Tanpa biaya apapun' },
    ];

    return (
        <>
            <Head title="Daftar Penjual - MudaPreneur AI" />
            <div className="min-h-screen flex">
                {/* Left Side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob" />
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-center h-full px-12 xl:px-20 pb-32">
                        <Link href="/" className="flex items-center gap-3 mb-12 hover:scale-105 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-bold text-white">MudaPreneur</span>
                                <span className="text-2xl font-bold text-blue-300">.AI</span>
                            </div>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                            Bergabung<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sekarang!</span>
                        </h1>

                        <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
                            Daftar gratis dan mulai membuat konten promosi AI untuk bisnis UMKM Anda.
                        </p>

                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                                    <benefit.icon className="w-6 h-6 text-blue-300 mb-2" />
                                    <h3 className="text-white font-semibold text-sm">{benefit.title}</h3>
                                    <p className="text-slate-400 text-xs mt-1">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
                    <div className="lg:hidden p-4 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Kembali</span>
                        </Link>
                    </div>

                    <div className="hidden lg:block p-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Kembali ke Beranda</span>
                        </Link>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                        <div className="w-full max-w-md">
                            <div className="lg:hidden text-center mb-6">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Daftar Penjual</h1>
                                <p className="text-slate-600 text-sm">Buat akun gratis dan mulai buat konten AI</p>
                            </div>

                            <div className="hidden lg:block mb-6">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Daftar sebagai Penjual</h2>
                                <p className="text-slate-600">Sudah punya akun? <TextLink href={login()} className="font-semibold text-blue-600 hover:text-blue-700">Masuk</TextLink></p>
                            </div>

                            {/* AI Info Banner */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-900 font-semibold">Akun Penjual UMKM</p>
                                    <p className="text-xs text-blue-700 mt-0.5">
                                        Langsung bisa akses AI Content Generator & Business Mentor setelah daftar.
                                    </p>
                                </div>
                            </div>

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

                            <div className="lg:hidden text-center mt-6">
                                <p className="text-slate-600">
                                    Sudah punya akun?{' '}
                                    <TextLink href={login()} className="font-semibold text-blue-600 hover:text-blue-700">
                                        Masuk
                                    </TextLink>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </>
    );
}
