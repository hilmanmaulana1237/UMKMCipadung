import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bot, User } from 'lucide-react';

interface Message { id: string; role: string; content: string; created_at: string }
interface Props {
    session: {
        id: string; title: string; created_at: string;
        user: { id: number; name: string; email: string } | null;
        messages: Message[];
    };
}

export default function AdminChatDetail({ session }: Props) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Chat: ${session.title} - Admin`} />
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 flex items-center h-16 gap-4">
                    <Link href="/admin/chats" className="flex items-center gap-2 text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Kembali</span></Link>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{session.title}</p>
                        {session.user && <p className="text-xs text-slate-500">👤 {session.user.name}</p>}
                    </div>
                </div>
            </nav>
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="text-center mb-6">
                        <p className="text-xs text-slate-400">{new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="space-y-4">
                        {session.messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1"><Bot className="w-4 h-4 text-blue-600" /></div>
                                )}
                                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                                }`}>
                                    {msg.content}
                                    <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0 mt-1"><User className="w-4 h-4 text-slate-600" /></div>
                                )}
                            </div>
                        ))}
                    </div>
                    {session.messages.length === 0 && (
                        <p className="text-slate-400 text-sm text-center py-8">Sesi chat kosong</p>
                    )}
                </div>
            </div>
        </div>
    );
}
