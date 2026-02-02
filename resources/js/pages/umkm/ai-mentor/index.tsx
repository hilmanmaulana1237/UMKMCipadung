import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MessageSquare, Plus, ChevronRight, Brain } from 'lucide-react';

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    sessions: ChatSession[];
}

export default function AIMentorIndex({ sessions }: Props) {
    const { post, processing } = useForm();

    const createNewChat = (e: React.FormEvent) => {
        e.preventDefault();
        post('/umkm/ai-mentor');
    };

    return (
        <AppLayout activeTab="dashboard">
            <Head title="AI Business Mentor" />

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 pt-6 pb-8 rounded-b-3xl">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/umkm/dashboard" className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Si Mudapreneur AI</h1>
                    <div className="w-9 h-9" />
                </div>

                <div className="text-center text-white mb-2">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
                        <span className="text-4xl">👨‍🏫</span>
                    </div>
                    <h2 className="text-lg font-bold">Mitra Usaha Muda Entrepreneur</h2>
                    <p className="text-white/80 text-sm">Konsultasi Bisnis, Ide Konten & Strategi</p>
                </div>
            </div>

            <div className="px-4 -mt-6">
                <form onSubmit={createNewChat} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900">Mulai Obrolan Baru</h3>
                        <p className="text-xs text-gray-500">Tanya apa saja seputar bisnismu</p>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                <div className="space-y-4 pb-24">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Riwayat Obrolan</span>
                    </div>

                    {sessions.length > 0 ? (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <Link
                                    key={session.id}
                                    href={`/umkm/ai-mentor/${session.id}`}
                                    className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <Brain className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{session.title}</h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(session.updated_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-400 text-sm">Belum ada riwayat obrolan.</p>
                            <p className="text-gray-400 text-xs">Mulai tanya sekarang!</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
