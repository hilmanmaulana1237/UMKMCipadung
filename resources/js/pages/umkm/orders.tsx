import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Order } from '@/types';
import { ChevronRight, Settings, ShoppingBag, Clock, CheckCircle, Package, Truck, BarChart3 } from 'lucide-react';

interface PageProps {
    auth: {
        user: {
            store?: {
                name: string;
            };
        };
    };
    orders: {
        data: Order[];
        links: any[];
    };
    currentStatus: string;
    stats?: {
        waiting: number;
        processing: number;
        ready: number;
        completed: number;
    };
    [key: string]: any;
}

const statusLabels: Record<string, string> = {
    waiting_verification: 'Perlu Verifikasi',
    processing: 'Diproses',
    ready_to_ship: 'Siap Kirim',
    on_delivery: 'Sedang Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

export default function UmkmOrders({ orders, currentStatus, stats }: Omit<PageProps, 'auth'>) {
    const { auth } = usePage<PageProps>().props;
    const storeName = auth?.user?.store?.name || 'Toko Saya';

    const statusFilters = [
        { id: 'waiting_verification', label: 'Verifikasi', icon: Clock, color: 'text-amber-500' },
        { id: 'processing', label: 'Proses', icon: Package, color: 'text-blue-500' },
        { id: 'ready_to_ship', label: 'Siap Kirim', icon: Truck, color: 'text-green-500' },
        { id: 'completed', label: 'Selesai', icon: CheckCircle, color: 'text-emerald-500' },
    ];

    // Count orders by status
    const orderCounts = stats || {
        waiting: orders.data.filter(o => o.status === 'waiting_verification').length,
        processing: orders.data.filter(o => o.status === 'processing').length,
        ready: orders.data.filter(o => o.status === 'ready_to_ship').length,
        completed: orders.data.filter(o => o.status === 'completed').length,
    };

    return (
        <AppLayout activeTab="orders">
            <Head title="Pesanan" />

            {/* Gradient Header */}
            <div className="px-4 pt-6 pb-5 bg-gradient-to-br from-primary via-blue-600 to-indigo-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-white/70 text-xs">Pesanan Masuk</p>
                        <h1 className="text-xl font-bold text-white">{storeName}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/umkm/analytics" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-colors">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </Link>
                        <Link href="/umkm/setup-toko" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-colors">
                            <Settings className="w-5 h-5 text-white" />
                        </Link>
                    </div>
                </div>

                {/* Order Stats in Header */}
                <div className="grid grid-cols-4 gap-2">
                    {statusFilters.map((filter) => {
                        const Icon = filter.icon;
                        const count = filter.id === 'waiting_verification' ? orderCounts.waiting :
                            filter.id === 'processing' ? orderCounts.processing :
                                filter.id === 'ready_to_ship' ? orderCounts.ready :
                                    orderCounts.completed;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => router.get('/umkm/orders', { status: filter.id })}
                                className={`backdrop-blur-sm rounded-xl p-2.5 text-center transition-all ${currentStatus === filter.id
                                    ? 'bg-white/30 ring-2 ring-white/50'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <Icon className="w-4 h-4 text-white mx-auto mb-0.5" />
                                <p className="text-sm font-bold text-white">{count}</p>
                                <p className="text-[9px] text-white/70 leading-tight">{filter.label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List */}
            <div className="px-4 py-4">
                {orders.data.length === 0 ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground mb-1">Tidak ada pesanan</p>
                        <p className="text-sm text-muted-foreground">
                            Status: {statusLabels[currentStatus]}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={`/umkm/orders/${order.id}`}
                                className="block bg-card rounded-2xl p-4 border border-border"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-foreground">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">{order.buyer?.name}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${order.status === 'waiting_verification' ? 'bg-amber-100 text-amber-700' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'ready_to_ship' ? 'bg-green-100 text-green-700' :
                                                order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-gray-100 text-gray-700'
                                        }`}>
                                        {statusLabels[order.status] || order.status}
                                    </span>
                                </div>

                                <div className="text-sm text-muted-foreground mb-2">
                                    {order.items?.length || 0} item • <span className="font-semibold text-foreground">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
