import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Heart, Award, ChevronLeft } from 'lucide-react';

export default function About() {
    return (
        <AppLayout showBottomNav={false}>
            <Head title="Tentang Aplikasi" />

            <div className="bg-white min-h-screen pb-10">
                {/* Custom Header */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.visit('/profile')}
                        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-800" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">Tentang Aplikasi</h1>
                </div>

                <div className="p-4 space-y-6 max-w-lg mx-auto">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                        {/* Hero Section */}
                        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-12 text-center text-white overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-white/20 shadow-lg">
                                    <Award className="w-4 h-4 text-yellow-300" />
                                    Innovillage 2025
                                </div>
                                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Marketplace Cipadung</h2>
                                <p className="text-blue-100 text-sm leading-relaxed max-w-xs mx-auto">
                                    Platform digital kebanggaan warga Cipadung untuk memajukan ekonomi lokal.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Mission */}
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Misi Sosial</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Kami hadir untuk menjembatani UMKM Cipadung dengan pasar yang lebih luas. Setiap transaksi di sini adalah dukungan nyata bagi pertumbuhan ekonomi desa kita.
                                    </p>
                                </div>
                            </div>

                            {/* Partnership */}
                            <div className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg mb-2">Mitra Resmi</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Kolaborasi strategis antara <strong>Peserta Lomba Innovillage</strong> dan <strong>Kelurahan Cipadung</strong>. Menciptakan ekosistem digital yang aman, terpercaya, dan berdampak langsung bagi masyarakat.
                                    </p>
                                </div>
                            </div>

                            {/* Divider with Logo Placeholder/Icon */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-slate-300 text-xs uppercase tracking-widest">Credits</span>
                                </div>
                            </div>

                            {/* Developer Info */}
                            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Developed by</p>
                                <p className="font-bold text-slate-700 text-base">Tim Reformists - Innovillage 2025</p>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    <p className="text-xs text-slate-500 font-medium">Versi 1.0.0 (Production)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
