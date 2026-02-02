import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Order } from '@/types';
import { ArrowLeft, Check, X, Package, User, MapPin, Truck, Clock, Phone, MessageCircle, AlertCircle } from 'lucide-react';

interface Props {
    order: Order;
}

export default function UmkmOrderDetail({ order }: Props) {
    const verifyOrder = () => {
        router.post(`/umkm/orders/${order.id}/verify`);
    };

    const markReady = () => {
        router.post(`/umkm/orders/${order.id}/ready`);
    };

    const completeDigital = () => {
        router.post(`/umkm/orders/${order.id}/complete-digital`);
    };

    const openWhatsApp = (phone: string, name: string, context: 'buyer' | 'courier') => {
        const message = context === 'buyer'
            ? `Halo ${name}, ini dari ${order.store?.name || 'Toko'} mengenai pesanan ${order.order_number}.`
            : `Halo ${name}, ini dari ${order.store?.name || 'Toko'}. Pesanan ${order.order_number} sudah siap diambil.`;
        window.open(`https://wa.me/${phone.replace(/^0/, '62')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Check if this is a digital order (no courier needed)
    const isDigitalOrder = order.is_digital_order || order.courier_status === 'not_required';

    const [showImageModal, setShowImageModal] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const openPreview = (imagePath: string) => {
        setPreviewImage(imagePath);
        setShowImageModal(true);
    };

    const [showRejectModal, setShowRejectModal] = React.useState(false);

    const rejectOrder = () => {
        router.post(`/umkm/orders/${order.id}/reject`, {}, {
            onFinish: () => setShowRejectModal(false),
        });
    };

    return (
        <AppLayout activeTab="orders" showBottomNav={false}>
            <Head title={`Pesanan ${order.order_number}`} />

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

            {/* Reject Confirmation Modal */}
            {
                showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tolak Pesanan?</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Pesanan akan dibatalkan dan stok produk akan dikembalikan otomatis. Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setShowRejectModal(false)}
                                        className="py-2.5 px-4 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={rejectOrder}
                                        className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Ya, Tolak
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/umkm/orders" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-semibold text-foreground">{order.order_number}</h1>
                    <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* Status Badge */}
                <div className={`rounded-2xl p-4 ${order.status === 'waiting_verification' ? 'bg-warning/10' :
                    order.status === 'processing' ? 'bg-primary/10' :
                        order.status === 'completed' ? 'bg-success/10' :
                            order.status === 'cancelled' ? 'bg-red-50' : 'bg-muted'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Clock className={`w-5 h-5 ${order.status === 'waiting_verification' ? 'text-warning' :
                            order.status === 'processing' ? 'text-primary' :
                                order.status === 'completed' ? 'text-success' :
                                    order.status === 'cancelled' ? 'text-red-500' : 'text-muted-foreground'
                            }`} />
                        <div>
                            <p className="font-medium text-foreground">
                                {order.status === 'waiting_verification' && 'Menunggu Verifikasi'}
                                {order.status === 'processing' && 'Sedang Diproses'}
                                {order.status === 'ready_to_ship' && 'Siap Dikirim'}
                                {order.status === 'on_delivery' && 'Dalam Pengiriman'}
                                {order.status === 'completed' && 'Pesanan Selesai'}
                                {order.status === 'cancelled' && 'Pesanan Dibatalkan'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {order.status === 'waiting_verification' && 'Verifikasi bukti pembayaran'}
                                {order.status === 'processing' && 'Siapkan pesanan pelanggan'}
                                {order.status === 'ready_to_ship' && 'Menunggu kurir mengambil'}
                                {order.status === 'cancelled' && 'Stok produk telah dikembalikan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Proof */}
                {order.status === 'waiting_verification' && order.payment_proof_path && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Bukti Pembayaran
                        </h3>
                        <div
                            onClick={() => openPreview(`/umkm/proofs/${order.payment_proof_path?.split('/').pop()}`)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-border"
                        >
                            <img
                                src={`/umkm/proofs/${order.payment_proof_path?.split('/').pop()}`}
                                alt="Bukti Pembayaran"
                                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full transition-opacity flex items-center gap-1.5">
                                    <Package className="w-3 h-3" />
                                    Lihat Preview
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buyer Info */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Pembeli
                    </h3>
                    <p className="font-medium text-foreground">{order.buyer?.name}</p>
                    {order.buyer?.wa_number && (
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {order.buyer.wa_number}
                            </p>
                            <button
                                onClick={() => openWhatsApp(order.buyer?.wa_number || '', order.buyer?.name || '', 'buyer')}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                                <MessageCircle className="w-3 h-3" />
                                WhatsApp
                            </button>
                        </div>
                    )}
                </div>

                {/* Courier Info */}
                {order.courier && (
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Kurir
                        </h3>
                        <p className="font-medium text-foreground">{order.courier.name}</p>
                        {order.courier.wa_number && (
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {order.courier.wa_number}
                                </p>
                                <button
                                    onClick={() => openWhatsApp(order.courier?.wa_number || '', order.courier?.name || '', 'courier')}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                                >
                                    <MessageCircle className="w-3 h-3" />
                                    WhatsApp
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Status: {order.courier_status === 'pickup_otw' ? 'Menuju toko' :
                                order.courier_status === 'delivery_otw' ? 'Mengantar' :
                                    order.courier_status === 'delivered' ? 'Terkirim' : 'Ditugaskan'}
                        </p>
                    </div>
                )}

                {/* Shipping Address */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Patokan Pengiriman
                    </h3>
                    <p className="text-sm text-foreground">{order.shipping_address}</p>
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Daftar Produk
                    </h3>
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                            <div>
                                <p className="font-medium text-foreground">{item.product?.name}</p>
                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                            </div>
                            <p className="font-medium text-foreground">
                                Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                            </p>
                        </div>
                    ))}
                    <div className="space-y-2 pt-3 mt-3 border-t border-border">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal Produk</span>
                            <span>Rp {(order.items || []).reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0).toLocaleString('id-ID')}</span>
                        </div>

                        {(Number(order.admin_fee || 0) > 0) && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Biaya Layanan (App)</span>
                                <span>Rp {Number(order.admin_fee || 0).toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        {/* Calculate Store Admin Fee (Total - Subtotal - AppAdminFee) */}
                        {(Number(order.total_amount) - (order.items || []).reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0) - (Number(order.admin_fee) || 0)) > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Biaya Admin Toko</span>
                                <span>
                                    Rp {(
                                        Number(order.total_amount) -
                                        (order.items || []).reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0) -
                                        (Number(order.admin_fee) || 0)
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-border/50">
                            <span className="text-foreground">Total Transfer</span>
                            <span className="text-primary">
                                Rp {Number(order.total_amount).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Affiliate Info */}
                {order.promo_code_used && (
                    <div className="bg-success/10 rounded-2xl p-4 border border-success/20">
                        <p className="text-sm text-success">
                            Menggunakan kode promo: <strong>{order.promo_code_used}</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-background border-t border-border">
                {order.status === 'waiting_verification' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                            Tolak
                        </button>
                        <button
                            onClick={verifyOrder}
                            className="flex-[2] py-4 bg-success text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Terima Pesanan
                        </button>
                    </div>
                )}

                {order.status === 'processing' && !isDigitalOrder && (
                    <button
                        onClick={markReady}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                    >
                        <Truck className="w-5 h-5" />
                        Siap Kirim
                    </button>
                )}

                {order.status === 'processing' && isDigitalOrder && (
                    <button
                        onClick={completeDigital}
                        className="w-full py-4 bg-success text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Selesaikan Pesanan
                    </button>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-24"></div>
        </AppLayout >
    );
}
