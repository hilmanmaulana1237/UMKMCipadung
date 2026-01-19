import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { User, Settings, Wallet, LogOut, ChevronRight, ShieldCheck, BarChart3, Store } from 'lucide-react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            wa_number?: string;
            wallet_balance: number;
            affiliate_code?: string;
            umkmStore?: {
                id: number;
                name: string;
            };
        };
    };
    totalRevenue?: number;
    [key: string]: any;
}

export default function ProfileIndex() {
    const { auth, totalRevenue } = usePage<PageProps>().props;

    const handleLogout = () => {
        // Clear AI chat history on logout
        if (typeof window !== 'undefined') {
            localStorage.removeItem('ai_chat_messages');
        }
        router.post('/logout');
    };

    const roleLabels: Record<string, string> = {
        buyer: 'Pembeli',
        umkm: 'UMKM',
        courier: 'Kurir',
        affiliator: 'Affiliator',
    };

    const isUmkm = auth.user.role === 'umkm';
    const displayAmount = isUmkm ? (totalRevenue || 0) : auth.user.wallet_balance;
    const amountLabel = isUmkm ? 'Pendapatan Kamu' : 'Saldo Dompet';

    return (
        <AppLayout activeTab="account">
            <Head title="Profil" />

            {/* Profile Header */}
            <div className="px-4 pt-6 pb-6 bg-gradient-to-br from-primary to-secondary">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{auth.user.name}</h1>
                        <p className="text-white/80 text-sm">{auth.user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                            {roleLabels[auth.user.role] || auth.user.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Wallet/Revenue Card - Only for Courier & Affiliate */}
            {(auth.user.role === 'courier' || auth.user.role === 'affiliator') && (
                <div className="px-4 -mt-4">
                    <div
                        onClick={() => router.visit('/wallet')}
                        className="bg-card rounded-2xl p-4 border border-border shadow-sm cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Saldo Dompet</p>
                                    <p className="text-lg font-bold text-foreground">
                                        Rp {auth.user.wallet_balance.toLocaleString('id-ID')}
                                    </p>
                                    {auth.user.role === 'affiliator' && (
                                        <p className="text-xs text-muted-foreground mt-1">Dari komisi affiliate</p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            )}

            {/* Revenue Card - Only for UMKM */}
            {isUmkm && (
                <div className="px-4 -mt-4">
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pendapatan Kamu</p>
                                <p className="text-lg font-bold text-foreground">
                                    Rp {displayAmount.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Dari penjualan di aplikasi</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div className="px-4 py-6 space-y-2">
                <button
                    onClick={() => router.visit('/settings/profile')}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Pengaturan Profil</p>
                        <p className="text-xs text-muted-foreground">Ubah nama, email, password</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {isUmkm && (
                    <button
                        onClick={() => router.visit('/umkm/setup-toko')}
                        className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <Store className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">Pengaturan Toko</p>
                            <p className="text-xs text-muted-foreground">Lokasi, jam operasional, info</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                )}

                {auth.user.role === 'umkm' && (
                    <button
                        onClick={() => router.visit('/umkm/analytics')}
                        className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                    >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">Statistik & Analitik</p>
                            <p className="text-xs text-muted-foreground">Lihat performa penjualan & AI</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                )}

                {auth.user.role === 'affiliator' && auth.user.affiliate_code && (
                    <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-foreground">Kode Afiliasi</p>
                            <p className="text-lg font-bold text-primary">{auth.user.affiliate_code}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => router.visit('/settings/about')}
                    className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">Tentang Aplikasi</p>
                        <p className="text-xs text-muted-foreground">Informasi Innovillage 2025 & Mitra</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                {/* Admin Contact Info - For All Roles */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-1">Bantuan & Support</p>
                            <p className="text-xs text-green-700 mb-2">
                                {auth.user.role === 'courier' || auth.user.role === 'affiliator'
                                    ? 'Hubungi admin untuk konfirmasi penarikan saldo atau jika ada kendala:'
                                    : 'Ada masalah atau pertanyaan? Hubungi admin kami:'}
                            </p>
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
                <p className="text-xs text-muted-foreground">MUDAPRENEUR.AI v1.0.0</p>
                <p className="text-xs text-muted-foreground">Super App untuk Wirausaha Muda</p>
            </div>
        </AppLayout>
    );
}
