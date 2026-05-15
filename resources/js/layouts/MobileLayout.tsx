import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { BottomNavigation } from '@/components/ui/bottomnavigation';

interface MobileLayoutProps {
    children: ReactNode;
    user?: { id: number; name: string } | null;
    activeTab?: string;
    showBottomNav?: boolean;
}

export default function MobileLayout({
    children,
    user,
    activeTab = 'dashboard',
    showBottomNav = true,
}: MobileLayoutProps) {
    return (
        <div className="bg-slate-200 min-h-screen flex justify-center items-start">
            <main className="w-full max-w-[480px] min-h-screen bg-background relative shadow-2xl flex flex-col font-sans">
                <div className="flex-1 pb-24">
                    {children}

                    <div className="py-6 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">
                            Powered by MudaPreneur.AI
                        </p>
                    </div>
                </div>

                {user && showBottomNav && (
                    <BottomNavigation activeTab={activeTab} />
                )}
            </main>

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
