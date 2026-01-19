import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, User, CheckCircle, XCircle, Truck, Star, Filter } from 'lucide-react';
import { useState } from 'react';

interface Courier {
    id: number;
    name: string;
    email: string;
    avatar_path: string | null;
    is_courier_active: boolean;
    deliveries_count: number;
    rating: number;
    total_ratings: number;
    created_at: string;
}

interface Props {
    couriers: {
        data: Courier[];
        links: any[];
    };
    filters: {
        search: string;
        status: string;
    };
}

export default function CourierList({ couriers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/couriers', { search, status: statusFilter }, { preserveState: true });
    };

    const handleFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get('/admin/couriers', { search, status }, { preserveState: true });
    };

    return (
        <AdminLayout title="Manajemen Kurir">
            <Head title="Admin - Manajemen Kurir" />

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Truck className="w-6 h-6 text-primary" />
                            Manajemen Kurir
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola data, status, dan kinerja mitra kurir.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau email kurir..."
                            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </form>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFilterChange('')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === ''
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleFilterChange('active')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => handleFilterChange('inactive')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'inactive'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Nonaktif
                        </button>
                    </div>
                </div>

                {/* Courier List */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Kurir</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Total Pengiriman</th>
                                    <th className="px-6 py-3 text-center">Rating</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {couriers.data.length > 0 ? couriers.data.map((courier) => (
                                    <tr key={courier.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-muted rounded-full overflow-hidden flex-shrink-0">
                                                    {courier.avatar_path ? (
                                                        <img src={'/storage/' + courier.avatar_path} alt={courier.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{courier.name}</p>
                                                    <p className="text-xs text-muted-foreground">{courier.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {courier.is_courier_active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <XCircle className="w-3 h-3" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold">{courier.deliveries_count}</span>
                                            <span className="text-xs text-muted-foreground ml-1">Selesai</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="font-bold">{courier.rating.toFixed(1)}</span>
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs text-muted-foreground">({courier.total_ratings})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/couriers/${courier.id}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                                            >
                                                Lihat Detail
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Truck className="w-8 h-8 text-muted-foreground/50" />
                                                <p>Tidak ada data kurir ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Simplified */}
                    {couriers.links.length > 3 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                            <div className="flex gap-1">
                                {couriers.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-md text-sm ${link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-muted'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
