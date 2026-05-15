import { Head, Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, Video, Image, MessageCircle, TrendingUp, ArrowRight, Clock, ChevronRight, FileText, BarChart3, Search } from 'lucide-react';

interface Stats {
    totalSellers: number;
    totalStores: number;
    totalVideos: number;
    totalPosters: number;
    totalChatSessions: number;
    totalChatMessages: number;
    totalAIContent: number;
    contentByStatus: {
        completed: number;
        processing: number;
        failed: number;
    };
}

interface RecentContent {
    id: string;
    type: string;
    status: string;
    prompt: string | null;
    created_at: string;
    user: { id: number; name: string; email: string } | null;
}

interface TopSeller {
    id: number;
    name: string;
    email: string;
    video_count: number;
    poster_count: number;
    chat_count: number;
}

interface DailyActivity {
    date: string;
    count: number;
}

interface Props {
    stats: Stats;
    recentContents: RecentContent[];
    topSellers: TopSeller[];
    dailyActivity: DailyActivity[];
}

export default function AdminDashboard({ stats, recentContents, topSellers, dailyActivity }: Props) {
    const { auth } = usePage().props as any;

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video_generation': return { label: 'Video', icon: '🎬', color: 'bg-blue-100 text-blue-700' };
            case 'video_script': return { label: 'Script', icon: '📝', color: 'bg-indigo-100 text-indigo-700' };
            case 'video_prompt': return { label: 'Prompt', icon: '✨', color: 'bg-cyan-100 text-cyan-700' };
            case 'poster': return { label: 'Poster', icon: '🖼️', color: 'bg-pink-100 text-pink-700' };
            default: return { label: type, icon: '📄', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Selesai', className: 'bg-green-100 text-green-700' };
            case 'generating': case 'queuing': case 'processing': return { label: 'Proses', className: 'bg-amber-100 text-amber-700' };
            case 'failed': return { label: 'Gagal', className: 'bg-red-100 text-red-700' };
            default: return { label: status, className: 'bg-gray-100 text-gray-700' };
        }
    };

    const maxActivity = Math.max(...dailyActivity.map(d => d.count), 1);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Admin Dashboard - MudaPreneur AI" />

            {/* Top Nav */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900">Admin</span>
                                <span className="font-bold text-blue-600"> Panel</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <nav className="hidden sm:flex items-center gap-1">
                                <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">Dashboard</Link>
                                <Link href="/admin/sellers" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Penjual</Link>
                                <Link href="/admin/contents" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Konten AI</Link>
                                <Link href="/admin/chats" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Chat AI</Link>
                            </nav>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 hidden sm:block">{auth?.user?.name}</span>
                                <Link href="/profile" className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {auth?.user?.name?.[0] || 'A'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
                <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap">Dashboard</Link>
                <Link href="/admin/sellers" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Penjual</Link>
                <Link href="/admin/contents" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Konten AI</Link>
                <Link href="/admin/chats" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Chat AI</Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
                    <p className="text-slate-500 mt-1">Monitor semua aktivitas AI dari seluruh penjual UMKM</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalSellers}</p>
                        <p className="text-sm text-slate-500">Total Penjual</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <Video className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalVideos}</p>
                        <p className="text-sm text-slate-500">Video Dibuat</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                                <Image className="w-5 h-5 text-pink-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalPosters}</p>
                        <p className="text-sm text-slate-500">Poster Dibuat</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-cyan-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalChatSessions}</p>
                        <p className="text-sm text-slate-500">Sesi Chat AI</p>
                    </div>
                </div>

                {/* Status Summary + Activity Chart */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Content Status */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Status Konten AI
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Selesai</span>
                                    <span className="font-semibold text-green-600">{stats.contentByStatus.completed}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${stats.totalAIContent > 0 ? (stats.contentByStatus.completed / stats.totalAIContent * 100) : 0}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Diproses</span>
                                    <span className="font-semibold text-amber-600">{stats.contentByStatus.processing}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${stats.totalAIContent > 0 ? (stats.contentByStatus.processing / stats.totalAIContent * 100) : 0}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">Gagal</span>
                                    <span className="font-semibold text-red-600">{stats.contentByStatus.failed}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${stats.totalAIContent > 0 ? (stats.contentByStatus.failed / stats.totalAIContent * 100) : 0}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">Total: <span className="font-bold text-slate-900">{stats.totalAIContent}</span> konten AI</p>
                        </div>
                    </div>

                    {/* Activity Chart (Simple Bar) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Aktivitas 14 Hari Terakhir
                        </h3>
                        {dailyActivity.length > 0 ? (
                            <div className="flex items-end gap-1 h-32">
                                {dailyActivity.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[9px] text-slate-400 font-medium">{day.count}</span>
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm min-h-[4px] transition-all"
                                            style={{ height: `${(day.count / maxActivity) * 100}%` }}
                                        />
                                        <span className="text-[8px] text-slate-400">{new Date(day.date).getDate()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Belum ada data aktivitas</div>
                        )}
                    </div>
                </div>

                {/* Top Sellers + Recent Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Sellers */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Top Penjual (AI Usage)
                            </h3>
                            <Link href="/admin/sellers" className="text-sm text-blue-600 font-medium">Semua →</Link>
                        </div>
                        {topSellers.length > 0 ? (
                            <div className="space-y-3">
                                {topSellers.slice(0, 5).map((seller, i) => (
                                    <Link key={seller.id} href={`/admin/sellers/${seller.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 text-sm truncate">{seller.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{seller.email}</p>
                                        </div>
                                        <div className="flex gap-2 text-xs shrink-0">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{seller.video_count}🎬</span>
                                            <span className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full">{seller.poster_count}🖼️</span>
                                            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded-full">{seller.chat_count}💬</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm text-center py-8">Belum ada aktivitas penjual</p>
                        )}
                    </div>

                    {/* Recent AI Content */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Konten AI Terbaru
                            </h3>
                            <Link href="/admin/contents" className="text-sm text-blue-600 font-medium">Semua →</Link>
                        </div>
                        {recentContents.length > 0 ? (
                            <div className="space-y-2">
                                {recentContents.slice(0, 8).map((content) => {
                                    const typeInfo = getTypeLabel(content.type);
                                    const statusInfo = getStatusBadge(content.status);
                                    return (
                                        <div key={content.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                                                {typeInfo.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate">{content.user?.name || 'Unknown'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                                                <Clock className="w-3 h-3" />
                                                {new Date(content.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm text-center py-8">Belum ada konten AI</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
