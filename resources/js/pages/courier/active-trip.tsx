import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Order } from '@/types';
import { MapPin, Store, Truck, Phone, Navigation, MessageCircle, XCircle, Loader2, ArrowRight, CheckCircle, Package, Zap, Bot, Sparkles, ArrowLeft, ImageIcon, X } from 'lucide-react';
import { SwipeButton } from '@/components/ui/SwipeButton';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    order: Order | null;
}

export default function CourierActiveTrip({ order }: Props) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const openImagePreview = (imagePath: string) => {
        setPreviewImage(imagePath);
        setShowImageModal(true);
    };

    if (!order) {
        return (
            <AppLayout activeTab="active">
                <Head title="Pengiriman Aktif" />

                <div className="px-4 pt-6">
                    <h1 className="text-xl font-bold text-foreground mb-4">Pengiriman Aktif</h1>
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                            Tidak ada pengiriman aktif
                        </p>
                        <button
                            onClick={() => router.visit('/courier/radar')}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <Zap className="w-5 h-5" />
                            Cari Pesanan
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const isPickupPhase = order.courier_status === 'driver_assigned' || order.courier_status === 'pickup_otw';
    const isDeliveryPhase = order.courier_status === 'delivery_otw';

    const openMaps = (address: string, lat?: number, lng?: number) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }
    };

    const handlePickupOtw = () => {
        setIsLoading('pickup-otw');
        router.post(`/courier/orders/${order.id}/pickup-otw`, {}, {
            onSuccess: () => {
                toast.success('🚗 Status diperbarui: Menuju toko');
            },
            onFinish: () => setIsLoading(null)
        });
    };

    const handlePickedUp = () => {
        setIsLoading('picked-up');
        router.post(`/courier/orders/${order.id}/picked-up`, {}, {
            onSuccess: () => {
                toast.success('📦 Barang sudah diambil! Segera antar ke pembeli');
            },
            onFinish: () => setIsLoading(null)
        });
    };

    const handleComplete = () => {
        setIsLoading('complete');
        router.post(`/courier/orders/${order.id}/complete`, {}, {
            onSuccess: () => {
                toast.success('🎉 Pengiriman selesai! Komisi telah ditambahkan ke wallet');
            },
            onFinish: () => setIsLoading(null)
        });
    };

    const handleCancel = () => {
        setIsCancelling(true);
        router.post(`/courier/orders/${order.id}/cancel`, {}, {
            onSuccess: () => {
                toast.info('Pesanan dikembalikan ke radar');
            },
            onFinish: () => {
                setConfirmCancel(false);
                setIsCancelling(false);
            }
        });
    };

    const openWhatsApp = (phone: string, name: string) => {
        const message = `Halo ${name}, saya kurir dari MudaPreneur untuk pesanan ${order.order_number}`;
        window.open(`https://wa.me/${phone.replace(/^0/, '62')}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success('Membuka WhatsApp...');
    };

    // Progress indicator
    const progressSteps = [
        { id: 'assigned', label: 'Ditugaskan', done: true },
        { id: 'pickup', label: 'Jemput', done: order.courier_status !== 'driver_assigned' },
        { id: 'delivery', label: 'Antar', done: order.courier_status === 'delivery_otw' },
    ];

    return (
        <AppLayout activeTab="active" showBottomNav={false}>
            <Head title="Pengiriman Aktif" />

            {/* Image Preview Modal */}
            {showImageModal && previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg animate-in zoom-in-95 duration-200"
                    />
                </div>
            )}

            {/* Status Header */}
            <div className={`px-4 pt-6 pb-8 transition-all duration-500 ${isPickupPhase ? 'bg-gradient-to-br from-primary to-blue-600' : 'bg-gradient-to-br from-success to-emerald-600'}`}>
                {/* Back Button */}
                <Link href="/courier/radar" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali ke Radar</span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPickupPhase ? 'bg-white/20' : 'bg-white/20'}`}>
                        {isPickupPhase ? (
                            <Store className="w-7 h-7 text-white" />
                        ) : (
                            <Truck className="w-7 h-7 text-white" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {isPickupPhase ? 'Menuju Toko' : 'Mengantar Pesanan'}
                        </h1>
                        <p className="text-white/80">{order.order_number}</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mt-6">
                    {progressSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.done ? 'bg-white text-primary' : 'bg-white/30 text-white/60'
                                }`}>
                                {step.done ? <CheckCircle className="w-5 h-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                            </div>
                            <span className={`ml-2 text-sm font-medium ${step.done ? 'text-white' : 'text-white/60'}`}>
                                {step.label}
                            </span>
                            {index < progressSteps.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-white/40 mx-2" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Info */}
            <div className="px-4 py-4 space-y-4 mt-2">
                {/* Pickup Location */}
                <div className={`rounded-2xl p-4 border-2 transition-all duration-300 ${isPickupPhase
                    ? 'border-primary bg-gradient-to-r from-primary/5 to-blue-50 shadow-lg shadow-primary/10'
                    : 'border-border bg-card'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPickupPhase ? 'bg-primary' : 'bg-muted'}`}>
                            <MapPin className={`w-4 h-4 ${isPickupPhase ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="font-bold text-foreground">Ambil di</span>
                        {isPickupPhase && <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full animate-pulse">AKTIF</span>}
                    </div>

                    {/* Store Photo if available */}
                    {order.store?.store_photo_path && (
                        <>
                            <button
                                onClick={() => openImagePreview(`/storage/${order.store?.store_photo_path}`)}
                                className="w-full mb-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-border"
                            >
                                <ImageIcon className="w-4 h4" />
                                Lihat Foto Toko
                            </button>
                        </>
                    )}

                    <p className="font-bold text-foreground text-lg">{order.store?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{order.store?.address_pickup}</p>

                    <div className="flex gap-2 mt-4">
                        {isPickupPhase && (
                            <button
                                onClick={() => openMaps(order.store?.address_pickup || '')}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Navigation className="w-5 h-5" />
                                Buka Peta
                            </button>
                        )}
                        {/* Chat Store - use contact_number or fallback to owner phone */}
                        {(order.store?.contact_number || order.store?.owner?.wa_number) && (
                            <button
                                onClick={() => openWhatsApp(order.store?.contact_number || order.store?.owner?.wa_number || '', order.store?.name || 'Toko')}
                                className="py-3 px-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat Toko
                            </button>
                        )}
                    </div>
                </div>

                {/* Delivery Location */}
                <div className={`rounded-2xl p-4 border-2 transition-all duration-300 ${isDeliveryPhase
                    ? 'border-success bg-gradient-to-r from-success/5 to-emerald-50 shadow-lg shadow-success/10'
                    : 'border-border bg-card'
                    }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDeliveryPhase ? 'bg-success' : 'bg-muted'}`}>
                            <Truck className={`w-4 h-4 ${isDeliveryPhase ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="font-bold text-foreground">Antar ke</span>
                        {isDeliveryPhase && <span className="ml-auto text-xs bg-success text-white px-2 py-1 rounded-full animate-pulse">AKTIF</span>}
                    </div>
                    <p className="font-bold text-foreground text-lg">{order.buyer?.name}</p>
                    {order.buyer?.wa_number && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {order.buyer.wa_number}
                        </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{order.shipping_address}</p>

                    <div className="flex gap-2 mt-4">
                        {isDeliveryPhase && (
                            <button
                                onClick={() => openMaps(order.shipping_address, order.shipping_lat, order.shipping_lng)}
                                className="flex-1 py-3 bg-gradient-to-r from-success to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-success/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Navigation className="w-5 h-5" />
                                Buka Peta
                            </button>
                        )}
                        {order.buyer?.wa_number && (
                            <button
                                onClick={() => openWhatsApp(order.buyer?.wa_number || '', order.buyer?.name || '')}
                                className="py-3 px-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <MessageCircle className="w-5 h-5" />
                                WA
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-bold text-foreground">Daftar Barang</h3>
                    </div>
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm py-3 border-b border-border last:border-0">
                            <span className="text-foreground font-medium">{item.product?.name} x{item.quantity}</span>
                            <span className="text-muted-foreground">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                        </div>
                    ))}
                </div>

                {/* Earnings */}
                <div className="bg-gradient-to-r from-success/10 to-emerald-50 rounded-2xl p-4 border-2 border-success/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-muted-foreground text-sm">Komisi Anda</span>
                            <p className="text-success font-bold text-2xl">
                                +Rp {order.courier_fee.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                            <Zap className="w-6 h-6 text-success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-background/95 backdrop-blur-sm border-t border-border space-y-3 z-50">
                {order.courier_status === 'driver_assigned' && (
                    <button
                        onClick={handlePickupOtw}
                        disabled={isLoading === 'pickup-otw'}
                        className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                    >
                        {isLoading === 'pickup-otw' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <Truck className="w-5 h-5" />
                                Saya Menuju Toko
                            </>
                        )}
                    </button>
                )}

                {order.courier_status === 'pickup_otw' && (
                    <button
                        onClick={handlePickedUp}
                        disabled={isLoading === 'picked-up'}
                        className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
                    >
                        {isLoading === 'picked-up' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <Package className="w-5 h-5" />
                                Barang Sudah Diambil
                            </>
                        )}
                    </button>
                )}

                {order.courier_status === 'delivery_otw' && (
                    <SwipeButton
                        onSuccess={handleComplete}
                        label="Geser untuk selesaikan"
                        successLabel="🎉 Pengiriman Selesai!"
                    />
                )}

                {/* Cancel Button */}
                {order.courier_status !== 'delivered' && (
                    <button
                        type="button"
                        disabled={isCancelling}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirmCancel) {
                                handleCancel();
                            } else {
                                setConfirmCancel(true);
                                toast.warning('Tekan sekali lagi untuk konfirmasi pembatalan');
                                setTimeout(() => setConfirmCancel(false), 3000);
                            }
                        }}
                        className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${confirmCancel
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200 animate-pulse'
                            : 'bg-red-50 text-red-500 hover:bg-red-100'
                            } ${isCancelling ? 'opacity-70' : ''}`}
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Membatalkan...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />
                                {confirmCancel ? 'Tekan Lagi untuk Konfirmasi' : 'Batalkan & Kembalikan ke Radar'}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Floating AI Insights Button */}
            {/* Bottom spacing */}
            <div className="h-32" />
        </AppLayout>
    );
}
