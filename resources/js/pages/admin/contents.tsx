import { Head, Link, router } from '@inertiajs/react';
import { LayoutDashboard, Clock, Filter } from 'lucide-react';

interface Content {
    id: string; type: string; status: string; prompt: string | null;
    created_at: string; user: { id: number; name: string; email: string } | null;
}

interface Props {
    contents: { data: Content[]; links: any[]; current_page: number; last_page: number };
    currentType: string; currentStatus: string;
}

export default function AdminContents({ contents, currentType, currentStatus }: Props) {
    const typeLabel = (t: string) => ({ video_generation: '🎬 Video', video_script: '📝 Script', video_prompt: '✨ Prompt', poster: '🖼️ Poster' }[t] || '📄 ' + t);
    const statusCls = (s: string) => s === 'completed' ? 'bg-green-100 text-green-700' : s === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
    const statusLabel = (s: string) => s === 'completed' ? 'Selesai' : s === 'failed' ? 'Gagal' : 'Proses';

    const applyFilter = (type: string, status: string) => {
        router.get('/admin/contents', { type, status }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Konten AI - Admin" />
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"><LayoutDashboard className="w-5 h-5 text-white" /></div>
                        <span className="font-bold text-slate-900">Admin <span className="text-blue-600">Panel</span></span>
                    </div>
                    <nav className="hidden sm:flex items-center gap-1">
                        <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Dashboard</Link>
                        <Link href="/admin/sellers" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Penjual</Link>
                        <Link href="/admin/contents" className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">Konten AI</Link>
                        <Link href="/admin/chats" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Chat AI</Link>
                    </nav>
                </div>
            </nav>
            <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
                <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Dashboard</Link>
                <Link href="/admin/sellers" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Penjual</Link>
                <Link href="/admin/contents" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap">Konten AI</Link>
                <Link href="/admin/chats" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Chat AI</Link>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Konten AI</h1>
                <p className="text-slate-500 text-sm mb-6">Semua video, poster, dan konten yang dihasilkan AI</p>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm text-slate-500 py-1.5 flex items-center gap-1"><Filter className="w-4 h-4" /> Tipe:</span>
                    {[{ k: 'all', l: 'Semua' }, { k: 'video', l: '🎬 Video' }, { k: 'poster', l: '🖼️ Poster' }].map(f => (
                        <button key={f.k} onClick={() => applyFilter(f.k, currentStatus)} className={`px-3 py-1.5 text-sm rounded-lg ${currentType === f.k ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{f.l}</button>
                    ))}
                    <span className="text-sm text-slate-500 py-1.5 ml-2">Status:</span>
                    {[{ k: 'all', l: 'Semua' }, { k: 'completed', l: '✅ Selesai' }, { k: 'failed', l: '❌ Gagal' }].map(f => (
                        <button key={f.k} onClick={() => applyFilter(currentType, f.k)} className={`px-3 py-1.5 text-sm rounded-lg ${currentStatus === f.k ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{f.l}</button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {contents.data.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {contents.data.map(c => (
                                <div key={c.id} className="flex items-center gap-4 p-4">
                                    <span className="text-2xl">{typeLabel(c.type).split(' ')[0]}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-slate-700">{typeLabel(c.type)}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCls(c.status)}`}>{statusLabel(c.status)}</span>
                                        </div>
                                        {c.prompt && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.prompt}</p>}
                                        {c.user && (
                                            <Link href={`/admin/sellers/${c.user.id}`} className="text-xs text-blue-600 hover:underline mt-0.5 block truncate">
                                                👤 {c.user.name}
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0"><Clock className="w-3 h-3" />{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                                </div>
                            ))}
                        </div>
                    ) : <div className="p-12 text-center text-slate-400">Tidak ada konten ditemukan</div>}
                </div>
                {contents.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {contents.links?.filter((l: any) => l.url).map((link: any, i: number) => (
                            <Link key={i} href={link.url} className={`px-3 py-1.5 text-sm rounded-lg ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
