import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Product } from '@/types';
import { Search, Store, ChevronRight, ShoppingBag, Bot, Sparkles, Send, X, Loader2, ShoppingCart, MapPin, Flame, Clock, SlidersHorizontal, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/hooks/useLocalStorage';

import StarDisplay from '@/components/StarDisplay';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface StoreWithProducts {
    id: number;
    name: string;
    description: string | null;
    products: Product[];
    product_count: number;
    average_rating?: number;
    total_ratings?: number;
    is_open?: boolean;
    is_open_today?: boolean;
    open_time?: string;
    close_time?: string;
    distance_km?: number | null;
    orders_count?: number;
}


interface Message {
    id: number;
    type: 'user' | 'ai';
    content: string;
    products?: Product[];
}

interface Props {
    products: {
        data: Product[];
        links: any[];
    };
    stores: StoreWithProducts[];
    categories: Category[];
    filters: {
        category?: string;
        search?: string;
        sort?: string;
    };
    auth: {
        user: {
            id: number;
            role: string;
        };
    };
}

const suggestedQueries = [
    'Makanan murah bikin kenyang (Anak Kost) 🍚',
    'Lauk hemat awet buat stok 🥫',
    'Cemilan pedas teman nugas 🔥',
    'Paket laundry murah kilat 🧺',
    'Perlengkapan kost estetik murah 🏠',
];

export default function MarketplaceIndex({ products, stores, categories, filters, auth }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showAIChat, setShowAIChat] = useState(false);
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const { getItemCount } = useCart();
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const currentSort = filters.sort || 'latest';

    const handleSort = (sortType: string) => {
        if (sortType === 'nearest') {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    router.get('/marketplace', {
                        ...filters,
                        sort: sortType,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }, { preserveState: true, onFinish: () => setIsLoadingLocation(false) });
                },
                () => {
                    alert('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izinkan akses lokasi.');
                    setIsLoadingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            router.get('/marketplace', { ...filters, sort: sortType }, { preserveState: true });
        }
    };
    // Use auth from props directly



    // Initialize messages from localStorage or default
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('ai_chat_messages');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return [{
                        id: 0,
                        type: 'ai',
                        content: 'Hai! 👋 Mau beli apa hari ini? Ceritain aja, aku bantu carikan produk terbaik! 🛍️',
                    }];
                }
            }
        }
        return [{
            id: 0,
            type: 'ai',
            content: 'Hai! 👋 Mau beli apa hari ini? Ceritain aja, aku bantu carikan produk terbaik! 🛍️',
        }];
    });
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined' && messages.length > 0) {
            localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (showAIChat) {
            scrollToBottom();
        }
    }, [messages, showAIChat]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showAIChat) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showAIChat]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/marketplace', { search: searchQuery }, { preserveState: true });
    };

    const handleSend = async (message?: string) => {
        const text = message || inputValue.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: text,
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/marketplace/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                products: data.products,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: 'Maaf, ada gangguan. Coba lagi ya! 😅',
            }]);
        } finally {
            setIsLoading(false);
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
        <AppLayout activeTab="marketplace" showBottomNav={!showAIChat}>
            <Head title="Marketplace Cipadung" />

            {/* Fixed Header & Categories */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-background">
                {/* Premium Gradient Header */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />

                    <div className="relative px-4 pt-8 pb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Marketplace Cipadung</h1>
                                    <p className="text-white/70 text-sm">Temukan produk UMKM terbaik</p>
                                </div>
                            </div>

                            {/* Cart Icon - Only for Buyers */}
                            {auth.user.role === 'buyer' && (
                                <Link
                                    href="/checkout"
                                    className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center hover:bg-white/40 transition-colors relative"
                                >
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                    {getItemCount() > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                            {getItemCount()}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>

                        {/* Search Bar & Filter */}
                        <div className="mt-5 flex gap-2">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Cari produk atau toko..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
                                />
                                <button
                                    type="submit"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <Search className="w-5 h-5 text-slate-400" />
                                </button>
                            </form>
                            <button
                                onClick={() => setShowFilterSheet(true)}
                                className={`w-[52px] flex items-center justify-center bg-white rounded-2xl shadow-lg border border-transparent transition-all hover:bg-slate-50 active:scale-95 ${currentSort !== 'latest' ? 'ring-2 ring-primary/50 border-primary/50' : ''}`}
                            >
                                <SlidersHorizontal className={`w-5 h-5 ${currentSort !== 'latest' ? 'text-primary' : 'text-slate-600'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="px-4 py-4 bg-background">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/marketplace?category=${cat.id}`}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl min-w-fit border transition-all ${filters.category === cat.id
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                    : 'bg-white border-slate-200 hover:border-primary/50 hover:shadow-md'
                                    }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span className="text-sm font-medium">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                    {/* Sort Pills Row REMOVED to save space */}
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-[280px]"></div>

            {/* Stores with Products */}
            <div className="px-4 pb-8 space-y-6">
                {stores.length === 0 ? (
                    !filters.search && (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Belum ada toko</p>
                            <p className="text-slate-400 text-sm mt-1">Toko akan muncul di sini</p>
                        </div>
                    )
                ) : (
                    stores.map((store) => (
                        <div key={store.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${store.is_open ? 'border-slate-100' : 'border-slate-200 opacity-75'}`}>
                            {/* Store Header */}
                            <Link
                                href={`/marketplace/store/${store.id}`}
                                className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${store.is_open ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25' : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-400/25'}`}>
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-slate-800 truncate mb-1">{store.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${store.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {store.is_open ? 'BUKA' : 'TUTUP'}
                                            </span>
                                            <span className="truncate">
                                                {store.product_count} produk
                                            </span>
                                            {store.distance_km !== null && store.distance_km !== undefined && (
                                                <span className="flex items-center gap-0.5 text-green-600 font-medium">
                                                    <MapPin className="w-3 h-3" />
                                                    {store.distance_km} km
                                                </span>
                                            )}
                                        </div>
                                        {store.average_rating !== undefined && store.total_ratings !== undefined && store.total_ratings > 0 && (
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <StarDisplay rating={store.average_rating} totalRatings={store.total_ratings} size="xs" />
                                                {store.open_time && (
                                                    <span className="text-[10px] text-slate-400">• {store.open_time} - {store.close_time}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-primary shrink-0 whitespace-nowrap pl-2">
                                    <span className="text-sm font-medium">Lihat Toko</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </Link>

                            {/* Products Horizontal Scroll */}
                            <div className="p-4">
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                                    {store.products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/marketplace/product/${product.id}`}
                                            className="flex-shrink-0 w-36 group"
                                        >
                                            <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-2 group-hover:shadow-lg transition-all">
                                                {product.image_path ? (
                                                    <img
                                                        src={`/storage/${product.image_path}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-slate-100 to-slate-200">
                                                        📦
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="font-medium text-sm text-slate-800 line-clamp-2 leading-tight">
                                                {product.name}
                                            </h4>
                                            <p className="text-primary font-bold text-sm mt-1">
                                                {formatPrice(Number(product.price))}
                                            </p>
                                        </Link>
                                    ))}

                                    {/* View All Card */}
                                    {store.product_count > 4 && (
                                        <Link
                                            href={`/marketplace/store/${store.id}`}
                                            className="flex-shrink-0 w-36 aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex flex-col items-center justify-center text-center hover:shadow-lg transition-all border-2 border-dashed border-slate-200 hover:border-primary"
                                        >
                                            <span className="text-2xl mb-2">👀</span>
                                            <span className="text-sm font-medium text-slate-600">Lihat Semua</span>
                                            <span className="text-xs text-slate-400">+{store.product_count - 4} lainnya</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* All Products Section (Fallback or Search Results) */}
                {((filters.search || stores.length === 0) && products.data.length > 0) && (
                    <>
                        <h2 className="text-lg font-semibold text-slate-800">
                            {filters.search ? `Hasil Pencarian "${filters.search}"` : 'Semua Produk'}
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {products.data.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/marketplace/product/${product.id}`}
                                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all"
                                >
                                    <div className="aspect-square bg-slate-100">
                                        {product.image_path ? (
                                            <img
                                                src={`/storage/${product.image_path}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-sm text-slate-800 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-primary font-bold mt-1">
                                            {formatPrice(Number(product.price))}
                                        </p>
                                        {product.store && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {product.store.name}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Floating AI Shopping Assistant Button */}
            <button
                onClick={() => setShowAIChat(true)}
                className="fixed bottom-32 z-40 group"
                style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
            >
                <div className="relative">
                    {/* Pulse animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-25" />

                    {/* Button */}
                    <div className="relative w-14 h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40 transition-all active:scale-95">
                        <Bot className="w-7 h-7 text-white" />
                    </div>

                    {/* Tooltip - hidden on mobile */}
                    <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            AI Shopping Assistant
                        </p>
                        <p className="text-xs text-muted-foreground">Tanya apa aja!</p>
                    </div>
                </div>
            </button>

            {/* AI Chat Modal/Sheet */}
            {showAIChat && (
                <div className="fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAIChat(false)}
                    />

                    {/* Chat Sheet */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[85vh] bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white flex items-center gap-2">
                                        AI Shopping Assistant
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                    </h2>
                                    <p className="text-white/70 text-xs">Powered by MudaPreneur AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIChat(false)}
                                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%]`}>
                                        {/* Message Bubble */}
                                        <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-card border border-border rounded-bl-md'
                                            }`}>
                                            {message.type === 'ai' && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Bot className="w-4 h-4 text-purple-500" />
                                                    <span className="text-xs font-medium text-purple-500">AI</span>
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
                                                    {message.products.length} produk
                                                </p>
                                                <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                                                    <div className="flex gap-2" style={{ width: 'max-content' }}>
                                                        {message.products.slice(0, 6).map((product) => (
                                                            <Link
                                                                key={product.id}
                                                                href={`/marketplace/product/${product.id}`}
                                                                onClick={() => setShowAIChat(false)}
                                                                className="w-32 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all flex-shrink-0"
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
                                                                            <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute top-1 right-1 bg-purple-500 text-white text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                                        <Sparkles className="w-2 h-2" />
                                                                        AI
                                                                    </div>
                                                                </div>
                                                                <div className="p-2">
                                                                    <p className="font-medium text-foreground text-xs line-clamp-2 leading-tight">
                                                                        {product.name}
                                                                    </p>
                                                                    <p className="text-primary font-bold text-xs mt-1">
                                                                        {formatPrice(Number(product.price))}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Loading */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                                            <span className="text-sm text-muted-foreground">Mencari...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Queries */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2">
                                <p className="text-xs text-muted-foreground mb-2">💡 Coba:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedQueries.map((query, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(query)}
                                            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-100 active:scale-95 transition-all"
                                        >
                                            {query}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-background">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Mau beli apa?"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-muted rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Filter Bottom Sheet */}
            {showFilterSheet && (
                <div className="fixed inset-0 z-[60]">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowFilterSheet(false)}
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Filter & Urutkan</h2>
                            <button
                                onClick={() => setShowFilterSheet(false)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Urutkan Berdasarkan</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            handleSort('latest');
                                            setShowFilterSheet(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentSort === 'latest'
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-card border-border hover:border-primary/50 text-foreground'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSort === 'latest' ? 'bg-blue-100' : 'bg-muted'}`}>
                                                <Clock className={`w-5 h-5 ${currentSort === 'latest' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Terbaru</p>
                                                <p className="text-xs opacity-70">Tampilkan toko yang buka</p>
                                            </div>
                                        </div>
                                        {currentSort === 'latest' && <Check className="w-5 h-5 text-blue-600" />}
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleSort('nearest');
                                            setShowFilterSheet(false);
                                        }}
                                        disabled={isLoadingLocation}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentSort === 'nearest'
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-card border-border hover:border-primary/50 text-foreground'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSort === 'nearest' ? 'bg-green-100' : 'bg-muted'}`}>
                                                {isLoadingLocation ? <Loader2 className="w-5 h-5 animate-spin text-green-600" /> : <MapPin className={`w-5 h-5 ${currentSort === 'nearest' ? 'text-green-600' : 'text-muted-foreground'}`} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Terdekat</p>
                                                <p className="text-xs opacity-70">Dari lokasi Anda saat ini</p>
                                            </div>
                                        </div>
                                        {currentSort === 'nearest' && <Check className="w-5 h-5 text-green-600" />}
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleSort('popular');
                                            setShowFilterSheet(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentSort === 'popular'
                                            ? 'bg-orange-50 border-orange-200 text-orange-700'
                                            : 'bg-card border-border hover:border-primary/50 text-foreground'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSort === 'popular' ? 'bg-orange-100' : 'bg-muted'}`}>
                                                <Flame className={`w-5 h-5 ${currentSort === 'popular' ? 'text-orange-600' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Terlaris</p>
                                                <p className="text-xs opacity-70">Paling banyak dipesan</p>
                                            </div>
                                        </div>
                                        {currentSort === 'popular' && <Check className="w-5 h-5 text-orange-600" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border">
                            <button
                                onClick={() => setShowFilterSheet(false)}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
