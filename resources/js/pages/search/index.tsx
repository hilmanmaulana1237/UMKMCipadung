import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Bot, Send, User, Sparkles, Lightbulb, TrendingUp, Store } from 'lucide-react';
import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    { icon: Lightbulb, text: 'Bagaimana cara memulai bisnis UMKM?' },
    { icon: TrendingUp, text: 'Tips meningkatkan penjualan online' },
    { icon: Store, text: 'Strategi marketing untuk UMKM' },
    { icon: Sparkles, text: 'Ide bisnis modal kecil 2024' },
];

// Simulated AI responses (in production, connect to real AI API)
const getAIResponse = (message: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerMsg = message.toLowerCase();

            if (lowerMsg.includes('memulai') || lowerMsg.includes('bisnis')) {
                resolve(`🚀 **Tips Memulai Bisnis UMKM:**

1. **Identifikasi Passion & Keahlian** - Pilih bidang yang Anda kuasai dan sukai
2. **Riset Pasar** - Pelajari target konsumen dan kompetitor
3. **Siapkan Modal Awal** - Mulai dari yang kecil, bisa dari tabungan atau pinjaman keluarga
4. **Daftar Legalitas** - Urus NIB (Nomor Induk Berusaha) secara online di OSS
5. **Bangun Kehadiran Digital** - Buat akun media sosial dan daftar di marketplace

💡 Dengan MUDAPRENEUR.AI, Anda bisa langsung jualan dengan mendaftar sebagai UMKM!`);
            } else if (lowerMsg.includes('penjualan') || lowerMsg.includes('sales')) {
                resolve(`📈 **Tips Meningkatkan Penjualan Online:**

1. **Foto Produk Berkualitas** - Gunakan pencahayaan yang baik dan background bersih
2. **Deskripsi Menarik** - Tulis manfaat produk, bukan hanya spesifikasi
3. **Harga Kompetitif** - Riset harga pasar sebelum menentukan harga
4. **Respons Cepat** - Balas chat pelanggan dalam hitungan menit
5. **Promo & Diskon** - Buat promo menarik di momen tertentu
6. **Review Positif** - Minta pelanggan puas untuk memberi rating

🎯 Pro tip: Manfaatkan fitur affiliator di MUDAPRENEUR.AI untuk memperluas jangkauan!`);
            } else if (lowerMsg.includes('marketing') || lowerMsg.includes('promosi')) {
                resolve(`📣 **Strategi Marketing UMKM:**

1. **Social Media Marketing**
   - Instagram: Konten visual produk
   - TikTok: Video pendek behind the scenes
   - WhatsApp: Broadcast promo ke pelanggan

2. **Word of Mouth**
   - Minta pelanggan merekomendasikan
   - Beri insentif untuk referral

3. **Local SEO**
   - Daftar Google My Business
   - Minta review di Google Maps

4. **Kolaborasi**
   - Kerjasama dengan influencer lokal
   - Partnership dengan UMKM lain

💰 Budget terbatas? Fokus ke konten organik di media sosial!`);
            } else if (lowerMsg.includes('ide') || lowerMsg.includes('modal kecil')) {
                resolve(`💡 **Ide Bisnis Modal Kecil 2024:**

**Kuliner:**
- Frozen food homemade (modal ~500rb)
- Rice bowl / meal prep (modal ~1jt)
- Kue kering / cookies (modal ~300rb)

**Kriya:**
- Aksesoris handmade (modal ~200rb)
- Lilin aromaterapi (modal ~500rb)
- Hampers custom (modal ~500rb)

**Jasa:**
- Jastip (jasa titip belanja)
- Admin online shop freelance
- Les privat / kursus online

🌟 Pilih yang sesuai passion Anda dan mulai dari skala kecil!`);
            } else if (lowerMsg.includes('halo') || lowerMsg.includes('hai') || lowerMsg.includes('hi')) {
                resolve(`Halo! 👋 Saya adalah asisten AI MUDAPRENEUR.AI.

Saya siap membantu Anda dengan:
- 🚀 Tips memulai bisnis UMKM
- 📈 Strategi meningkatkan penjualan
- 📣 Marketing & promosi
- 💡 Ide bisnis kreatif

Silakan tanyakan apa saja seputar UMKM!`);
            } else {
                resolve(`Terima kasih atas pertanyaannya! 🤔

Berikut beberapa topik yang bisa saya bantu:
- Cara memulai bisnis UMKM
- Tips meningkatkan penjualan
- Strategi marketing untuk UMKM
- Ide bisnis modal kecil

Silakan tanyakan lebih spesifik ya! 😊`);
            }
        }, 1000 + Math.random() * 1000); // Simulate typing delay
    });
};

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'assistant',
            content: 'Halo! 👋 Saya adalah **Asisten AI MUDAPRENEUR.AI**.\n\nSaya siap membantu Anda dengan berbagai pertanyaan seputar bisnis UMKM. Mulai dari tips memulai usaha, strategi marketing, hingga ide bisnis kreatif.\n\nAda yang bisa saya bantu hari ini?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await getAIResponse(userMessage.content);
            const assistantMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
    };

    return (
        <AppLayout activeTab="chat">
            <Head title="Asisten AI UMKM" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-secondary px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Asisten AI UMKM</h1>
                        <p className="text-white/80 text-xs">Powered by AI • Online 24/7</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: '180px' }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                    ? 'bg-primary text-white'
                                    : 'bg-gradient-to-br from-primary to-secondary text-white'
                                }`}
                        >
                            {msg.role === 'user' ? (
                                <User className="w-4 h-4" />
                            ) : (
                                <Bot className="w-4 h-4" />
                            )}
                        </div>
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-sm'
                                    : 'bg-card border border-border text-foreground rounded-tl-sm'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p
                                className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-muted-foreground'
                                    }`}
                            >
                                {msg.timestamp.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (show only if few messages) */}
            {messages.length <= 2 && !isTyping && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {suggestedQuestions.map((q, i) => {
                            const Icon = q.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestedQuestion(q.text)}
                                    className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-full text-xs text-foreground hover:bg-muted transition-colors"
                                >
                                    <Icon className="w-3 h-3 text-primary" />
                                    {q.text}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t border-border p-4 pb-safe">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tanyakan seputar UMKM..."
                        className="flex-1 px-4 py-3 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
