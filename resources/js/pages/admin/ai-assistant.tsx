import axios from 'axios';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Send,
    HelpCircle,
    Bot,
    Megaphone,
    BarChart3,
    BookOpen,
    Loader2,
    Sparkles,
    MessageCircle,
    User,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Toaster } from 'sonner';
import { BottomNavigation } from '@/components/ui/bottomnavigation';

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
    auth: any;
}

export default function AIAssistant({ auth }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickActions: QuickAction[] = [
        { id: 'trend', label: 'Apa tren pasar minggu ini?', icon: 'BarChart3' },
        { id: 'strategy', label: 'Buatkan strategi promosi IG', icon: 'Megaphone' },
        { id: 'finance', label: 'Tips kelola keuangan UMKM', icon: 'BookOpen' },
        { id: 'sales', label: 'Analisis penjualan UMKM Kelurahan', icon: 'Sparkles' },
    ];

    const iconMap: Record<string, any> = {
        BarChart3,
        Megaphone,
        BookOpen,
        Sparkles,
        MessageCircle
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            // Use axios instead of fetch for automatic CSRF handling
            const response = await axios.post('/admin/ai-assistant/chat', {
                message: messageText,
                history: messages.map((m) => ({ role: m.role, content: m.content })),
            });

            const data = response.data;

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.success ? data.message : 'Maaf, terjadi kesalahan API.',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('AI Chat Error:', error);

            let errorMessage = 'Gagal: Tidak dapat terhubung ke server.';

            if (error.response) {
                // Server responded with a status code outside 2xx
                if (error.response.status === 419) {
                    errorMessage = 'Sesi kadaluarsa (419). Silakan refresh halaman.';
                } else if (error.response.status === 504) {
                    errorMessage = 'Server Timeout (504). AI terlalu lama berpikir (coba persingkat pertanyaan).';
                } else {
                    errorMessage = `Server Error: ${error.response.status} ${error.response.statusText}`;
                }
            } else if (error.request) {
                // Request made but no response received
                errorMessage = 'Tidak ada respon dari server (Network Error).';
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `${errorMessage} (Cek Console F12)`,
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

    const clearHistory = () => {
        setMessages([]);
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-blue-500/30">
            <Head title="AI Assistant Dashboard" />

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/10 skew-x-12 -mr-32" />
                <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-blue-900/10 rounded-full blur-3xl -ml-20" />
            </div>

            <div className="relative flex flex-col h-screen lg:flex-row lg:h-screen overflow-hidden">
                {/* Desktop Sidebar (Left Panel) */}
                <div className="hidden lg:flex w-80 bg-slate-950 border-r border-white/10 flex-col p-6 z-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">AI Assistant</h1>
                            <p className="text-xs text-blue-300">Super Admin Cipadung</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Dashboard
                        </Link>

                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
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
                                        className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white transition-all border border-transparent hover:border-white/10 flex items-center gap-3 group"
                                    >
                                        <div className="p-1.5 rounded-md bg-slate-800 text-blue-400 group-hover:text-blue-300 group-hover:bg-slate-700 transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span>{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900">
                                {auth.user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{auth.user.name}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{auth.user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col h-[calc(100vh-80px)] lg:h-screen relative z-10 w-full max-w-5xl mx-auto lg:max-w-none">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
                        <div className="flex items-center gap-3">
                            <Link href="/admin/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Bot className="w-6 h-6 text-blue-400" />
                                <h1 className="font-bold text-white">AI Assistant</h1>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                            {auth.user.name.charAt(0)}
                        </div>
                    </header>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/10 backdrop-blur-sm">
                                    <Bot className="w-12 h-12 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Halo, {auth.user.name}! 👋
                                </h2>
                                <p className="text-slate-400 mb-8 max-w-md">
                                    Saya asisten pintar Anda. Tanyakan tentang strategi penjualan, analisis toko, atau bantuan teknis.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:hidden">
                                    {quickActions.slice(0, 4).map((action) => {
                                        const Icon = iconMap[action.icon] || HelpCircle;
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleQuickAction(action)}
                                                className="p-3 bg-white/5 active:bg-white/10 rounded-xl text-left text-xs text-slate-300 border border-white/5 flex items-center gap-3"
                                            >
                                                <Icon className="w-4 h-4 text-blue-400" />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                <Bot className="w-5 h-5 text-indigo-400" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[85%] lg:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${message.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                                {message.content}
                                            </p>
                                            <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                                                {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                                                <User className="w-4 h-4 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-white/5">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm font-medium">Sedang berpikir...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 lg:p-6 bg-slate-900/90 backdrop-blur-xl border-t border-white/10">
                        <div className="max-w-3xl mx-auto">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage(input);
                                }}
                                className="relative flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ketik pesan Anda disini..."
                                        disabled={isLoading}
                                        className="w-full h-12 pl-4 pr-12 bg-slate-800 border-none rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                                    />
                                    <div className="absolute right-2 top-1.5 ">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={isLoading || !input.trim()}
                                            className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {messages.length > 0 && (
                                <div className="mt-3 flex justify-center lg:justify-end">
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Mulai Percakapan Baru
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation (Only visible on mobile) */}
            <div className="lg:hidden">
                <BottomNavigation userRole={auth.user.role} activeTab="dashboard" />
            </div>

            <Toaster position="top-right" theme="dark" />
        </div>
    );
}
