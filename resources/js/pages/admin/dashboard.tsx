import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    ShoppingCart,
    DollarSign,
    Store,
    MessageSquare,
    Wallet,
    Truck,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Bot,
    Settings,
    Sparkles
} from 'lucide-react';

interface UserStats {
    total: number;
    buyers: number;
    umkm: number;
    couriers: number;
    affiliators: number;
    admins: number;
}

interface OrderStats {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalRevenue: number;
    thisMonthRevenue: number;
}

interface StoreStats {
    total: number;
    active: number;
}

interface RecentOrder {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    store?: { name: string };
    buyer?: { name: string };
}

interface ChartData {
    date: string;
    count: number;
    revenue: number;
}

interface Props {
    userStats: UserStats;
    orderStats: OrderStats;
    storeStats: StoreStats;
    pendingComplaints: number;
    pendingWithdrawals: number;
    pendingWithdrawalAmount: number;
    activeCouriers: number;
    recentOrders: RecentOrder[];
    ordersChart: ChartData[];
}

export default function AdminDashboard({
    userStats,
    orderStats,
    storeStats,
    pendingComplaints,
    pendingWithdrawals,
    pendingWithdrawalAmount,
    activeCouriers,
    recentOrders,
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Users */}
                <div className="bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            Total
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{userStats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Pengguna Terdaftar</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                            {userStats.buyers} Buyer
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                            {userStats.umkm} UMKM
                        </span>
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">
                            {userStats.couriers} Kurir
                        </span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-green-100">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs">Bulan Ini</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(Number(orderStats.totalRevenue))}</p>
                    <p className="text-sm text-white/80 mt-1">Total Pendapatan</p>
                    <p className="text-sm text-white/60 mt-2">
                        Bulan ini: {formatCurrency(Number(orderStats.thisMonthRevenue))}
                    </p>
                </div>

                {/* Total Orders */}
                <div className="bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{orderStats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Pesanan</p>
                    <div className="flex gap-2 mt-3">
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" />
                            {orderStats.completed} Selesai
                        </span>
                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded">
                            {orderStats.pending} Proses
                        </span>
                    </div>
                </div>

                {/* Active Stores */}
                <div className="bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Store className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{storeStats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">Toko UMKM</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {storeStats.active} aktif bulan ini
                    </p>
                </div>
            </div>

            {/* KPI Cards Row 2 - Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Pending Complaints */}
                <Link href="/admin/complaints?status=pending" className="block">
                    <div className={`rounded-2xl p-5 border-2 transition-all hover:shadow-lg ${pendingComplaints > 0 ? 'bg-red-50 border-red-200' : 'bg-card border-border'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingComplaints > 0 ? 'bg-red-100' : 'bg-muted'}`}>
                                <MessageSquare className={`w-6 h-6 ${pendingComplaints > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${pendingComplaints > 0 ? 'text-red-600' : 'text-foreground'}`}>
                                    {pendingComplaints}
                                </p>
                                <p className="text-sm text-muted-foreground">Keluhan Menunggu</p>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Pending Withdrawals */}
                <Link href="/admin/withdrawals?status=pending" className="block">
                    <div className={`rounded-2xl p-5 border-2 transition-all hover:shadow-lg ${pendingWithdrawals > 0 ? 'bg-amber-50 border-amber-200' : 'bg-card border-border'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingWithdrawals > 0 ? 'bg-amber-100' : 'bg-muted'}`}>
                                <Wallet className={`w-6 h-6 ${pendingWithdrawals > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${pendingWithdrawals > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                                    {pendingWithdrawals}
                                </p>
                                <p className="text-sm text-muted-foreground">Penarikan Menunggu</p>
                                {pendingWithdrawals > 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Total: {formatCurrency(Number(pendingWithdrawalAmount))}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Active Couriers */}
                <div className="bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{activeCouriers}</p>
                            <p className="text-sm text-muted-foreground">Kurir Aktif</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI & Settings Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* AI Assistant */}
                <Link href="/admin/ai-assistant" className="block">
                    <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-xl transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Bot className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold">Asisten AI Admin</p>
                                    <Sparkles className="w-4 h-4 text-yellow-300" />
                                </div>
                                <p className="text-sm text-white/80">Brainstorming strategi UMKM & panduan website</p>
                            </div>
                            <ArrowUpRight className="w-6 h-6 text-white/60" />
                        </div>
                    </div>
                </Link>

                {/* API Settings */}
                <Link href="/admin/settings/api" className="block">
                    <div className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Settings className="w-7 h-7 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-foreground">Pengaturan API AI</p>
                                <p className="text-sm text-muted-foreground">Kelola API key untuk fitur AI</p>
                            </div>
                            <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border border-border">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-bold text-foreground">Pesanan Terbaru</h2>
                    </div>
                    <Link
                        href="/admin/orders"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        Lihat Semua
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-border">
                    {recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Belum ada pesanan
                        </div>
                    ) : (
                        recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.store?.name} → {order.buyer?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(Number(order.total_amount))}
                                    </p>
                                    {getStatusBadge(order.status)}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
