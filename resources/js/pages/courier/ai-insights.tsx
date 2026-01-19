import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bot,
    Sparkles,
    TrendingUp,
    Clock,
    Zap,
    Target,
    Calendar,
    DollarSign,
    BarChart3,
    AlertCircle,
    ChevronRight,
    Trophy,
    Flame
} from 'lucide-react';

interface HourlyData {
    hour: string;
    count: number;
    isPeak: boolean;
}

interface Prediction {
    todayPrediction: number;
    tomorrowPrediction: number;
    weekPrediction: number;
    confidence: number;
    bestDay: string;
    bestDayEarnings: number;
    avgPerDelivery: number;
    currentDay: string;
    message: string;
}

interface PeakTimes {
    peakHours: string[];
    peakDays: string[];
    hourlyData: HourlyData[];
    nextPeakHour: string | null;
    recommendation: string;
}

interface Tip {
    icon: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

interface Stats {
    totalDeliveries: number;
    totalEarnings: number;
    avgPerDelivery: number;
    thisWeekDeliveries: number;
    thisMonthDeliveries: number;
    busiestDay: string;
}

interface Props {
    stats: Stats;
    predictions: Prediction;
    peakTimes: PeakTimes;
    tips: Tip[];
    todayEarnings: number;
    weekEarnings: number;
}

export default function CourierAIInsights({ stats, predictions, peakTimes, tips, todayEarnings, weekEarnings }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-50 border-red-200 text-red-700';
            case 'medium': return 'bg-amber-50 border-amber-200 text-amber-700';
            default: return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    const maxHourlyCount = Math.max(...peakTimes.hourlyData.map(h => h.count), 1);

    return (
        <AppLayout activeTab="radar" showBottomNav={true}>
            <Head title="AI Insights" />

            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 px-4 py-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                        href="/courier/radar"
                        className="p-2 hover:bg-white/20 rounded-full transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white flex items-center gap-2">
                                AI Insights
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                            </h1>
                            <p className="text-white/70 text-xs">Prediksi & Rekomendasi Cerdas</p>
                        </div>
                    </div>
                </div>

                {/* Today's Progress */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white/80 text-sm">Penghasilan Hari Ini</span>
                        <span className="text-xs text-yellow-300 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Target: {formatCurrency(predictions.todayPrediction)}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(todayEarnings)}
                    </p>
                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all"
                            style={{ width: `${Math.min((todayEarnings / predictions.todayPrediction) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-white/60 text-xs mt-2">
                        {Math.round((todayEarnings / predictions.todayPrediction) * 100)}% dari prediksi
                    </p>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">

                {/* AI Prediction Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        <span className="font-bold">AI Earnings Predictor</span>
                        <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {predictions.confidence}% akurat
                        </span>
                    </div>

                    <p className="text-white/80 text-sm mb-4">{predictions.message}</p>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-1">Hari Ini</p>
                            <p className="font-bold text-lg">{formatCurrency(predictions.todayPrediction)}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-1">Besok</p>
                            <p className="font-bold text-lg">{formatCurrency(predictions.tomorrowPrediction)}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-xs mb-1">Minggu Ini</p>
                            <p className="font-bold text-lg">{formatCurrency(predictions.weekPrediction)}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-300" />
                            <span className="text-sm">Hari Terbaik:</span>
                        </div>
                        <span className="font-bold">{predictions.bestDay}</span>
                    </div>
                </div>

                {/* Peak Time Advisor */}
                <div className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-foreground">Peak Time Advisor</span>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                        <p className="text-orange-700 text-sm font-medium">{peakTimes.recommendation}</p>
                    </div>

                    {/* Peak Hours */}
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Jam Tersibuk:</p>
                        <div className="flex flex-wrap gap-2">
                            {peakTimes.peakHours.map((hour, i) => (
                                <span key={i} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    {hour}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Peak Days */}
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Hari Tersibuk:</p>
                        <div className="flex flex-wrap gap-2">
                            {peakTimes.peakDays.map((day, i) => (
                                <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Hourly Chart */}
                    <div className="mb-2">
                        <p className="text-sm text-muted-foreground mb-2">Distribusi Order per Jam:</p>
                        <div className="flex items-end gap-0.5 h-20 overflow-x-auto scrollbar-hide pb-2">
                            {peakTimes.hourlyData.filter((_, i) => i >= 6 && i <= 23).map((data, i) => (
                                <div key={i} className="flex flex-col items-center min-w-[18px]">
                                    <div
                                        className={`w-3 rounded-t transition-all ${data.isPeak ? 'bg-orange-500' : 'bg-slate-300'}`}
                                        style={{ height: `${(data.count / maxHourlyCount) * 60 + 4}px` }}
                                    />
                                    <span className="text-[8px] text-muted-foreground mt-1">{data.hour.split(':')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Tips */}
                <div className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-foreground">AI Delivery Tips</span>
                    </div>

                    <div className="space-y-3">
                        {tips.map((tip, i) => (
                            <div
                                key={i}
                                className={`rounded-xl p-3 border ${getPriorityColor(tip.priority)}`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{tip.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{tip.title}</p>
                                        <p className="text-xs opacity-80 mt-0.5">{tip.message}</p>
                                    </div>
                                    {tip.priority === 'high' && (
                                        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                                            PENTING
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-foreground">Statistik Performa</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 mb-1">Total Pengantaran</p>
                            <p className="font-bold text-xl text-blue-700">{stats.totalDeliveries}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-green-600 mb-1">Total Pendapatan</p>
                            <p className="font-bold text-lg text-green-700">{formatCurrency(stats.totalEarnings)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3">
                            <p className="text-xs text-purple-600 mb-1">Rata-rata/Order</p>
                            <p className="font-bold text-lg text-purple-700">{formatCurrency(stats.avgPerDelivery)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs text-amber-600 mb-1">Minggu Ini</p>
                            <p className="font-bold text-xl text-amber-700">{stats.thisWeekDeliveries} order</p>
                        </div>
                    </div>
                </div>

                {/* Go to Radar CTA */}
                <Link
                    href="/courier/radar"
                    className="block bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-lg">Mulai Cari Order!</p>
                            <p className="text-white/80 text-sm">Buka radar untuk terima pesanan</p>
                        </div>
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </Link>

            </div>

            {/* Bottom spacing */}
            <div className="h-20" />
        </AppLayout>
    );
}
