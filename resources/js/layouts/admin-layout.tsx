import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Store,
    ShoppingCart,
    MessageSquare,
    UserCheck,
    Wallet,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Database,
    Truck, // Added Truck Icon
    Ticket,
    Settings,
    Image
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: Props) {
    const { auth } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(true); // Always show sidebar on desktop
            } else {
                setSidebarOpen(false); // Hide on mobile by default
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const currentPath = window.location.pathname;

    const navCategories = [
        {
            title: 'Overview',
            items: [
                { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: 'Pengguna & Mitra',
            items: [
                { href: '/admin/users', label: 'Pengguna', icon: Users },
                { href: '/admin/stores', label: 'Toko UMKM', icon: Store },
                { href: '/admin/couriers', label: 'Kurir', icon: Truck },
                { href: '/admin/affiliates', label: 'Affiliator', icon: UserCheck },
            ]
        },
        {
            title: 'Transaksi',
            items: [
                { href: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
                { href: '/admin/withdrawals', label: 'Penarikan', icon: Wallet },
                { href: '/admin/complaints', label: 'Keluhan', icon: MessageSquare },
            ]
        },
        {
            title: 'Konfigurasi',
            items: [
                { href: '/admin/promos', label: 'Kode Promo', icon: Ticket },
                { href: '/admin/service-fees', label: 'Biaya Layanan', icon: Ticket },
                { href: '/admin/database', label: 'Database', icon: Database },
                { href: '/admin/poster-templates', label: 'Template Poster', icon: Image },
                { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
            ]
        },
        {
            title: 'Pelaporan',
            items: [
                { href: '/admin/innovillage-reports', label: 'Laporan Innovillage', icon: LayoutDashboard },
            ]
        },
    ];

    const handleNavClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted">
            {/* Mobile Overlay */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                id="admin-sidebar"
                className={`fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-transform duration-300 w-72
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:w-64 flex flex-col print:hidden`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-foreground">Admin</span>
                    </Link>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden p-2 hover:bg-muted rounded-lg"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {navCategories.map((category, idx) => (
                        <div key={idx}>
                            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {category.title}
                            </h3>
                            <div className="space-y-1">
                                {category.items.map((item) => {
                                    const isActive = currentPath.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleNavClick}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            <item.icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{item.label}</span>
                                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-border bg-card flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{auth.user.name}</p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-3 w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Keluar</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main id="admin-main" className="md:ml-64 min-h-screen print:ml-0 print:w-full print:p-0">
                {/* Header */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-30 print:hidden">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6 text-foreground" />
                    </button>

                    {/* Desktop spacer */}
                    <div className="hidden md:block w-10" />

                    <h1 className="font-bold text-lg text-foreground flex-1 text-center md:text-left md:flex-none">{title}</h1>

                    <div className="w-10" />
                </header>

                <div className="p-4 md:p-6">
                    {children}

                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground opacity-70">
                            Powered by UMKMCipadung
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
