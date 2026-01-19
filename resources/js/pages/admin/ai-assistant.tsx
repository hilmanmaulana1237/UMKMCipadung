import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
    RefreshCw
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
        { id: 'sales', label: 'Analisis penjualan saya', icon: 'Sparkles' },
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
        <>
            <AppLayout>
                <Head title="AI Assistant Dashboard" />

                <div className="relative min-h-screen bg-slate-900 overflow-hidden">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/20 skew-x-12 -mr-32" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-blue-900/10 rounded-full blur-3xl -ml-20" />

                    <div className="relative z-10 p-4 lg:p-8 h-screen flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">AI Assistant</h1>
                                    <p className="text-blue-200 text-sm">Asisten Cerdas UMKM Desa</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:flex flex-col items-end mr-2">
                                    <span className="text-white font-medium text-sm">{auth.user.name}</span>
                                    <span className="text-blue-300 text-xs bg-blue-500/20 px-2 py-0.5 rounded-full capitalize">
                                        {auth.user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                            {/* Sidebar Quick Actions */}
                            <div className="hidden lg:flex w-80 flex-col gap-4">
                                <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex-1">
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
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
                </div>
            </AppLayout>
        </>
    );
}
