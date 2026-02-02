import { Link, usePage } from '@inertiajs/react';
import { Settings, ArrowLeft } from 'lucide-react';

interface UmkmHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    backUrl?: string;
    showSettings?: boolean;
    compact?: boolean;
    children?: React.ReactNode;
}

interface PageProps {
    auth: {
        user: {
            name: string;
            store?: {
                name: string;
            };
        };
    };
}

export default function UmkmHeader({
    title,
    subtitle,
    showBack = false,
    backUrl = '/umkm',
    showSettings = true,
    compact = false,
    children
}: UmkmHeaderProps) {
    const { auth } = usePage<PageProps>().props;
    const storeName = auth?.user?.store?.name || auth?.user?.name || 'Toko Saya';

    return (
        <div className={`px-4 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 ${compact ? 'pt-4 pb-4' : 'pt-6 pb-5'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Link href={backUrl} className="p-2 bg-white/15 rounded-xl backdrop-blur-sm -ml-1">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Link>
                    )}
                    <div>
                        {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
                        <h1 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
                            {title || storeName}
                        </h1>
                    </div>
                </div>
                {showSettings && (
                    <Link href="/umkm/store/setup" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                        <Settings className="w-5 h-5 text-white" />
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}
