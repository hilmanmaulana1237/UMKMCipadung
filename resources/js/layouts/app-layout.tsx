import MobileLayout from '@/layouts/MobileLayout';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    activeTab?: string;
    showBottomNav?: boolean;
}

export default function AppLayout({
    children,
    activeTab = 'dashboard',
    showBottomNav = true,
}: AppLayoutProps) {
    const { auth } = usePage().props as {
        auth?: {
            user?: {
                id: number;
                name: string;
            };
        };
    };

    return (
        <MobileLayout
            user={auth?.user}
            activeTab={activeTab}
            showBottomNav={showBottomNav}
        >
            {children}
        </MobileLayout>
    );
}
