import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { User } from '@/types';
import { Users, Search, Wallet, ShoppingCart, Truck, UserPlus, ChevronRight, Mail } from 'lucide-react';
import { useState } from 'react';

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
    };
    filters: {
        role?: string;
        search?: string;
    };
}

export default function AdminUsers({ users, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            buyer: 'bg-green-100 text-green-700',
            umkm: 'bg-purple-100 text-purple-700',
            courier: 'bg-orange-100 text-orange-700',
            affiliator: 'bg-blue-100 text-blue-700',
            admin: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            buyer: 'Pembeli',
            umkm: 'UMKM',
            courier: 'Kurir',
            affiliator: 'Affiliator',
            admin: 'Admin',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100'}`}>
                {labels[role] || role}
            </span>
        );
    };

    const roleOptions = [
        { value: '', label: 'Semua' },
        { value: 'buyer', label: 'Pembeli' },
        { value: 'umkm', label: 'UMKM' },
        { value: 'courier', label: 'Kurir' },
        { value: 'affiliator', label: 'Affiliator' },
        { value: 'admin', label: 'Admin' },
    ];

    return (
        <AdminLayout title="Pengguna">
            <Head title="Manajemen Pengguna" />

            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-muted-foreground text-sm">Kelola semua pengguna</p>
                </div>
                <Link
                    href="/admin/users/create"
                    className="px-3 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Tambah</span>
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <form className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm"
                        />
                    </div>

                    {/* Role Filter - Scrollable pills */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                        {roleOptions.map((opt) => (
                            <Link
                                key={opt.value}
                                href={`/admin/users${opt.value ? `?role=${opt.value}` : ''}${searchQuery ? `${opt.value ? '&' : '?'}search=${searchQuery}` : ''}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${(filters.role === opt.value || (!filters.role && opt.value === ''))
                                        ? 'bg-primary text-white'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </form>
            </div>

            {/* Users List - Card based */}
            <div className="space-y-3">
                {users.data.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Tidak ada pengguna</p>
                    </div>
                ) : (
                    users.data.map((user) => (
                        <Link
                            key={user.id}
                            href={`/admin/users/${user.id}`}
                            className="block bg-card rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-foreground truncate">{user.name}</span>
                                        {getRoleBadge(user.role)}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{user.email}</span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Wallet className="w-3 h-3" />
                                            Rp {Number(user.wallet_balance).toLocaleString('id-ID')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ShoppingCart className="w-3 h-3" />
                                            {(user as any).orders_count || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Truck className="w-3 h-3" />
                                            {(user as any).deliveries_count || 0}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            {users.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                    {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/admin/users?page=${page}${filters.role ? `&role=${filters.role}` : ''}${filters.search ? `&search=${filters.search}` : ''}`}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${page === users.current_page
                                    ? 'bg-primary text-white'
                                    : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
