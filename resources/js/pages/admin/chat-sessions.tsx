import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, MessageCircle } from 'lucide-react';

interface Session {
    id: string; title: string; messages_count: number; created_at: string;
    user: { id: number; name: string; email: string } | null;
}

interface Props {
    sessions: { data: Session[]; links: any[]; current_page: number; last_page: number };
}

export default function AdminChatSessions({ sessions }: Props) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Chat AI Sessions - Admin" />
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center"><LayoutDashboard className="w-5 h-5 text-white" /></div>
                        <span className="font-bold text-slate-900">Admin <span className="text-blue-600">Panel</span></span>
                    </div>
                    <nav className="hidden sm:flex items-center gap-1">
                        <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Dashboard</Link>
                        <Link href="/admin/sellers" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Penjual</Link>
                        <Link href="/admin/contents" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Konten AI</Link>
                        <Link href="/admin/chats" className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">Chat AI</Link>
                    </nav>
                </div>
            </nav>
            <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
                <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Dashboard</Link>
                <Link href="/admin/sellers" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Penjual</Link>
                <Link href="/admin/contents" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Konten AI</Link>
                <Link href="/admin/chats" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap">Chat AI</Link>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Sesi Chat AI</h1>
                <p className="text-slate-500 text-sm mb-6">Semua percakapan penjual dengan AI Business Mentor</p>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {sessions.data.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {sessions.data.map(s => (
                                <Link key={s.id} href={`/admin/chats/${s.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5 text-cyan-600" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{s.title}</p>
                                        {s.user && <p className="text-xs text-blue-600 truncate">👤 {s.user.name} ({s.user.email})</p>}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-slate-700">{s.messages_count} <span className="text-xs text-slate-400 font-normal">pesan</span></p>
                                        <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : <div className="p-12 text-center text-slate-400">Belum ada sesi chat</div>}
                </div>
                {sessions.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {sessions.links?.filter((l: any) => l.url).map((link: any, i: number) => (
                            <Link key={i} href={link.url} className={`px-3 py-1.5 text-sm rounded-lg ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
