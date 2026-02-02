import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Props {
    affiliateCode: string | null;
}

export default function AffiliateShare({ affiliateCode }: Props) {
    const [copied, setCopied] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: affiliateCode || '',
    });

    const copyCode = () => {
        if (affiliateCode) {
            navigator.clipboard.writeText(affiliateCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareToWhatsApp = () => {
        if (affiliateCode) {
            const message = encodeURIComponent(
                `🎉 Gunakan kode promo "${affiliateCode}" untuk belanja di MUDAPRENEUR.AI dan dapatkan harga spesial!\n\n👉 Kunjungi sekarang!`
            );
            window.open(`https://wa.me/?text=${message}`, '_blank');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/affiliate/code');
    };

    return (
        <AppLayout activeTab="share">
            <Head title="Bagikan Kode Promo" />

            {/* Header */}
            <div className="px-4 pt-6 pb-6 bg-gradient-to-br from-primary to-secondary">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Bagikan & Dapatkan</h1>
                        <p className="text-white/80 text-sm">Rp 1.000 per transaksi!</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Current Code Display */}
                {affiliateCode ? (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <p className="text-sm text-muted-foreground mb-2">Kode Promo Anda</p>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-primary tracking-wider flex-1">
                                {affiliateCode}
                            </span>
                            <button
                                onClick={copyCode}
                                className="p-3 bg-primary/10 rounded-xl"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-success" />
                                ) : (
                                    <Copy className="w-5 h-5 text-primary" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Code Generator Form */
                    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-4 border border-border">
                        <p className="text-sm text-muted-foreground mb-3">Buat Kode Promo Anda</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="KODEKAMU"
                                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-lg font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                                maxLength={20}
                            />
                            <button
                                type="submit"
                                disabled={processing || !data.code}
                                className="px-4 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
                            >
                                {processing ? '...' : 'Buat'}
                            </button>
                        </div>
                        {errors.code && (
                            <p className="text-sm text-destructive mt-2">{errors.code}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Gunakan huruf dan angka, 4-20 karakter
                        </p>
                    </form>
                )}

                {/* Share Buttons */}
                {affiliateCode && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <p className="text-sm font-medium text-foreground mb-3">Bagikan ke Teman</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={shareToWhatsApp}
                                className="flex items-center justify-center gap-2 py-3 bg-success text-white rounded-xl font-medium"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp
                            </button>
                            <button
                                onClick={copyCode}
                                className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium"
                            >
                                <Copy className="w-5 h-5" />
                                Salin Link
                            </button>
                        </div>
                    </div>
                )}

                {/* How It Works */}
                <div className="bg-success/5 rounded-2xl p-4 border border-success/20">
                    <h3 className="font-medium text-foreground mb-3">💰 Cara Kerja</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>1. Bagikan kode promo ke teman</p>
                        <p>2. Teman checkout menggunakan kode Anda</p>
                        <p>3. Penjual memverifikasi pesanan</p>
                        <p>4. Kurir menyelesaikan pengiriman</p>
                        <p className="text-success font-medium">5. Anda dapat Rp 1.000!</p>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                    <h3 className="font-medium text-foreground mb-2">💡 Tips</h3>
                    <p className="text-sm text-muted-foreground">
                        Buat kode promo yang mudah diingat! Gunakan nama, inisial, atau kata favorit Anda.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
