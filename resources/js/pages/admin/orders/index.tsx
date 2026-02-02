import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Order } from '@/types';
import { ShoppingCart, Search, Clock, ChevronRight, Store, User } from 'lucide-react';
import { useState } from 'react';

interface Props {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function AdminOrders({ orders, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const formatCurrency = (amount: number) => `Rp ${Number(amount).toLocaleString('id-ID')}`;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            waiting_verification: 'bg-amber-100 text-amber-700',
            processing: 'bg-blue-100 text-blue-700',
            ready_to_ship: 'bg-purple-100 text-purple-700',
            on_delivery: 'bg-indigo-100 text-indigo-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            waiting_verification: 'Verifikasi',
            processing: 'Diproses',
            ready_to_ship: 'Siap Kirim',
            on_delivery: 'Diantar',
            completed: 'Selesai',
            cancelled: 'Batal',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const statusOptions = [
        { value: '', label: 'Semua' },
        { value: 'waiting_verification', label: 'Verifikasi' },
        { value: 'processing', label: 'Diproses' },
        { value: 'ready_to_ship', label: 'Siap Kirim' },
        { value: 'on_delivery', label: 'Diantar' },
        { value: 'completed', label: 'Selesai' },
        { value: 'cancelled', label: 'Batal' },
    ];

    return (
        <AdminLayout title="Pesanan">
            <Head title="Manajemen Pesanan" />

            {/* Search & Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-4">
                <form className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Cari nomor pesanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm"
                        />
                    </div>

                    {/* Status Filter - Scrollable pills */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                        {statusOptions.map((opt) => (
                            <Link
                                key={opt.value}
                                href={`/admin/orders${opt.value ? `?status=${opt.value}` : ''}${searchQuery ? `${opt.value ? '&' : '?'}search=${searchQuery}` : ''}`}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${(filters.status === opt.value || (!filters.status && opt.value === ''))
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

            {/* Orders List - Card based for mobile */}
            <div className="space-y-3">
                {orders.data.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Tidak ada pesanan</p>
                        <p className="text-sm text-muted-foreground mt-1">Pesanan akan muncul di sini</p>
                    </div>
                ) : (
                    orders.data.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="block bg-card rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <ShoppingCart className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-foreground">{order.order_number}</span>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        {/* Store & Buyer */}
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Store className="w-3.5 h-3.5" />
                                                <span className="truncate">{order.store?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="w-3.5 h-3.5" />
                                                <span className="truncate">{order.buyer?.name || '-'}</span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Arrow */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-foreground text-lg">
                                        {formatCurrency(order.total_amount)}
                                    </p>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-2" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            {orders.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                    {Array.from({ length: orders.last_page }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/admin/orders?page=${page}${filters.status ? `&status=${filters.status}` : ''}${filters.search ? `&search=${filters.search}` : ''}`}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${page === orders.current_page
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
