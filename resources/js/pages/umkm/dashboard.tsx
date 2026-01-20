import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { UmkmStore, Order } from '@/types';
import { Settings, ChevronRight, Brain, Loader2, Flame, MessageSquare, ThumbsUp, ThumbsDown, ShoppingBag, Clock, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Stats {
    totalProducts: number;
    activeProducts: number;
    pendingOrders: number;
    processingOrders: number;
    totalRevenue: number;
}

interface AIInsight {
    type: 'warning' | 'alert' | 'success' | 'tip';
    icon: string;
    title: string;
    message: string;
    action: string | null;
    action_url: string | null;
}

interface TrendItem {
    name: string;
    growth: number;
    icon: string;
}

interface ReviewStats {
    positive_count: number;
    negative_count: number;
}

interface Props {
    store: UmkmStore;
    stats: Stats;
    reviewStats: ReviewStats;
    recentOrders: Order[];
}

export default function UmkmDashboard({ store, stats, reviewStats, recentOrders }: Props) {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isLoadingInsights, setIsLoadingInsights] = useState(true);
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(true);
    const [showOpenModal, setShowOpenModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

    useEffect(() => {
        fetchInsights();
        fetchTrends();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await fetch('/ai/insights', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const result = await response.json();
            if (result.success) {
                setInsights(result.insights);
            }
        } catch (error) {
            console.error('Failed to fetch insights:', error);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const response = await fetch('/ai/trending', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const result = await response.json();
            if (result.success) {
                setTrends(result.trends.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        } finally {
            setIsLoadingTrends(false);
        }
    };

    // Calculate sentiment summary message based on review data
    const getSentimentMessage = () => {
        const total = reviewStats.positive_count + reviewStats.negative_count;
        if (total === 0) {
            return '😊 Belum ada review dari pembeli. Berikan pelayanan terbaik untuk mendapatkan review positif!';
        }
        if (reviewStats.positive_count > reviewStats.negative_count) {
            return '😊 Pembeli menyukai produk Anda! Banyak yang bilang produknya bagus.';
        }
        if (reviewStats.positive_count < reviewStats.negative_count) {
            return '😞 Ada beberapa keluhan dari pembeli. Tingkatkan kualitas produk dan pelayanan Anda.';
        }
        return '😐 Pendapat pembeli beragam tentang produk Anda.';
    };

    // Calculate order summary
    const totalPendingOrders = stats.pendingOrders + stats.processingOrders;

    return (
        <AppLayout activeTab="dashboard">
            <Head title="Dashboard UMKM" />

            {/* Clean Header with Revenue */}
            <div className="px-4 pt-6 pb-6 bg-gradient-to-br from-primary via-blue-600 to-indigo-700">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-white/70 text-sm">Selamat datang,</p>
                        <h1 className="text-xl font-bold text-white">{store.name}</h1>
                        {/* Star Rating Moved Below */}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (store.is_open_today) {
                                    // Closing - Simple confirm
                                    // Closing - Show Confirmation Modal
                                    setShowCloseModal(true);
                                } else {
                                    // Opening - Show Motivational Modal
                                    setShowOpenModal(true);
                                }
                            }}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 ${store.is_open_today
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${store.is_open_today ? 'bg-white animate-pulse' : 'bg-white/70'}`} />
                            {store.is_open_today ? 'BUKA' : 'TUTUP'}
                        </button>
                        <Link href="/umkm/setup-toko" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-colors">
                            <Settings className="w-5 h-5 text-white" />
                        </Link>
                    </div>
                </div>

                {/* Operating Hours & Rating Row */}
                <div className="flex flex-wrap items-center gap-3 mt-3 mb-5">
                    {/* Star Rating Display */}
                    {store.average_rating !== undefined && store.total_ratings !== undefined && store.total_ratings > 0 && (
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-3.5 h-3.5 ${s <= Math.round(store.average_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-white font-medium text-xs ml-1">{store.average_rating?.toFixed(1)}</span>
                            <span className="text-white/60 text-[10px]">({store.total_ratings})</span>
                        </div>
                    )}

                    {/* Operating Hours Info */}
                    {store.open_time && store.close_time && (
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 text-white/90 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-white/70" />
                            <span>Jam Operasional: {store.open_time.substring(0, 5)} - {store.close_time.substring(0, 5)}</span>
                        </div>
                    )}
                </div>

                {/* Revenue Display */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs">Total Pendapatan</p>
                            <p className="text-2xl font-bold text-white mt-0.5">
                                Rp {Number(stats.totalRevenue).toLocaleString('id-ID')}
                            </p>
                        </div>
                        {totalPendingOrders > 0 && (
                            <Link
                                href={stats.pendingOrders > 0 ? "/umkm/orders?status=waiting_verification" : "/umkm/orders?status=processing"}
                                className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl"
                            >
                                <div className="relative">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                                        {totalPendingOrders}
                                    </span>
                                </div>
                                <span className="text-white text-sm font-medium">Pesanan</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - Single Column Clean Layout */}
            <div className="px-4 py-5 space-y-5 -mt-2">

                {/* AI Insights - Compact Card */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-foreground">AI Insights</span>
                    </div>

                    {isLoadingInsights ? (
                        <div className="flex items-center gap-2 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            <span className="text-sm text-muted-foreground">Menganalisis...</span>
                        </div>
                    ) : insights.length > 0 ? (
                        <div className="space-y-2">
                            {insights.slice(0, 2).map((insight, index) => (
                                <div key={index} className="flex items-start gap-3 bg-white/60 rounded-xl p-3">
                                    <span className="text-lg">{insight.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{insight.message}</p>
                                    </div>
                                    {insight.action_url && (
                                        <Link href={insight.action_url} className="text-purple-600 text-xs font-medium whitespace-nowrap">
                                            {insight.action} →
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Belum ada insight tersedia</p>
                    )}
                </div>

                {/* AI Tools Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                            <Brain className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-semibold text-foreground">AI Tools MVP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/umkm/ai-mentor" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-2xl">👨‍🏫</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">Business Mentor</h3>
                                <p className="text-xs text-gray-500 mt-1">Konsultasi bisnis 24/7</p>
                            </div>
                        </Link>
                        <Link href="/umkm/ai-content" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2 active:scale-95 transition-transform">
                            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">Content Generator</h3>
                                <p className="text-xs text-gray-500 mt-1">Buat Video & Poster</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Trending - Horizontal Scroll */}
                {!isLoadingTrends && trends.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-semibold text-foreground">Trending di Sekitarmu</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                            {trends.map((trend, index) => (
                                <div key={index} className="flex-shrink-0 bg-card rounded-xl px-4 py-3 border border-border flex items-center gap-2">
                                    <span className="text-xl">{trend.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground whitespace-nowrap">{trend.name}</p>
                                        <p className="text-xs text-green-600">+{trend.growth}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sentiment Summary - Real Data from Reviews */}
                {(reviewStats.positive_count > 0 || reviewStats.negative_count > 0) && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold text-foreground">Sentimen Pembeli</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{getSentimentMessage()}</p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <ThumbsUp className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-600">{reviewStats.positive_count} positif</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ThumbsDown className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium text-red-500">{reviewStats.negative_count} negatif</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Orders - Clean List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-foreground">Pesanan Terbaru</span>
                        <Link href="/umkm/orders" className="text-sm text-primary font-medium">
                            Lihat Semua
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="bg-card rounded-2xl p-6 border border-border text-center">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">Belum ada pesanan</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.slice(0, 4).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/umkm/orders/${order.id}`}
                                    className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.status === 'waiting_verification' ? 'bg-amber-100' :
                                        order.status === 'processing' ? 'bg-blue-100' :
                                            order.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                        {order.status === 'waiting_verification' ? (
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        ) : order.status === 'completed' ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{order.order_number}</p>
                                        <p className="text-xs text-muted-foreground">{order.buyer?.name || 'Pembeli'}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-20" />

            {/* Store Open Motivational Modal */}
            {showOpenModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-t-3xl opacity-20" />

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30 rotate-3">
                                <span className="text-3xl">🚀</span>
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Selamat Pagi, {store.name}!
                            </h3>

                            <p className="text-center text-gray-600 mb-6 leading-relaxed">
                                "Semoga bagus penjualannya hari ini ya! Tetap semangat menebar manfaat."
                            </p>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg shrink-0">
                                        <Brain className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
                                            Saran AI Mentor
                                        </p>
                                        <p className="text-xs text-indigo-600 leading-relaxed">
                                            Jika ada kendala atau butuh strategi penjualan, jangan ragu tanyakan ke <b>Business Mentor AI</b>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowOpenModal(false)}
                                    className="px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Nanti Dulu
                                </button>
                                <button
                                    onClick={() => {
                                        setShowOpenModal(false);
                                        router.post('/umkm/store/toggle-open');
                                    }}
                                    className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 hover:scale-105 transition-transform"
                                >
                                    Buka Toko!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Close Confirmation Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-t-3xl opacity-20" />

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30 -rotate-3">
                                <span className="text-3xl">😴</span>
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Yakin Ingin Tutup?
                            </h3>

                            <p className="text-center text-gray-600 mb-6 leading-relaxed">
                                Toko tidak akan muncul di pencarian pembeli sampai Anda membukanya kembali.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowCloseModal(false)}
                                    className="px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCloseModal(false);
                                        router.post('/umkm/store/toggle-open');
                                    }}
                                    className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-600 shadow-lg shadow-red-500/30 hover:scale-105 transition-transform"
                                >
                                    Tutup Toko
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
