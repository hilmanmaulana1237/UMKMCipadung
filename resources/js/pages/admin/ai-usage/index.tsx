import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { BarChart3, Video, Image, HardDrive, Store, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface StoreAIData {
    store_id: number;
    store_name: string;
    owner_name: string;
    owner_email: string;
    category: string;
    video_total: number;
    video_completed: number;
    poster_total: number;
    poster_completed: number;
    total_size: number;
    last_activity: string | null;
}

interface Summary {
    totalVideos: number;
    completedVideos: number;
    totalPosters: number;
    completedPosters: number;
    totalStoresUsing: number;
}

interface Props {
    stores: StoreAIData[];
    summary: Summary;
}

export default function AIUsage({ stores, summary }: Props) {
    const [expandedStore, setExpandedStore] = useState<number | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryBadge = (cat: string) => {
        const colors: Record<string, string> = {
            kuliner: 'bg-orange-100 text-orange-700',
            kriya: 'bg-purple-100 text-purple-700',
            jasa: 'bg-blue-100 text-blue-700',
        };
        return colors[cat] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AdminLayout title="Penggunaan AI">
            <Head title="Penggunaan AI - Admin" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-card rounded-2xl p-5 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Video className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Video</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{summary.completedVideos}</p>
                        <p className="text-xs text-muted-foreground mt-1">dari {summary.totalVideos} total</p>
                    </div>

                    <div className="bg-card rounded-2xl p-5 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <Image className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Poster</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{summary.completedPosters}</p>
                        <p className="text-xs text-muted-foreground mt-1">dari {summary.totalPosters} total</p>
                    </div>

                    <div className="bg-card rounded-2xl p-5 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <Store className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Toko Aktif AI</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{summary.totalStoresUsing}</p>
                        <p className="text-xs text-muted-foreground mt-1">menggunakan fitur AI</p>
                    </div>

                    <div className="bg-card rounded-2xl p-5 border border-border col-span-2 md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <BarChart3 className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Generasi AI</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {summary.completedVideos + summary.completedPosters}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            video + poster berhasil dibuat
                        </p>
                    </div>
                </div>

                {/* Store Table */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-5 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Penggunaan AI per Toko
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Data generasi video dan poster oleh setiap toko UMKM
                        </p>
                    </div>

                    {stores.length === 0 ? (
                        <div className="p-12 text-center">
                            <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Belum ada toko yang menggunakan fitur AI</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Toko</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pemilik</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Video</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Poster</th>
                                        <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Ukuran File</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Aktivitas Terakhir</th>
                                        <th className="px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stores.map((store) => (
                                        <tr
                                            key={store.store_id}
                                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setExpandedStore(expandedStore === store.store_id ? null : store.store_id)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Store className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground text-sm">{store.store_name}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryBadge(store.category)}`}>
                                                            {store.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-foreground">{store.owner_name}</p>
                                                <p className="text-xs text-muted-foreground">{store.owner_email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                                                    <Video className="w-3.5 h-3.5" />
                                                    <span className="font-semibold text-sm">{store.video_completed}</span>
                                                    <span className="text-xs text-blue-500">/ {store.video_total}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                                                    <Image className="w-3.5 h-3.5" />
                                                    <span className="font-semibold text-sm">{store.poster_completed}</span>
                                                    <span className="text-xs text-green-500">/ {store.poster_total}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                    <HardDrive className="w-3.5 h-3.5" />
                                                    <span className="text-sm font-medium">{formatSize(store.total_size)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{formatDate(store.last_activity)}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {expandedStore === store.store_id
                                                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
