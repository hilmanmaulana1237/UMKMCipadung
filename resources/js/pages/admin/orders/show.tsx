import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Package,
    User,
    Store,
    Truck,
    MapPin,
    Phone,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    ShieldAlert,
    MessageSquare,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    order: any;
    complaints: any[];
    courierStats: any;
    auth: any;
}

export default function OrderDetail({ order, complaints, courierStats }: Props) {
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        action: '',
        reason: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ready_to_ship': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'on_delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleActionClick = (action: string) => {
        setSelectedAction(action);
        setData('action', action);
        setShowActionModal(true);
    };

    const submitAction = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/orders/${order.id}/resolve`, {
            onSuccess: () => {
                setShowActionModal(false);
                reset();
            }
        });
    };

    const actionLabels: Record<string, string> = {
        'refund_buyer': 'Refund Dana ke Pembeli',
        'force_complete': 'Selesaikan Paksa (Dana ke Penjual/Kurir)',
        'cancel_order': 'Batalkan Pesanan (Tanpa Refund Otomatis)',
    };

    return (
        <AdminLayout title={`Detail Pesanan #${order.order_number}`}>
            <Head title={`Order #${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/orders" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                Order #{order.order_number}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Dibuat pada {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                    </div>
                </div>

                {/* Identity Cards (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Buyer Card */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold">Pembeli</h3>
                                <p className="text-xs text-muted-foreground">Penerima Barang</p>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Nama Lengkap</label>
                                <p className="font-medium">{order.buyer?.name || 'Guest'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Kontak</label>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <p>{order.buyer?.wa_number || order.shipping_phone || '-'}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{order.buyer?.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Alamat Pengiriman</label>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">{order.shipping_address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Card */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Store className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold">Toko / Penjual</h3>
                                <p className="text-xs text-muted-foreground">Pengirim Barang</p>
                            </div>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Nama Toko</label>
                                <p className="font-medium">{order.store?.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Kontak Seller</label>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <p>{order.store?.contact_number || order.store?.owner?.wa_number || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Alamat Pesanan Diambil</label>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">{order.store?.address_pickup}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Courier Card */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col h-full relative overflow-hidden">
                        {order.courier ? (
                            <>
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Kurir</h3>
                                        <p className="text-xs text-muted-foreground">Pengantar Barang</p>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">Nama Kurir</label>
                                        <p className="font-medium flex items-center gap-2">
                                            {order.courier.name}
                                            {courierStats && (
                                                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    ★ {courierStats.rating}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">Kontak</label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <p>{order.courier.wa_number || '-'}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{order.courier.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">Status Pengiriman</label>
                                        <span className="inline-block px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
                                            {order.courier_status?.replace('_', ' ') || 'Belum Dijemput'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Truck className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">Belum ada kurir</p>
                                <p className="text-xs text-muted-foreground mt-1">Pesanan menunggu dijemput</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Items & Payment Info - 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Item List */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h2 className="font-bold flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Rincian Barang
                            </h2>
                        </div>
                        <div className="divide-y divide-border">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.image_path ? (
                                            <img src={'/storage/' + item.product.image_path} alt={item.product_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.product_name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </p>
                                        {item.note && (
                                            <p className="text-xs text-orange-600 mt-1 italic">Catatan: "{item.note}"</p>
                                        )}
                                    </div>
                                    <div className="text-right font-bold">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-muted/30 border-t border-border space-y-4">
                            {/* Calculation Logic */}
                            {(() => {
                                const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                                const adminFee = Number(order.admin_fee || 0);
                                const totalTransfer = Number(order.total_amount);
                                // Use explicit store_fee from DB, fallback to derivation for legacy orders
                                const storeFee = order.store_fee !== undefined && order.store_fee !== null
                                    ? Number(order.store_fee)
                                    : (totalTransfer - subtotal - adminFee);
                                const courierFee = Number(order.courier_fee || 0);

                                return (
                                    <>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm text-gray-800 border-b pb-1">Rincian Pembayaran (Transfer)</h4>

                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <span>Subtotal Produk</span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>

                                            {adminFee > 0 && (
                                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                    <span>Biaya Layanan Aplikasi</span>
                                                    <span>{formatCurrency(adminFee)}</span>
                                                </div>
                                            )}

                                            {storeFee > 0 && (
                                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                    <span>Biaya Layanan Toko</span>
                                                    <span>{formatCurrency(storeFee)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center font-bold text-primary mt-2 bg-blue-50 p-2 rounded-lg">
                                                <span>Total Transfer</span>
                                                <span>{formatCurrency(totalTransfer)}</span>
                                            </div>
                                            <p className="text-[10px] text-center text-muted-foreground italic">
                                                (Nominal yang harus ditransfer buyer ke sistem)
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <h4 className="font-bold text-sm text-gray-800 border-b pb-1">Pembayaran Tunai (Ke Kurir)</h4>

                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <span>Ongkos Kirim</span>
                                                <span>{courierFee > 0 ? formatCurrency(courierFee) : 'Gratis'}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Dispute Resolution Actions */}
                    <div className="space-y-6">
                        {/* Payment Proof Card (Secure) */}
                        {order.payment_proof_path && (
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Bukti Pembayaran
                                </h3>
                                <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
                                    <img
                                        src={`/proofs/${order.payment_proof_path.split('/').pop()}`}
                                        alt="Bukti Transfer"
                                        className="w-full h-auto max-h-[300px] object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
                                        onClick={() => window.open(`/proofs/${order.payment_proof_path.split('/').pop()}`, '_blank')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Klik gambar untuk memperbesar
                                </p>
                            </div>
                        )}

                        {/* Action Panel */}
                        <div className="bg-card p-6 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldAlert className="w-24 h-24 text-red-500" />
                            </div>
                            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5" />
                                Tindakan Darurat
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Gunakan tombol di bawah ini hanya jika terjadi masalah serius (barang hilang, penipuan, dll).
                                Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="space-y-3">
                                {order.status !== 'cancelled' && (
                                    <button
                                        onClick={() => handleActionClick('refund_buyer')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-colors text-sm"
                                    >
                                        <DollarSign className="w-4 h-4" />
                                        Refund Dana ke Pembeli
                                    </button>
                                )}

                                {order.status !== 'completed' && (
                                    <button
                                        onClick={() => handleActionClick('force_complete')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-50 font-medium transition-colors text-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Selesaikan Paksa (Dana ke Penjual)
                                    </button>
                                )}

                                {order.status !== 'cancelled' && order.status !== 'completed' && (
                                    <button
                                        onClick={() => handleActionClick('cancel_order')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Batalkan Pesanan Admin
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Complaint Log */}
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                            <h3 className="font-bold flex items-center gap-2 mb-4">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Riwayat Keluhan
                            </h3>
                            {complaints.length > 0 ? (
                                <div className="space-y-4">
                                    {complaints.map((complaint: any) => (
                                        <div key={complaint.id} className="p-3 bg-muted/50 rounded-xl text-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-foreground">{complaint.type_label}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(complaint.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-foreground/80 mb-2">"{complaint.description}"</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                                                ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    complaint.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {complaint.status_label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Tidak ada keluhan untuk pesanan ini.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Confirmation Modal */}
            {showActionModal && selectedAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl border border-border animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <AlertTriangle className="w-8 h-8" />
                            <h2 className="text-lg font-bold">Konfirmasi Tindakan</h2>
                        </div>

                        <p className="text-foreground mb-6">
                            Anda akan melakukan tindakan: <span className="font-bold">{actionLabels[selectedAction]}</span>.
                            Pastikan Anda sudah memverifikasi masalah ini.
                        </p>

                        <form onSubmit={submitAction}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Alasan Tindakan (Wajib)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    rows={3}
                                    placeholder="Contoh: Barang hilang saat pengantaran, diverifikasi via CCTV..."
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowActionModal(false)}
                                    className="px-4 py-2 border border-border rounded-xl hover:bg-muted font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Memproses...' : 'Konfirmasi & Eksekusi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
