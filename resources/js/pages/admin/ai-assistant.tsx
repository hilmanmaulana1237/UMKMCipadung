import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import {
    Bot, Send, ArrowLeft, Store, TrendingUp, HelpCircle,
    Megaphone, BarChart3, BookOpen, Loader2, Sparkles,
    MessageCircle, User, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface QuickAction {
    id: string;
    label: string;
    icon: string;
}

interface Props {
    stats: {
        total_stores: number;
        active_stores: number;
        total_products: number;
        total_orders: number;
        pending_orders: number;
        pending_complaints: number;
        total_users: number;
        total_revenue: number;
    };
    quickActions: QuickAction[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    store: Store,
    trending: TrendingUp,
    help: HelpCircle,
    megaphone: Megaphone,
    chart: BarChart3,
    book: BookOpen,
};

export default function AIAssistant({ stats, quickActions }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load messages from cache on mount
    useEffect(() => {
        const cached = localStorage.getItem('admin_ai_chat_history');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                // Convert timestamp strings back to Date objects
                const restored = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(restored);
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }
    }, []);

    // Save messages to cache whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('admin_ai_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem('admin_ai_chat_history');
    };

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/admin/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    message: messageText,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.success ? data.message : 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Maaf, tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: QuickAction) => {
        sendMessage(action.label);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    return (
        <>
            <Head title="Asisten AI Admin - Marketplace Cipadung" />

            <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-xl border-b border-white/10 flex-shrink-0">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/admin/dashboard"
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-white" />
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                            Asisten AI Admin
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                        </h1>
                                        <p className="text-sm text-blue-200">Bantu kelola & kembangkan UMKM Cipadung</p>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/admin/settings/api"
                                className="text-sm text-blue-200 hover:text-white transition-colors"
                            >
                                Pengaturan API →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex gap-6 overflow-hidden">
                    {/* Sidebar - Stats & Quick Actions */}
                    <div className="hidden lg:block w-80 flex-shrink-0 space-y-4">
                        {/* Stats Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                            <h3 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Statistik Marketplace
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-blue-200 text-xs">Total UMKM</p>
                                    <p className="text-white font-bold text-lg">{stats.total_stores}</p>
                                    <p className="text-green-400 text-xs">{stats.active_stores} aktif</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-blue-200 text-xs">Total Produk</p>
                                    <p className="text-white font-bold text-lg">{formatNumber(stats.total_products)}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-blue-200 text-xs">Total Pesanan</p>
                                    <p className="text-white font-bold text-lg">{formatNumber(stats.total_orders)}</p>
                                    <p className="text-amber-400 text-xs">{stats.pending_orders} pending</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3">
                                    <p className="text-blue-200 text-xs">Pendapatan</p>
                                    <p className="text-white font-bold text-sm">{formatCurrency(stats.total_revenue)}</p>
                                </div>
                            </div>
                            {stats.pending_complaints > 0 && (
                                <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                                    <p className="text-red-300 text-xs font-semibold">
                                        ⚠️ {stats.pending_complaints} keluhan menunggu respon
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                            <h3 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Pertanyaan Cepat
                            </h3>
                            <div className="space-y-2">
                                {quickActions.map((action) => {
                                    const Icon = iconMap[action.icon] || HelpCircle;
                                    return (
                                        <button
                                            key={action.id}
                                            onClick={() => handleQuickAction(action)}
                                            disabled={isLoading}
                                            className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white transition-colors flex items-start gap-3 disabled:opacity-50"
                                        >
                                            <Icon className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                                            <span>{action.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
                                        <Bot className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        Halo, Admin Cipadung! 👋
                                    </h2>
                                    <p className="text-blue-200 max-w-md mb-6">
                                        Saya siap membantu Anda mengelola marketplace dan mengembangkan UMKM desa.
                                        Tanyakan apa saja tentang strategi, panduan website, atau analisis data.
                                    </p>

                                    {/* Mobile Quick Actions */}
                                    <div className="lg:hidden grid grid-cols-2 gap-2 w-full max-w-md">
                                        {quickActions.slice(0, 4).map((action) => {
                                            const Icon = iconMap[action.icon] || HelpCircle;
                                            return (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleQuickAction(action)}
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white transition-colors flex flex-col items-center gap-2"
                                                >
                                                    <Icon className="w-5 h-5 text-blue-300" />
                                                    <span className="text-center leading-tight">{action.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-br-md'
                                                    : 'bg-white/10 text-white rounded-bl-md'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </p>
                                                <p className="text-xs opacity-60 mt-2">
                                                    {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {message.role === 'user' && (
                                                <div className="w-8 h-8 bg-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex items-center gap-2 text-blue-200">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm">Sedang mengetik...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="flex gap-3"
                            >
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Tanyakan sesuatu..."
                                        disabled={isLoading}
                                        className="w-full h-12 px-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                    />
                                    <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50" />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </form>
                            {messages.length > 0 && (
                                <div className="mt-2 flex justify-center">
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs text-blue-200/50 hover:text-blue-200 transition-colors flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Reset Percakapan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
