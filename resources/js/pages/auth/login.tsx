import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, Video, Image, Bot, Wand2 } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const features = [
        { icon: Video, text: 'Generate video promosi AI' },
        { icon: Image, text: 'Buat poster profesional' },
        { icon: Bot, text: 'Konsultasi bisnis 24/7' },
        { icon: Wand2, text: 'Copywriting otomatis' },
    ];

    return (
        <>
            <Head title="Masuk - MudaPreneur AI" />
            <div className="min-h-screen flex">
                {/* Left Side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
                    {/* Animated Background */}
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
                            Selamat Datang<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Kembali!</span>
                        </h1>

                        <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
                            Masuk dan lanjutkan membuat konten promosi AI untuk bisnis UMKM Anda.
                        </p>

                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                                        <feature.icon className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <span className="text-white/80 font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
                    {/* Mobile Header */}
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

                    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                        <div className="w-full max-w-md">
                            <div className="lg:hidden text-center mb-8">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang!</h1>
                                <p className="text-slate-600">Masuk ke akun penjual Anda</p>
                            </div>

                            <div className="hidden lg:block mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Masuk ke Akun</h2>
                                <p className="text-slate-600">Belum punya akun? <TextLink href={register()} className="font-semibold text-blue-600 hover:text-blue-700">Daftar gratis</TextLink></p>
                            </div>

                            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
                                <Form
                                    {...store.form()}
                                    resetOnSuccess={['password']}
                                    className="flex flex-col gap-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                                                    Alamat Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="nama@email.com"
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                                                        Kata Sandi
                                                    </Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                            tabIndex={5}
                                                        >
                                                            Lupa kata sandi?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 transition-all"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Checkbox id="remember" name="remember" tabIndex={3} className="rounded-md" />
                                                <Label htmlFor="remember" className="text-slate-600 text-sm cursor-pointer">
                                                    Ingat saya di perangkat ini
                                                </Label>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && <Spinner />}
                                                Masuk
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                {status && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center text-sm font-medium text-green-700">
                                        ✓ {status}
                                    </div>
                                )}
                            </div>

                            {canRegister && (
                                <div className="lg:hidden text-center mt-6">
                                    <p className="text-slate-600">
                                        Belum punya akun?{' '}
                                        <TextLink href={register()} className="font-semibold text-blue-600 hover:text-blue-700">
                                            Daftar Sekarang
                                        </TextLink>
                                    </p>
                                </div>
                            )}
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
