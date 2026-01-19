import { Home, ShoppingBag, Store, User, Truck, Share2, Wallet, Search, History, Radar, MapPin, Bot, LayoutDashboard } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface NavItem {
    id: string;
    label: string;
    icon: typeof Home;
    href: string;
}

interface BottomNavigationProps {
    activeTab: string;
    userRole?: 'buyer' | 'umkm' | 'courier' | 'affiliator';
    onTabChange?: (tab: string) => void;
}

// Navigation items based on user role
const getNavItemsForRole = (role: string): NavItem[] => {
    switch (role) {
        case 'buyer':
            return [
                { id: 'marketplace', label: 'Belanja', icon: ShoppingBag, href: '/marketplace' },
                { id: 'history', label: 'Riwayat', icon: History, href: '/history' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
        case 'umkm':
            return [
                { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/umkm/dashboard' },
                { id: 'products', label: 'Produk', icon: Store, href: '/products' },
                { id: 'orders', label: 'Pesanan', icon: ShoppingBag, href: '/umkm/orders' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
        case 'courier':
            return [
                { id: 'radar', label: 'Radar', icon: Radar, href: '/courier/radar' },
                { id: 'active', label: 'Aktif', icon: MapPin, href: '/courier/active' },
                { id: 'wallet', label: 'Dompet', icon: Wallet, href: '/wallet' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
        case 'affiliator':
            return [
                { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/affiliate/dashboard' },
                { id: 'share', label: 'Bagikan', icon: Share2, href: '/affiliate/share' },
                { id: 'wallet', label: 'Dompet', icon: Wallet, href: '/wallet' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
        case 'admin':
            return [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
                { id: 'orders', label: 'Pesanan', icon: ShoppingBag, href: '/admin/orders' },
                { id: 'withdrawals', label: 'Tarik', icon: Wallet, href: '/admin/withdrawals' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
        default:
            return [
                { id: 'home', label: 'Beranda', icon: Home, href: '/' },
                { id: 'marketplace', label: 'Belanja', icon: ShoppingBag, href: '/marketplace' },
                { id: 'account', label: 'Akun', icon: User, href: '/profile' },
            ];
    }
};

export function BottomNavigation({ activeTab, userRole = 'buyer' }: BottomNavigationProps) {
    const tabs = getNavItemsForRole(userRole);

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 pb-safe">
            <div className="px-4 pb-4">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/70 rounded-[28px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/50 ring-1 ring-white/30">
                    <div className="flex items-center justify-around px-2 py-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    preserveScroll
                                    className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors relative rounded-2xl ${isActive ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={2.5}
                                        className={isActive ? 'text-primary' : 'text-slate-400'}
                                    />
                                    <span
                                        className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`}
                                    >
                                        {tab.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

