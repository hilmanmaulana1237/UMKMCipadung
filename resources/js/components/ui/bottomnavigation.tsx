import { Home, Sparkles, User } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface NavItem {
    id: string;
    label: string;
    icon: typeof Home;
    href: string;
}

interface BottomNavigationProps {
    activeTab: string;
    userRole?: string;
    onTabChange?: (tab: string) => void;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/umkm/dashboard' },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles, href: '/umkm/ai-content' },
    { id: 'account', label: 'Profil', icon: User, href: '/profile' },
];

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 pb-safe">
            <div className="px-4 pb-4">
                <div className="backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/70 rounded-[28px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/50 ring-1 ring-white/30">
                    <div className="flex items-center justify-around px-2 py-3">
                        {navItems.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    preserveScroll
                                    className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors relative rounded-2xl ${isActive ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={2.5}
                                        className={isActive ? 'text-blue-600' : 'text-slate-400'}
                                    />
                                    <span
                                        className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
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
