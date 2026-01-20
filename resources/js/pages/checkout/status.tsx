import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Order } from '@/types';
import { ArrowLeft, Package, Store, Truck, CheckCircle, Clock, MapPin, Phone, XCircle, AlertTriangle, Copy, MessageCircle, Flag, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReviewModal from '@/components/ReviewModal';
import StarRatingModal from '@/components/StarRatingModal';
import StarDisplay from '@/components/StarDisplay';

interface RatingInfo {
    average: number;
    total: number;
}

interface Props {
    order: Order & { cancellation_code?: string; cancelled_by?: string };
    waitingTooLong?: boolean;
    canReview?: boolean;
    canRate?: boolean;
    canRateCourier?: boolean;
    canRateStore?: boolean;
    courierRating?: RatingInfo | null;
    storeRating?: RatingInfo | null;
}

const statusSteps = [
    { key: 'waiting_verification', label: 'Menunggu Verifikasi', icon: Clock },
    { key: 'processing', label: 'Diproses Penjual', icon: Package },
    { key: 'ready_to_ship', label: 'Siap Dikirim', icon: Store },
    { key: 'on_delivery', label: 'Dalam Pengiriman', icon: Truck },
    { key: 'completed', label: 'Selesai', icon: CheckCircle },
];

export default function OrderStatus({ order, waitingTooLong, canReview, canRate, canRateCourier, canRateStore, courierRating, storeRating }: Props) {
    const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
    const [copied, setCopied] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [hasShownRatingModal, setHasShownRatingModal] = useState(false);
    const { flash } = usePage().props as any;

    const [showCancelModal, setShowCancelModal] = useState(false);

    // ... (keep useEffect for rating modal)
    useEffect(() => {
        if (canRate && order.status === 'completed' && !hasShownRatingModal) {
            // Small delay to let the page render first
            const timer = setTimeout(() => {
                setShowRatingModal(true);
                setHasShownRatingModal(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [canRate, order.status, hasShownRatingModal]);

    const handleCancel = () => {
        router.post(`/orders/${order.id}/cancel`, {}, {
            onSuccess: () => setShowCancelModal(false),
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to format WA number
    const getWaLink = (number: string) => {
        let clean = number.replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.substring(1);
        if (clean.startsWith('8')) clean = '62' + clean;
        return `https://wa.me/${clean}`;
    };

    return (
        <AppLayout activeTab="history" showBottomNav={false}>
            <Head title={`Pesanan ${order.order_number}`} />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/history" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-semibold text-foreground">{order.order_number}</h1>
                    <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Cancellation Receipt */}
                {order.status === 'cancelled' && order.cancellation_code && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <div className="flex items-center gap-2 text-red-600 mb-3">
                            <XCircle className="w-5 h-5" />
                            <h2 className="font-semibold">Pesanan Dibatalkan</h2>
                        </div>
                        <p className="text-sm text-red-800 mb-3">
                            Tunjukkan kode ini ke penjual untuk mengambil uang Anda:
                        </p>
                        <div className="bg-white rounded-xl p-4 text-center border border-red-200">
                            <p className="text-xs text-muted-foreground mb-1">Kode Pembatalan</p>
                            <p className="text-2xl font-mono font-bold text-red-600">{order.cancellation_code}</p>
                            <button
                                onClick={() => copyToClipboard(order.cancellation_code!)}
                                className="mt-2 text-sm text-primary flex items-center gap-1 mx-auto"
                            >
                                <Copy className="w-4 h-4" />
                                {copied ? 'Tersalin!' : 'Salin Kode'}
                            </button>
                        </div>
                        <div className="mt-3 space-y-2">
                            <p className="text-xs text-red-700">
                                📍 Ambil refund di: <strong>{order.store?.address_pickup}</strong>
                            </p>
                        </div>
                    </div>
                )}

                {/* Warning for long wait */}
                {waitingTooLong && order.status === 'waiting_verification' && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">Menunggu Terlalu Lama</span>
                        </div>
                        <p className="text-sm text-amber-800">
                            Pesanan sudah menunggu lebih dari 2 jam. Anda dapat membatalkan dan mengambil refund langsung ke penjual.
                        </p>
                    </div>
                )}

                {/* Digital Order Info */}
                {order.is_digital_order && order.status !== 'cancelled' && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Package className="w-5 h-5" />
                            <span className="font-medium">Pesanan Produk Digital</span>
                        </div>
                        <p className="text-sm text-blue-800">
                            Produk digital akan dikoordinasikan langsung dengan penjual.
                            Silakan hubungi penjual melalui WhatsApp untuk proses pengiriman produk digital Anda.
                        </p>
                        {(order.store?.contact_number || order.store?.owner?.phone) && (
                            <a
                                href={`${getWaLink(order.store.contact_number || order.store.owner?.phone || '')}?text=Halo, saya ingin mengklaim produk digital untuk pesanan ${order.order_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 w-full py-2 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors text-sm"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat Penjual untuk Klaim Produk
                            </a>
                        )}
                    </div>
                )}

                {/* Status Progress */}
                {order.status !== 'cancelled' && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-4">Status Pesanan</h2>
                        <div className="space-y-4">
                            {statusSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index <= currentStepIndex;
                                const isCurrent = step.key === order.status;

                                return (
                                    <div key={step.key} className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent
                                                ? 'bg-primary text-white'
                                                : isActive
                                                    ? 'bg-success/20 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={`font-medium ${isCurrent ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                        {isActive && index < currentStepIndex && (
                                            <CheckCircle className="w-5 h-5 text-success" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Action Buttons for Waiting Verification */}
                {order.status === 'waiting_verification' && (
                    <div className="grid grid-cols-2 gap-3">
                        {/* Cancel Button */}
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 border border-red-100 hover:bg-red-100 transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                            Batalkan
                        </button>

                        {/* WhatsApp Button */}
                        {(order.store?.contact_number || order.store?.owner?.phone) && (
                            <a
                                href={`${getWaLink(order.store.contact_number || order.store.owner?.phone || '')}?text=Halo, saya ingin menanyakan pesanan ${order.order_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat Toko
                            </a>
                        )}
                        {/* Fallback if no specific contact info but showing button to keep grid balanced? No, better to let cancel take full width if no phone. */}
                        {!order.store?.contact_number && !order.store?.owner?.phone && (
                            <div className="hidden"></div>
                        )}
                    </div>
                )}
                {/* Adjust grid if only one item */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .grid-cols-2:has(> .hidden) { grid-template-columns: 1fr; }
                 `}} />



                {/* Courier Info (during delivery or completed) */}
                {order.courier && (order.status === 'on_delivery' || order.status === 'ready_to_ship' || order.status === 'completed') && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3">
                            {order.status === 'completed' ? 'Diantar oleh' : 'Info Kurir'}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'}`}>
                                <Truck className={`w-6 h-6 ${order.status === 'completed' ? 'text-success' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{order.courier.name}</p>
                                {courierRating && courierRating.total > 0 ? (
                                    <StarDisplay rating={courierRating.average} totalRatings={courierRating.total} size="sm" />
                                ) : (
                                    <p className="text-sm text-muted-foreground">{order.courier.wa_number || 'Kurir'}</p>
                                )}
                            </div>
                            {order.courier.wa_number && (
                                <a
                                    href={`https://wa.me/${order.courier.wa_number.replace(/^0/, '62')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-success text-white rounded-xl"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Shipping Address */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Patokan Pengiriman
                    </h2>
                    <p className="text-sm text-foreground">{order.shipping_address}</p>
                </div>

                {/* Store Info */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Toko
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">{order.store?.name}</p>
                            {storeRating && storeRating.total > 0 ? (
                                <StarDisplay rating={storeRating.average} totalRatings={storeRating.total} size="sm" />
                            ) : (
                                <p className="text-sm text-muted-foreground">{order.store?.address_pickup}</p>
                            )}
                        </div>
                        {/* Button Contact if not waiting_verification (e.g. processing/completed) */}
                        {(order.status !== 'waiting_verification' && order.store?.contact_number) && (
                            <a
                                href={`${getWaLink(order.store.contact_number)}?text=Halo, saya ingin menanyakan pesanan ${order.order_number}`}
                                target="_blank"
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                    {storeRating && storeRating.total > 0 && order.store?.address_pickup && (
                        <p className="text-sm text-muted-foreground mt-2 pl-15">{order.store?.address_pickup}</p>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Daftar Pesanan
                    </h2>
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                            <div>
                                <p className="font-medium text-foreground">{item.product?.name}</p>
                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                            </div>
                            <p className="font-medium text-foreground">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                        </div>
                    ))}

                    {/* Fee Breakdown */}
                    <div className="pt-3 mt-3 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal Produk</span>
                            <span className="font-medium">Rp {((order.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0)).toLocaleString('id-ID')}</span>
                        </div>

                        {Number(order.admin_fee || 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Biaya Layanan Aplikasi</span>
                                <span className="font-medium">Rp {Number(order.admin_fee).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {(Number(order.total_amount) - ((order.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0)) - Number(order.admin_fee || 0)) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Biaya Layanan QRIS Toko</span>
                                <span className="font-medium">
                                    Rp {(Number(order.total_amount) - ((order.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0)) - Number(order.admin_fee || 0)).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ongkos Kirim</span>
                            <span className="font-medium">
                                {order.shipping_discount && order.shipping_discount > 0 ? (
                                    <>
                                        <span className="line-through text-muted-foreground mr-2">
                                            Rp {Number(order.courier_fee).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-success">
                                            Rp {Math.max(0, Number(order.courier_fee) - order.shipping_discount).toLocaleString('id-ID')}
                                        </span>
                                    </>
                                ) : (
                                    `Rp ${Number(order.courier_fee).toLocaleString('id-ID')}`
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between pt-3 mt-2 border-t border-border">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-bold text-primary text-lg">
                            Rp {(Number(order.total_amount) + Math.max(0, Number(order.courier_fee) - (order.shipping_discount || 0))).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* Promo Used */}
                {order.promo_code_used && (
                    <div className="bg-success/10 rounded-2xl p-4 border border-success/20 text-center">
                        <p className="text-sm text-success">
                            Kode promo <strong>{order.promo_code_used}</strong> digunakan 🎉
                        </p>
                    </div>
                )}

                {/* Report Issue Button - for completed orders */}
                {order.status === 'completed' && (
                    <Link
                        href={`/complaints/create/${order.id}`}
                        className="w-full py-3 bg-muted text-muted-foreground rounded-2xl font-medium flex items-center justify-center gap-2"
                    >
                        <Flag className="w-4 h-4" />
                        Laporkan Masalah
                    </Link>
                )}

                {/* Review Prompt for Completed Orders */}
                {canReview && order.status === 'completed' && !order.review && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">Bagaimana pengalaman belanja Anda?</h3>
                                <p className="text-sm text-slate-600">Bantu pembeli lain dengan memberikan review</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                            Berikan Review Sekarang
                        </button>
                    </div>
                )}

                {/* Thank You Message After Review */}
                {order.status === 'completed' && order.review && (
                    <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-green-800 mb-1">Terima Kasih!</h3>
                        <p className="text-sm text-green-700">Review Anda telah membantu pembeli lain 🎉</p>
                    </div>
                )}

                {/* Emergency Contact Info */}
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-800 text-center">
                            <strong>⚠️ Darurat:</strong> Jika ada masalah dengan pesanan, hubungi admin di{' '}
                            <a href="https://wa.me/6287827718245" target="_blank" rel="noopener noreferrer" className="font-bold underline">
                                0878-2771-8245
                            </a>
                        </p>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="bg-white relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                            Batalkan Pesanan?
                        </h3>
                        <p className="text-center text-slate-500 mb-6 text-sm">
                            Apakah Anda yakin ingin membatalkan pesanan ini? <br />
                            <span className="font-medium text-red-500 block mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                                ⚠️ Anda perlu mengambil refund uang secara manual ke penjual.
                            </span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="py-3 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleCancel}
                                className="py-3 px-4 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                            >
                                Ya, Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {order.store && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    orderId={order.id}
                    storeName={order.store.name}
                />
            )}

            {/* Star Rating Modal */}
            {showRatingModal && order.store && (
                <StarRatingModal
                    orderId={order.id}
                    storeName={order.store.name}
                    courierName={order.courier?.name}
                    hasCourier={!!order.courier_id}
                    canRateCourier={canRateCourier || false}
                    canRateStore={canRateStore || false}
                    onClose={() => setShowRatingModal(false)}
                />
            )}
        </AppLayout>
    );
}
