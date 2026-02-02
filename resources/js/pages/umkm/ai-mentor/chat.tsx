import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react'; // Link imported
import { Send, ChevronLeft, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

interface ChatSession {
    id: string;
    title: string;
}

interface Props {
    session: ChatSession;
    messages: Message[];
}

export default function AIMentorChat({ session, messages: initialMessages }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post(`/umkm/ai-mentor/${session.id}/message`, {
                message: userMsg.content
            });

            if (response.data.success) {
                const aiMsg = response.data.message;
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: aiMsg.content
                }]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Maaf kak, ada gangguan jaringan. Coba lagi ya? 🙏"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AppLayout activeTab="dashboard">
            <Head title="Chat Mentor" />

            {/* Chat Header - Fixed Top */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 h-[72px] bg-white border-b border-gray-100 flex items-center px-4 shadow-sm">
                <div className="flex items-center gap-3 w-full">
                    <Link href="/umkm/ai-mentor" className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            <span className="text-xl">👨‍🏫</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 text-sm tracking-tight">Si Mudapreneur</h1>
                        <p className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Business Mentor
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area - Fixed Scrollable Window */}
            <div className="fixed top-[72px] bottom-[200px] left-1/2 -translate-x-1/2 w-full max-w-[480px] overflow-y-auto bg-slate-50/50 p-4 scroll-smooth">
                <div className="space-y-6 pt-2">
                    {/* Zero State / Welcome */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-lg shadow-blue-500/10 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                                <span className="text-5xl drop-shadow-sm">👋</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Halo, Bos UMKM!</h3>
                            <p className="text-sm text-gray-500 text-center max-w-[280px] mb-8 leading-relaxed">
                                Saya siap bantu bisnis kakak makin cuan. Mau diskusi soal apa hari ini?
                            </p>

                            {/* Suggestion Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                {[
                                    { icon: "📣", text: "Ide konten TikTok" },
                                    { icon: "💰", text: "Hitung harga jual" },
                                    { icon: "📦", text: "Solusi stok numpuk" },
                                    { icon: "📈", text: "Marketing hemat" }
                                ].map((chip, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(chip.text)}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left group"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{chip.icon}</span>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{chip.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`
                                max-w-[85%] p-4 shadow-sm relative text-sm leading-relaxed transition-all
                                ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm hover:shadow-md'
                                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'}
                            `}>
                                <div className="whitespace-pre-wrap font-sans">
                                    {msg.content}
                                </div>
                                <div className={`text-[10px] mt-2 flex items-center gap-1 ${msg.role === 'user' ? 'text-blue-100/80 justify-end' : 'text-gray-400'}`}>
                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    {msg.role === 'user' && <span className="text-xs">✓</span>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start animate-pulse">
                            <div className="bg-white rounded-2xl rounded-tl-sm p-4 border border-gray-100 shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Fixed Floating Capsule */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-50">
                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 transition-all group-focus-within:bg-white group-focus-within:shadow-xl"></div>
                    <div className="relative flex items-end gap-2 p-2">
                        <button type="button" className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan..."
                            className="flex-1 bg-transparent border-0 px-2 py-3 focus:ring-0 text-sm placeholder:text-gray-400/80 max-h-32 text-gray-800"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
