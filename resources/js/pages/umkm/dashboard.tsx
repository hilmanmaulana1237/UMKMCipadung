import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, Video, Image, Bot, ArrowRight, Clock, Wand2 } from 'lucide-react';

interface AIContentStat {
    totalVideos: number;
    totalPosters: number;
    totalChats: number;
}

interface Props {
    store: {
        id: number;
        name: string;
    } | null;
    aiStats: AIContentStat;
    recentContents: Array<{
        id: string;
        type: string;
        status: string;
        created_at: string;
    }>;
}

export default function UmkmDashboard({ store, aiStats, recentContents }: Props) {
    const { auth } = usePage().props as { auth: { user: { name: string; avatar_path?: string } } };

    const aiTools = [
        {
            icon: Video,
            title: 'AI Video Generator',
            description: 'Buat video promosi profesional dari foto Anda',
            href: '/umkm/ai-content',
            color: 'from-blue-500 to-indigo-600',
            glow: 'shadow-blue-500/20',
            stat: `${aiStats.totalVideos} video dibuat`,
        },
        {
            icon: Image,
            title: 'AI Poster Maker',
            description: 'Generate poster menarik untuk sosial media',
            href: '/umkm/ai-content',
            color: 'from-pink-500 to-rose-600',
            glow: 'shadow-pink-500/20',
            stat: `${aiStats.totalPosters} poster dibuat`,
        },
        {
            icon: Bot,
            title: 'AI Business Mentor',
            description: 'Konsultasi bisnis 24/7 dengan AI mentor',
            href: '/umkm/ai-mentor',
            color: 'from-cyan-500 to-blue-600',
            glow: 'shadow-cyan-500/20',
            stat: `${aiStats.totalChats} sesi chat`,
        },
    ];

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video_generation': return '🎬 Video';
            case 'video_script': return '📝 Script';
            case 'video_prompt': return '✨ Prompt';
            case 'poster': return '🖼️ Poster';
            default: return '📄 Konten';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Selesai', className: 'bg-green-100 text-green-700' };
            case 'generating': case 'queuing': return { label: 'Proses...', className: 'bg-amber-100 text-amber-700' };
            case 'failed': return { label: 'Gagal', className: 'bg-red-100 text-red-700' };
            default: return { label: status, className: 'bg-slate-100 text-slate-700' };
        }
    };

    return (
        <AppLayout activeTab="dashboard">
            <Head title="Dashboard - MudaPreneur AI" />

            {/* Header */}
            <div className="px-4 pt-6 pb-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        {auth.user.avatar_path ? (
                            <img src={`/storage/${auth.user.avatar_path}`} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            <span className="text-2xl">👋</span>
                        )}
                    </div>
                    <div>
                        <p className="text-white/60 text-sm">Selamat datang,</p>
                        <h1 className="text-xl font-bold text-white">{store?.name || auth.user.name}</h1>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                        <p className="text-2xl font-bold text-white">{aiStats.totalVideos}</p>
                        <p className="text-xs text-white/60">Video</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                        <p className="text-2xl font-bold text-white">{aiStats.totalPosters}</p>
                        <p className="text-xs text-white/60">Poster</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5">
                        <p className="text-2xl font-bold text-white">{aiStats.totalChats}</p>
                        <p className="text-xs text-white/60">Chat AI</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 py-5 space-y-5 -mt-3">

                {/* AI Tools */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-foreground text-lg">AI Tools</span>
                    </div>
                    <div className="space-y-3">
                        {aiTools.map((tool, index) => (
                            <Link
                                key={index}
                                href={tool.href}
                                className="block bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg ${tool.glow} shrink-0`}>
                                        <tool.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-foreground">{tool.title}</h3>
                                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                                        <p className="text-xs text-blue-600 font-medium mt-1">{tool.stat}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent AI Generations */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-foreground">Riwayat Konten AI</span>
                        <Link href="/umkm/ai-content" className="text-sm text-blue-600 font-medium">
                            Lihat Semua
                        </Link>
                    </div>

                    {recentContents.length === 0 ? (
                        <div className="bg-card rounded-2xl p-8 border border-border text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Wand2 className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="text-muted-foreground text-sm mb-1">Belum ada konten AI</p>
                            <p className="text-muted-foreground text-xs">Mulai buat video atau poster pertama Anda!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentContents.slice(0, 5).map((content) => {
                                const badge = getStatusBadge(content.status);
                                return (
                                    <Link
                                        key={content.id}
                                        href="/umkm/ai-content"
                                        className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
                                            {getTypeLabel(content.type).split(' ')[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{getTypeLabel(content.type)}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(content.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-20" />
        </AppLayout>
    );
}
