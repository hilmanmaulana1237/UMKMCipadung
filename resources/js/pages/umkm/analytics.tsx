import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, ShoppingBag, DollarSign, Package, MessageSquare, Image, Video, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface SalesStats {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    dailySales: Array<{ date: string; revenue: number; orders: number }>;
    monthlySales: Array<{ month: string; revenue: number; orders: number }>;
}

interface AIStats {
    chatSessions: number;
    messages: number;
    totalGenerated: number;
    postersGenerated: number;
    videoScriptsGenerated: number;
}

interface TopProduct {
    name: string;
    total_sold: number;
    total_revenue: number;
}

interface Props {
    store: {
        id: number;
        name: string;
    };
    salesStats: SalesStats;
    aiStats: AIStats;
    topProducts: TopProduct[];
}

export default function Analytics({ store, salesStats, aiStats, topProducts }: Props) {
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

    const chartData = viewMode === 'daily' ? salesStats.dailySales : salesStats.monthlySales;

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

    // Pagination Logic
    const [page, setPage] = useState(0);
    const itemsPerPage = 5;

    // Calculate indices for reverse pagination (showing latest first)
    // Page 0: Latest 5 items (End of array)
    const startIndex = Math.max(0, chartData.length - (page + 1) * itemsPerPage);
    const endIndex = Math.max(0, chartData.length - page * itemsPerPage);
    const displayedData = chartData.slice(startIndex, endIndex);

    return (
        <AppLayout activeTab="orders">
            <Head title="Statistik & Analitik" />

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pt-6 pb-8">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/umkm/orders" className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Statistik & Analitik</h1>
                    <div className="w-9 h-9" />
                </div>

                <div className="text-center text-white">
                    <p className="text-white/80 text-sm">{store.name}</p>
                </div>
            </div>

            <div className="px-4 -mt-4 pb-24 space-y-5">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">Rp {salesStats.totalRevenue.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Total Pendapatan</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{salesStats.totalOrders}</p>
                        <p className="text-xs text-gray-500">Total Pesanan</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">Rp {Math.round(salesStats.avgOrderValue).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-gray-500">Rata-rata Pesanan</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
                        <p className="text-xs text-gray-500">Periode Data</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Grafik Penjualan</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setViewMode('daily'); setPage(0); }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'daily'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Harian
                            </button>
                            <button
                                onClick={() => { setViewMode('monthly'); setPage(0); }}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'monthly'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Bulanan
                            </button>
                        </div>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="space-y-4">
                            {/* Chart Bars */}
                            <div className="space-y-3">
                                {displayedData.map((data, idx) => {
                                    const percentage = (data.revenue / maxRevenue) * 100;
                                    const label = viewMode === 'daily'
                                        ? ('date' in data ? new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '')
                                        : ('month' in data ? data.month : '');

                                    return (
                                        <div key={idx} className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600 font-medium">{label}</span>
                                                <span className="font-semibold text-gray-900">
                                                    Rp {data.revenue.toLocaleString('id-ID')}
                                                    <span className="text-gray-400 font-normal ml-1">({data.orders} order)</span>
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden border border-gray-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === displayedData.length - 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-blue-300 to-indigo-400'
                                                        }`}
                                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {chartData.length > itemsPerPage && (
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={endIndex <= itemsPerPage}
                                        className={`text-xs flex items-center gap-1 font-medium ${endIndex <= itemsPerPage ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                                            }`}
                                    >
                                        ← Sebelumnya
                                    </button>
                                    <span className="text-[10px] text-gray-400">
                                        Hal {page + 1}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className={`text-xs flex items-center gap-1 font-medium ${page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                                            }`}
                                    >
                                        Terbaru →
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="w-5 h-5 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">Belum ada data penjualan</p>
                        </div>
                    )}
                </div>

                {/* AI Usage Stats */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Penggunaan AI Tools</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Chat dengan Si Mudapreneur</p>
                                        <p className="text-xs text-gray-500">{aiStats.messages} pesan terkirim</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{aiStats.chatSessions}</p>
                                    <p className="text-xs text-gray-500">sesi</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                        <Image className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Poster Promosi</p>
                                        <p className="text-xs text-gray-500">Dibuat dengan AI</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{aiStats.postersGenerated}</p>
                                    <p className="text-xs text-gray-500">poster</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Video Script</p>
                                        <p className="text-xs text-gray-500">TikTok/Reels</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{aiStats.videoScriptsGenerated}</p>
                                    <p className="text-xs text-gray-500">script</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                {topProducts.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Produk Terlaris</h3>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                            {topProducts.map((product, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">#{idx + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.total_sold} terjual</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        Rp {product.total_revenue.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
