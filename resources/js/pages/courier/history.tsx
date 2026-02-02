import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Order } from '@/types';
import { ArrowLeft, Truck, CheckCircle, XCircle, Calendar, DollarSign, History, Zap, TrendingUp, Bot, Sparkles } from 'lucide-react';

interface Stats {
    totalDeliveries: number;
    totalEarnings: number;
    thisMonthEarnings: number;
}

interface Props {
    deliveries: Order[];
    stats: Stats;
}

export default function CourierHistory({ deliveries, stats }: Props) {
    return (
        <AppLayout activeTab="history" showBottomNav={true}>
            <Head title="Riwayat Pengantaran" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-blue-600 px-4 py-4 flex items-center gap-3">
                <Link href="/courier/radar" className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                    <h1 className="font-bold text-white text-lg">Riwayat Pengantaran</h1>
                    <p className="text-xs text-white/70">Semua pengantaran Anda</p>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4 -mt-2">
                {/* Stats Cards - Premium Design */}
                <div className="bg-gradient-to-br from-success to-emerald-600 rounded-3xl p-5 shadow-xl shadow-success/20">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">Total Pendapatan</p>
                            <p className="text-white font-bold text-2xl">
                                Rp {Number(stats.totalEarnings).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-white/80" />
                                <span className="text-white/70 text-sm">Pengantaran</span>
                            </div>
                            <p className="text-white font-bold text-xl mt-1">{stats.totalDeliveries}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-white/80" />
                                <span className="text-white/70 text-sm">Bulan Ini</span>
                            </div>
                            <p className="text-white font-bold text-lg mt-1">
                                Rp {Number(stats.thisMonthEarnings).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delivery List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Daftar Pengantaran
                        </h2>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {deliveries.length} total
                        </span>
                    </div>

                    {deliveries.length === 0 ? (
                        <div className="bg-card rounded-2xl p-8 border border-border text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">Belum ada riwayat pengantaran</p>
                            <Link
                                href="/courier/radar"
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <Zap className="w-4 h-4" />
                                Cari Pesanan
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {deliveries.map((delivery, index) => (
                                <div
                                    key={delivery.id}
                                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${delivery.courier_status === 'delivered'
                                            ? 'bg-gradient-to-br from-success to-emerald-500'
                                            : 'bg-gradient-to-br from-red-400 to-rose-500'
                                            }`}>
                                            {delivery.courier_status === 'delivered' ? (
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-foreground">
                                                    {delivery.order_number}
                                                </p>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${delivery.courier_status === 'delivered'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {delivery.courier_status === 'delivered' ? '✓ Selesai' : '✕ Batal'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {delivery.store?.name} → {delivery.buyer?.name}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(delivery.updated_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {delivery.courier_status === 'delivered' && (
                                                    <p className="text-sm font-bold text-success flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        +Rp {Number(delivery.courier_fee).toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating AI Insights Button */}
            <Link
                href="/courier/ai-insights"
                className="fixed bottom-32 z-[100] group"
                style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-25" />
                    <div className="relative w-14 h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40 transition-all active:scale-95">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            AI Insights
                        </p>
                        <p className="text-xs text-muted-foreground">Prediksi & Tips</p>
                    </div>
                </div>
            </Link>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
