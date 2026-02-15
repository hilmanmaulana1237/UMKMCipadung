import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Product } from '@/types';
import axios from 'axios';
import {
    Bot,
    Send,
    ArrowLeft,
    ShoppingBag,
    Sparkles,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    type: 'user' | 'ai';
    content: string;
    products?: Product[];
    timestamp: Date;
}

interface Props {
    suggestedQueries: string[];
}

export default function AIShoppingAssistant({ suggestedQueries = [
    'Makanan murah bikin kenyang dibawah 15rb 🍚',
    'Cemilan pedas buat teman nugas 🔥',
    'Kado unik buat pacar budget 50rb 💝',
    'Jajanan enak buat arisan 🍰',
    'Minuman segar dibawah 10rb 🥤',
    'Kerajinan tangan untuk souvenir 🎁',
] }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            type: 'ai',
            content: 'Hai! 👋 Aku adalah AI Shopping Assistant MudaPreneur.\n\nAku udah baca semua produk dari toko UMKM lokal, jadi tinggal bilang aja mau beli apa, budget berapa, atau cocok buat siapa - aku akan carikan produk terbaik yang sesuai! 🛍️✨',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (message?: string) => {
        const text = message || inputValue.trim();
        if (!text || isLoading) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('/marketplace/ai-assistant/chat', { message: text });

            // Add AI response
            const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.response,
                products: response.data.products,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Maaf, ada gangguan koneksi. Coba lagi ya! 😅',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AppLayout activeTab="marketplace" showBottomNav={false}>
            <Head title="AI Shopping Assistant" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/marketplace"
                        className="p-2 hover:bg-white/20 rounded-full transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white flex items-center gap-2">
                                AI Shopping Assistant
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                            </h1>
                            <p className="text-white/70 text-xs">Powered by MudaPreneur AI</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-card border border-border rounded-bl-md'
                                }`}>
                                {message.type === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bot className="w-4 h-4 text-purple-500" />
                                        <span className="text-xs font-medium text-purple-500">AI Assistant</span>
                                    </div>
                                )}
                                <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-foreground'}`}>
                                    {message.content}
                                </p>
                            </div>

                            {/* Product Cards */}
                            {message.products && message.products.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                                        <ShoppingBag className="w-3 h-3" />
                                        {message.products.length} produk ditemukan
                                    </p>
                                    <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                                        <div className="flex gap-3" style={{ width: 'max-content' }}>
                                            {message.products.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/marketplace/product/${product.id}`}
                                                    className="w-40 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all flex-shrink-0"
                                                >
                                                    <div className="aspect-square bg-muted relative">
                                                        {product.image_path ? (
                                                            <img
                                                                src={`/storage/${product.image_path}`}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Sparkles className="w-2.5 h-2.5" />
                                                            AI Pick
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5">
                                                        <p className="font-medium text-foreground text-sm line-clamp-2 leading-tight">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-primary font-bold text-sm mt-1">
                                                            {formatPrice(Number(product.price))}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                            {product.store?.name}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timestamp */}
                            <p className={`text-[10px] text-muted-foreground mt-1 px-2 ${message.type === 'user' ? 'text-right' : ''}`}>
                                {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                                <span className="text-sm text-muted-foreground">Mencari produk...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Queries (show only at start) */}
            {messages.length <= 1 && (
                <div className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-2">💡 Coba tanya:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQueries.slice(0, 4).map((query, index) => (
                            <button
                                key={index}
                                onClick={() => handleSend(query)}
                                className="px-3 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors"
                            >
                                {query}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Mau beli apa hari ini?"
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-muted rounded-2xl pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
