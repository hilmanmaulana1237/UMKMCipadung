import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { User, Settings, LogOut, ChevronRight, Camera, Sparkles, LayoutDashboard, Loader2, Store } from 'lucide-react';
import { useRef, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            avatar_path?: string;
        };
    };
    [key: string]: any;
}

export default function ProfileIndex() {
    const { auth } = usePage<PageProps>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('ai_chat_messages');
        }
        router.post('/logout');
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/profile/avatar', formData, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    };

    return (
        <AppLayout activeTab="account">
            <Head title="Profil - MudaPreneur AI" />

            {/* Profile Header */}
            <div className="px-4 pt-6 pb-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={handleAvatarClick}
                            disabled={uploading}
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 overflow-hidden border-2 border-white/10 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all disabled:opacity-60"
                        >
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : auth.user.avatar_path ? (
                                <img src={`/storage/${auth.user.avatar_path}`} alt={auth.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/80" />
                            )}
                        </button>
                        <div
                            onClick={handleAvatarClick}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                            <Camera className="w-3.5 h-3.5 text-white" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{auth.user.name}</h1>
                        <p className="text-white/60 text-sm">{auth.user.email}</p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            auth.user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                        }`}>
                            {auth.user.role === 'admin' ? <LayoutDashboard className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                            {auth.user.role === 'admin' ? 'Administrator' : 'Penjual UMKM'}
                        </span>
                    </div>
                </div>

                {/* Click to upload prompt */}
                {auth.user.role !== 'admin' && !auth.user.avatar_path && (
                    <button
                        onClick={handleAvatarClick}
                        className="mt-4 w-full bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 backdrop-blur-sm"
                    >
                        <p className="text-xs text-amber-300 text-center font-medium">
                            ⚠️ Upload foto profil Anda untuk menggunakan AI Content Generator
                        </p>
                    </button>
                )}

                {/* Info: foto dipakai untuk AI (only for sellers who already have photo) */}
                {auth.user.role !== 'admin' && auth.user.avatar_path && (
                    <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <p className="text-xs text-white/50 text-center">
                            💡 Foto profil Anda akan digunakan sebagai bahan untuk AI Content Generator. Klik foto untuk mengganti.
                        </p>
                    </div>
                )}
            </div>

            {/* Admin Panel Link */}
            {auth.user.role === 'admin' && (
                <div className="px-4 -mt-3 mb-2">
                    <Link
                        href="/admin/dashboard"
                        className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-center text-white font-bold shadow-lg shadow-blue-500/25"
                    >
                        <LayoutDashboard className="w-5 h-5 inline mr-2" />
                        Buka Admin Panel
                    </Link>
                </div>
            )}

            {/* Menu Items */}
            <div className="px-4 py-6 space-y-2">
                <button
                    onClick={() => router.visit('/settings/profile')}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Pengaturan Profil</p>
                        <p className="text-xs text-muted-foreground">Ubah nama, email, password</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Pengaturan Toko */}
                <button
                    onClick={() => router.visit('/umkm/setup-toko')}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <Store className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Pengaturan Toko</p>
                        <p className="text-xs text-muted-foreground">Ubah nama toko, alamat, kontak</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Admin Contact */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-1">Bantuan & Support</p>
                            <p className="text-xs text-green-700 mb-2">Ada masalah atau pertanyaan? Hubungi admin kami:</p>
                            <a
                                href="https://wa.me/6287827718245"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Chat Admin (087827718245)
                            </a>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-destructive/10 rounded-xl p-4 border border-destructive/20 flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-destructive">Keluar</p>
                        <p className="text-xs text-muted-foreground">Logout dari akun</p>
                    </div>
                </button>
            </div>

            {/* App Info */}
            <div className="px-4 py-4 text-center">
                <p className="text-xs text-muted-foreground">MudaPreneur.AI v2.0.0</p>
                <p className="text-xs text-muted-foreground">AI Content Generator untuk UMKM</p>
            </div>
        </AppLayout>
    );
}
