import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Star, Truck, Store, X, Sparkles, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StarRatingModalProps {
    orderId: number;
    storeName: string;
    courierName?: string;
    hasCourier: boolean;
    canRateCourier: boolean;
    canRateStore: boolean;
    onClose: () => void;
}

export default function StarRatingModal({
    orderId,
    storeName,
    courierName,
    hasCourier,
    canRateCourier,
    canRateStore,
    onClose
}: StarRatingModalProps) {
    const [courierRating, setCourierRating] = useState<number>(0);
    const [storeRating, setStoreRating] = useState<number>(0);
    const [courierHover, setCourierHover] = useState<number>(0);
    const [storeHover, setStoreHover] = useState<number>(0);
    const [courierComment, setCourierComment] = useState('');
    const [storeComment, setStoreComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!courierRating && !storeRating) {
            toast.error('Pilih minimal satu rating!');
            return;
        }

        setIsSubmitting(true);

        router.post(`/orders/${orderId}/rate`, {
            courier_rating: courierRating || null,
            courier_comment: courierComment || null,
            store_rating: storeRating || null,
            store_comment: storeComment || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Terima kasih atas penilaian Anda! ⭐');
                onClose();
            },
            onError: () => {
                toast.error('Gagal mengirim rating');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const renderStars = (
        rating: number,
        hover: number,
        setRating: (n: number) => void,
        setHover: (n: number) => void
    ) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1 transition-all hover:scale-125 active:scale-95"
                    >
                        <Star
                            className={`w-8 h-8 transition-all duration-200 ${star <= (hover || rating)
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                                    : 'text-muted-foreground/30'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingLabel = (rating: number) => {
        const labels = ['', 'Buruk 😞', 'Kurang 😕', 'Cukup 😐', 'Baik 😊', 'Luar Biasa! 🤩'];
        return labels[rating] || '';
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-gradient-to-b from-card to-card/95 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-5 text-center">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Bagaimana Pengalaman Anda?</h2>
                    <p className="text-white/80 text-sm mt-1">Rating Anda sangat berarti bagi kami!</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Courier Rating */}
                    {hasCourier && canRateCourier && (
                        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Kurir</p>
                                    <p className="text-sm text-muted-foreground">{courierName || 'Pengantar pesanan'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 py-2">
                                {renderStars(courierRating, courierHover, setCourierRating, setCourierHover)}
                                {courierRating > 0 && (
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-in fade-in duration-200">
                                        {getRatingLabel(courierRating)}
                                    </p>
                                )}
                            </div>

                            {courierRating > 0 && (
                                <textarea
                                    value={courierComment}
                                    onChange={(e) => setCourierComment(e.target.value)}
                                    placeholder="Tulis komentar untuk kurir (opsional)..."
                                    className="w-full mt-2 p-3 bg-background border border-border rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    rows={2}
                                />
                            )}
                        </div>
                    )}

                    {/* Store Rating */}
                    {canRateStore && (
                        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-2xl p-4 border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Toko</p>
                                    <p className="text-sm text-muted-foreground">{storeName}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 py-2">
                                {renderStars(storeRating, storeHover, setStoreRating, setStoreHover)}
                                {storeRating > 0 && (
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in duration-200">
                                        {getRatingLabel(storeRating)}
                                    </p>
                                )}
                            </div>

                            {storeRating > 0 && (
                                <textarea
                                    value={storeComment}
                                    onChange={(e) => setStoreComment(e.target.value)}
                                    placeholder="Tulis komentar untuk toko (opsional)..."
                                    className="w-full mt-2 p-3 bg-background border border-border rounded-xl text-sm resize-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    rows={2}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!courierRating && !storeRating)}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Mengirim...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Kirim Rating
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
