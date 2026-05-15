import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, ArrowLeft, Video, Image, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Props {
    seller: {
        id: number; name: string; email: string; avatar_path: string | null;
        created_at: string; store: { id: number; name: string } | null;
    };
    contents: {
        data: Array<{ id: string; type: string; status: string; prompt: string | null; original_image_path: string | null; created_at: string }>;
        links: any[]; current_page: number; last_page: number;
    };
    chatSessions: Array<{ id: string; title: string; messages_count: number; created_at: string }>;
    stats: { totalContent: number; videoCount: number; posterCount: number; chatCount: number; completedCount: number; failedCount: number };
}

export default function AdminSellerDetail({ seller, contents, chatSessions, stats }: Props) {
    const typeLabel = (t: string) => ({ video_generation: '🎬 Video', video_script: '📝 Script', video_prompt: '✨ Prompt', poster: '🖼️ Poster' }[t] || '📄 ' + t);
    const statusCls = (s: string) => s === 'completed' ? 'bg-green-100 text-green-700' : s === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
    const statusLabel = (s: string) => s === 'completed' ? 'Selesai' : s === 'failed' ? 'Gagal' : 'Proses';

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`${seller.name} - Admin`} />
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
                    <Link href="/admin/sellers" className="flex items-center gap-2 text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali</span></Link>
                    <div className="w-px h-6 bg-slate-200" />
                    <span className="font-bold text-slate-900 text-sm">Detail Penjual</span>
                </div>
            </nav>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 text-2xl font-bold shrink-0 overflow-hidden">
                            {seller.avatar_path ? <img src={`/storage/${seller.avatar_path}`} className="w-full h-full object-cover" alt="" /> : seller.name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{seller.name}</h1>
                            <p className="text-slate-500 text-sm">{seller.email}</p>
                            {seller.store && <p className="text-blue-600 text-sm mt-0.5">🏪 {seller.store.name}</p>}
                            <p className="text-xs text-slate-400 mt-1">Bergabung: {new Date(seller.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[{ v: stats.videoCount, l: 'Video', c: 'text-indigo-600' }, { v: stats.posterCount, l: 'Poster', c: 'text-pink-600' }, { v: stats.chatCount, l: 'Chat', c: 'text-cyan-600' }, { v: stats.completedCount, l: 'Sukses', c: 'text-green-600' }].map((s, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                            <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                            <p className="text-xs text-slate-500 mt-1">{s.l}</p>
                        </div>
                    ))}
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Riwayat Konten AI</h3>
                        {contents.data.length > 0 ? contents.data.map(c => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-2">
                                <span className="text-lg">{typeLabel(c.type).split(' ')[0]}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-700">{typeLabel(c.type)}</span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls(c.status)}`}>{statusLabel(c.status)}</span>
                                    </div>
                                    {c.prompt && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.prompt}</p>}
                                </div>
                                <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        )) : <p className="text-slate-400 text-sm text-center py-8">Belum ada konten AI</p>}
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Sesi Chat AI</h3>
                        {chatSessions.length > 0 ? chatSessions.map(s => (
                            <Link key={s.id} href={`/admin/chats/${s.id}`} className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors mb-2">
                                <p className="text-sm font-medium text-slate-900 truncate">{s.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <MessageCircle className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-500">{s.messages_count} pesan</span>
                                </div>
                            </Link>
                        )) : <p className="text-slate-400 text-sm text-center py-8">Belum ada sesi chat</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
