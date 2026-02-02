import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { BottomNavigation } from '@/components/ui/bottomnavigation';

interface User {
    id: number;
    name: string;
    role: 'buyer' | 'umkm' | 'courier' | 'affiliator';
}

interface MobileLayoutProps {
    children: ReactNode;
    user?: User | null;
    activeTab?: string;
    showBottomNav?: boolean;
}

export default function MobileLayout({
    children,
    user,
    activeTab = 'home',
    showBottomNav = true,
}: MobileLayoutProps) {
    return (
        <div className="bg-slate-200 min-h-screen flex justify-center items-start">
            {/* PHONE SIMULATOR CONTAINER */}
            {/* PHONE SIMULATOR CONTAINER */}
            <main className="w-full max-w-[480px] min-h-screen bg-background relative shadow-2xl flex flex-col font-sans">
                {/* CONTENT AREA */}
                <div className="flex-1 pb-24">
                    {children}

                    <div className="py-6 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">
                            Powered by UMKMCipadung
                        </p>
                    </div>
                </div>

                {/* PERSISTENT BOTTOM NAV (Only for logged in users) */}
                {user && showBottomNav && (
                    <BottomNavigation
                        activeTab={activeTab}
                        userRole={user.role}
                    />
                )}
            </main>

            {/* Toast notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'white',
                        border: '1px solid #E2E8F0',
                    },
                }}
            />
        </div>
    );
}
