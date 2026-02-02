import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import {
    Film,
    Image,
    FileText,
    Users,
    Store,
    ShoppingCart,
    TrendingUp,
    Layout,
    Award,
    Download,
    MessageSquare,
    Wallet,
    UserCheck,
    Sparkles,
    Calendar,
    Clock,
    Truck,
} from 'lucide-react';

interface Props {
    platformSummary: {
        app_name: string;
        competition: string;
        report_date: string;
        report_time: string;
        total_users: number;
        total_umkm: number;
        total_transactions: number;
        total_ai_content: number;
        total_landing_pages: number;
    };
    aiVideoStats: { total: number; completed: number; generating: number; failed: number };
    aiPosterStats: { total: number; completed: number; generating: number; failed: number };
    aiCopywritingStats: number;
    recentAIContent: Array<{
        id: number;
        type: string;
        status: string;
        user_name: string;
        store_name: string;
        created_at: string;
    }>;
    userStats: {
        total: number;
        buyers: number;
        umkm: number;
        couriers: number;
        affiliators: number;
        admins: number;
        active_couriers: number;
        this_week: number;
        this_month: number;
    };
    storeStats: {
        total: number;
        with_products: number;
        with_orders: number;
        total_products: number;
        avg_products_per_store: number;
    };
    topStores: Array<{
        id: number;
        name: string;
        owner: string;
        orders_count: number;
        total_revenue: number;
        products_count: number;
    }>;
    landingPageStats: {
        total: number;
        published: number;
        with_products: number;
    };
    landingByTemplate: Array<{ template: string; count: number }>;
    orderStats: {
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
        total_revenue: number;
        this_week_revenue: number;
        this_month_revenue: number;
        avg_order_value: number;
    };
    affiliateStats: {
        total_affiliators: number;
        total_rewards: number;
        pending_rewards: number;
        paid_rewards: number;
    };
    complaintStats: { total: number; pending: number; resolved: number };
    withdrawalStats: {
        total_requests: number;
        pending: number;
        approved: number;
        total_amount: number;
    };
    growthChart: any;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function StatCard({ icon: Icon, label, value, sublabel, color = 'violet' }: {
    icon: any;
    label: string;
    value: string | number;
    sublabel?: string;
    color?: string;
}) {
    const colors: Record<string, string> = {
        violet: 'from-violet-500 to-purple-600',
        blue: 'from-blue-500 to-cyan-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-amber-600',
        pink: 'from-pink-500 to-rose-600',
        gray: 'from-gray-500 to-slate-600',
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                    {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-100 rounded-lg">
                <Icon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
                <h2 className="font-bold text-gray-800">{title}</h2>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}

export default function InnovvillageReports({
    platformSummary,
    aiVideoStats,
    aiPosterStats,
    aiCopywritingStats,
    recentAIContent,
    userStats,
    storeStats,
    topStores,
    landingPageStats,
    landingByTemplate,
    orderStats,
    affiliateStats,
    complaintStats,
    withdrawalStats,
}: Props) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout title="Laporan Innovillage">
            <Head title="Laporan Innovillage 2025" />

            <div className="space-y-6 print:space-y-4">
                {/* Report Header */}
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white print:bg-violet-600">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-8 h-8" />
                                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                                    {platformSummary.competition}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold mb-1">{platformSummary.app_name}</h1>
                            <p className="text-white/70 text-sm">Laporan Komprehensif Platform untuk Juri</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
                                <Calendar className="w-4 h-4" />
                                {platformSummary.report_date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                                <Clock className="w-4 h-4" />
                                {platformSummary.report_time} WIB
                            </div>
                            <button
                                onClick={handlePrint}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors print:hidden"
                            >
                                <Download className="w-4 h-4" />
                                Print / Export
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{platformSummary.total_users}</p>
                            <p className="text-xs text-white/70">Total Pengguna</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{platformSummary.total_umkm}</p>
                            <p className="text-xs text-white/70">UMKM Terdaftar</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{platformSummary.total_transactions}</p>
                            <p className="text-xs text-white/70">Total Transaksi</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{platformSummary.total_ai_content}</p>
                            <p className="text-xs text-white/70">Konten AI Dibuat</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{platformSummary.total_landing_pages}</p>
                            <p className="text-xs text-white/70">Landing Pages</p>
                        </div>
                    </div>
                </div>

                {/* AI Content Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <SectionTitle icon={Sparkles} title="Fitur AI Content Generator" subtitle="Statistik penggunaan fitur AI untuk UMKM" />

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <StatCard icon={Film} label="Video AI" value={aiVideoStats.total} sublabel={`${aiVideoStats.completed} selesai`} color="violet" />
                        <StatCard icon={Image} label="Poster AI" value={aiPosterStats.total} sublabel={`${aiPosterStats.completed} selesai`} color="pink" />
                        <StatCard icon={FileText} label="Caption Generator" value={aiCopywritingStats} color="orange" />
                    </div>

                    {/* AI Content Detail Table */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Detail Status Konten AI</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Video AI</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>✅ Selesai</span><span className="font-semibold text-green-600">{aiVideoStats.completed}</span></div>
                                    <div className="flex justify-between"><span>⏳ Proses</span><span className="font-semibold text-yellow-600">{aiVideoStats.generating}</span></div>
                                    <div className="flex justify-between"><span>❌ Gagal</span><span className="font-semibold text-red-600">{aiVideoStats.failed}</span></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Poster AI</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>✅ Selesai</span><span className="font-semibold text-green-600">{aiPosterStats.completed}</span></div>
                                    <div className="flex justify-between"><span>⏳ Proses</span><span className="font-semibold text-yellow-600">{aiPosterStats.generating}</span></div>
                                    <div className="flex justify-between"><span>❌ Gagal</span><span className="font-semibold text-red-600">{aiPosterStats.failed}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users & UMKM Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Users */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={Users} title="Statistik Pengguna" subtitle="Distribusi pengguna berdasarkan role" />
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard icon={Users} label="Total User" value={userStats.total} color="violet" />
                            <StatCard icon={Store} label="UMKM" value={userStats.umkm} color="green" />
                            <StatCard icon={Users} label="Pembeli" value={userStats.buyers} color="blue" />
                            <StatCard icon={Truck} label="Kurir" value={userStats.couriers} sublabel={`${userStats.active_couriers} aktif`} color="orange" />
                            <StatCard icon={UserCheck} label="Affiliator" value={userStats.affiliators} color="pink" />
                            <StatCard icon={Users} label="Bulan Ini" value={userStats.this_month} sublabel="Pendaftaran baru" color="gray" />
                        </div>
                    </div>

                    {/* Stores */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={Store} title="Statistik Toko UMKM" subtitle="Performa toko dan produk" />
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard icon={Store} label="Total Toko" value={storeStats.total} color="green" />
                            <StatCard icon={Store} label="Punya Produk" value={storeStats.with_products} color="blue" />
                            <StatCard icon={ShoppingCart} label="Punya Order" value={storeStats.with_orders} color="orange" />
                            <StatCard icon={Store} label="Total Produk" value={storeStats.total_products} color="violet" />
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">
                                Rata-rata <span className="font-bold text-violet-600">{storeStats.avg_products_per_store}</span> produk per toko
                            </p>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <SectionTitle icon={ShoppingCart} title="Statistik Transaksi" subtitle="Performa penjualan marketplace" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <StatCard icon={ShoppingCart} label="Total Pesanan" value={orderStats.total} color="violet" />
                        <StatCard icon={TrendingUp} label="Selesai" value={orderStats.completed} color="green" />
                        <StatCard icon={Clock} label="Pending" value={orderStats.pending} color="orange" />
                        <StatCard icon={ShoppingCart} label="Dibatalkan" value={orderStats.cancelled} color="gray" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-600 font-medium">Total Revenue</p>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(orderStats.total_revenue)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs text-blue-600 font-medium">Minggu Ini</p>
                            <p className="text-lg font-bold text-blue-700">{formatCurrency(orderStats.this_week_revenue)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
                            <p className="text-xs text-violet-600 font-medium">Bulan Ini</p>
                            <p className="text-lg font-bold text-violet-700">{formatCurrency(orderStats.this_month_revenue)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                            <p className="text-xs text-orange-600 font-medium">Rata-rata Order</p>
                            <p className="text-lg font-bold text-orange-700">{formatCurrency(orderStats.avg_order_value)}</p>
                        </div>
                    </div>
                </div>

                {/* Landing Pages Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <SectionTitle icon={Layout} title="Landing Page UMKM" subtitle="Halaman promosi yang dibuat UMKM" />
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <StatCard icon={Layout} label="Total" value={landingPageStats.total} color="violet" />
                        <StatCard icon={Layout} label="Published" value={landingPageStats.published} color="green" />
                        <StatCard icon={Layout} label="Dengan Produk" value={landingPageStats.with_products} color="blue" />
                    </div>
                    {landingByTemplate.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Template yang Digunakan</h3>
                            <div className="flex flex-wrap gap-2">
                                {landingByTemplate.map((item, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white rounded-lg text-sm border border-gray-200">
                                        {item.template || 'Default'}: <span className="font-bold text-violet-600">{item.count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Affiliates */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={UserCheck} title="Program Afiliasi" />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Total Affiliator</span>
                                <span className="font-bold text-violet-600">{affiliateStats.total_affiliators}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-600">Total Reward</span>
                                <span className="font-bold text-green-600">{formatCurrency(affiliateStats.total_rewards)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-sm text-gray-600">Pending</span>
                                <span className="font-bold text-yellow-600">{formatCurrency(affiliateStats.pending_rewards)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Complaints */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={MessageSquare} title="Keluhan Pelanggan" />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Total Keluhan</span>
                                <span className="font-bold">{complaintStats.total}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="text-sm text-gray-600">Menunggu</span>
                                <span className="font-bold text-yellow-600">{complaintStats.pending}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-600">Diselesaikan</span>
                                <span className="font-bold text-green-600">{complaintStats.resolved}</span>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawals */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={Wallet} title="Penarikan Dana" />
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Total Request</span>
                                <span className="font-bold">{withdrawalStats.total_requests}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-600">Diproses</span>
                                <span className="font-bold text-green-600">{withdrawalStats.approved}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg">
                                <span className="text-sm text-gray-600">Total Dicairkan</span>
                                <span className="font-bold text-violet-600">{formatCurrency(withdrawalStats.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Stores Table */}
                {topStores.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={Award} title="Top 10 Toko UMKM" subtitle="Berdasarkan jumlah pesanan" />
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 rounded-l-lg">#</th>
                                        <th className="text-left p-3">Nama Toko</th>
                                        <th className="text-left p-3">Pemilik</th>
                                        <th className="text-center p-3">Produk</th>
                                        <th className="text-center p-3">Pesanan</th>
                                        <th className="text-right p-3 rounded-r-lg">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStores.map((store, idx) => (
                                        <tr key={store.id} className="border-b border-gray-100">
                                            <td className="p-3 font-bold text-violet-600">{idx + 1}</td>
                                            <td className="p-3 font-medium">{store.name}</td>
                                            <td className="p-3 text-gray-500">{store.owner}</td>
                                            <td className="p-3 text-center">{store.products_count}</td>
                                            <td className="p-3 text-center font-semibold">{store.orders_count}</td>
                                            <td className="p-3 text-right font-semibold text-green-600">{formatCurrency(store.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent AI Content Table */}
                {recentAIContent.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <SectionTitle icon={Sparkles} title="Konten AI Terbaru" subtitle="20 konten AI terakhir yang dibuat" />
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3 rounded-l-lg">Tipe</th>
                                        <th className="text-left p-3">Status</th>
                                        <th className="text-left p-3">User</th>
                                        <th className="text-left p-3">Toko</th>
                                        <th className="text-right p-3 rounded-r-lg">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAIContent.map((content) => (
                                        <tr key={content.id} className="border-b border-gray-100">
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${content.type === 'video' ? 'bg-violet-100 text-violet-700' :
                                                    content.type === 'poster' ? 'bg-pink-100 text-pink-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {content.type}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${content.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    ['generating', 'waiting', 'queuing'].includes(content.status) ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {content.status}
                                                </span>
                                            </td>
                                            <td className="p-3">{content.user_name}</td>
                                            <td className="p-3 text-gray-500">{content.store_name}</td>
                                            <td className="p-3 text-right text-gray-500">{content.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-6 text-sm text-gray-400 print:py-2">
                    <p>Laporan ini digenerate otomatis oleh sistem {platformSummary.app_name}</p>
                    <p className="mt-1">Powered by UMKMCipadung | {platformSummary.competition}</p>
                </div>
            </div>
        </AdminLayout>
    );
}
