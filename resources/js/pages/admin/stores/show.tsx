import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Store, TrendingUp, ShoppingBag, Star, Package, Clock, MessageSquare, ArrowLeft, ExternalLink, MapPin } from 'lucide-react';

interface Props {
    store: any;
    stats: {
        totalRevenue: number;
        totalOrders: number;
        successRate: number;
        averageRating: number;
    };
    chartData: { label: string; value: number }[];
    topProducts: any[];
    recentOrders: any[];
    reviews: any[];
}

export default function StoreDetail({ store, stats, chartData, topProducts, recentOrders, reviews }: Props) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate max value for chart scaling
    const maxRevenue = Math.max(...chartData.map(d => d.value), 1000);

    return (
        <AdminLayout title={`Detail Toko - ${store.name}`}>
            <Head title={`Admin - ${store.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/stores" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Store className="w-6 h-6 text-primary" />
                                {store.name}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium uppercase tracking-wider">
                                    {store.category || 'UMKM'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {store.address_pickup || 'Alamat tidak tersedia'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={`/store/${store.slug}`}
                            target="_blank"
                            className="bg-muted text-muted-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-muted/80 transition-colors text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Lihat di Marketplace
                        </a>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {formatCurrency(stats.totalRevenue)}
                                </h3>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.totalOrders}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.successRate}%
                                </h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rating Toko</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {Number(stats.averageRating).toFixed(1)}
                                    </h3>
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-6">Tren Pendapatan (6 Bulan Terakhir)</h2>
                        <div className="h-64 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-dashed border-border/50 h-0 flex items-center">
                                        <span className="text-[10px] text-muted-foreground w-8 -mt-5 bg-card px-1">
                                            {formatCurrency(maxRevenue * (4 - i) / 4)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-border h-0"></div>
                            </div>

                            {/* Bars */}
                            <div className="absolute inset-0 flex items-end justify-between gap-2 md:gap-4 pl-10 pb-6 pt-4">
                                {chartData.map((data, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                                        <div className="w-full h-full bg-muted/20 rounded-t-lg relative flex items-end group-hover:bg-muted/40 transition-colors">
                                            <div
                                                className="w-full bg-gradient-to-t from-primary/70 to-primary transition-all duration-1000 ease-out rounded-t-lg relative z-10 group-hover:opacity-90 group-hover:scale-y-[1.02] origin-bottom shadow-md"
                                                style={{ height: `${data.value > 0 ? (data.value / maxRevenue) * 100 : 0}%` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                                                    <div className="bg-popover text-popover-foreground text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl border border-border whitespace-nowrap flex flex-col items-center">
                                                        <span>{formatCurrency(data.value)}</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">{data.label}</span>
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] md:text-xs text-muted-foreground font-medium absolute -bottom-6 w-full text-center truncate px-1">
                                            {data.label.split(' ')[0]} {/* Show partial label to fit */}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Produk Terlaris
                        </h2>
                        <div className="space-y-4">
                            {topProducts.length > 0 ? topProducts.map((product) => (
                                <div key={product.id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        {product.image_path ? (
                                            <img src={'/storage/' + product.image_path} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate" title={product.name}>{product.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold block">{product.sold_count || 0}</span>
                                        <span className="text-xs text-muted-foreground">Terjual</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada produk terjual</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Orders & Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Pesanan Terbaru
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Order ID</th>
                                        <th className="px-6 py-3">Pembeli</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">#{order.order_number}</td>
                                            <td className="px-6 py-4">{order.buyer?.name || 'Guest'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {formatCurrency(order.total_amount)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                Belum ada pesanan terbaru.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Ulasan Terbaru
                            </h2>
                        </div>
                        <div className="p-0">
                            {reviews.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-sm">{review.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground/80 italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    Belum ada ulasan yang masuk.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
