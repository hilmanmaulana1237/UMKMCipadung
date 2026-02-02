import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Order } from '@/types';
import { Package, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

interface Props {
    orders: {
        data: Order[];
        links: any[];
    };
}

const statusLabels: Record<string, { label: string; color: string }> = {
    waiting_verification: { label: 'Menunggu Verifikasi', color: 'text-warning bg-warning/10' },
    processing: { label: 'Diproses', color: 'text-primary bg-primary/10' },
    ready_to_ship: { label: 'Siap Kirim', color: 'text-secondary bg-secondary/10' },
    on_delivery: { label: 'Dalam Pengiriman', color: 'text-primary bg-primary/10' },
    completed: { label: 'Selesai', color: 'text-success bg-success/10' },
    cancelled: { label: 'Dibatalkan', color: 'text-destructive bg-destructive/10' },
};

export default function BuyerHistory({ orders }: Props) {
    return (
        <AppLayout activeTab="history">
            <Head title="Riwayat Pesanan" />

            {/* Header */}
            <div className="px-4 pt-6 pb-4">
                <h1 className="text-xl font-bold text-foreground">Riwayat Pesanan</h1>
                <p className="text-muted-foreground text-sm">Lacak status pesanan Anda</p>
            </div>

            {/* Orders List */}
            <div className="px-4 pb-8">
                {orders.data.length === 0 ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground">Belum ada pesanan</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            Mulai belanja produk UMKM terbaik!
                        </p>
                        <Link
                            href="/marketplace"
                            className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium"
                        >
                            Belanja Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.data.map((order) => {
                            const status = statusLabels[order.status] || { label: order.status, color: 'text-muted-foreground bg-muted' };

                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}/status`}
                                    className="block bg-card rounded-2xl p-4 border border-border"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-foreground">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.store?.name || 'Toko'}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {order.items?.length || 0} item
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">
                                                Rp {order.total_amount.toLocaleString('id-ID')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
