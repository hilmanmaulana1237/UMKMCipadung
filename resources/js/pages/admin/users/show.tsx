import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { User, UmkmStore, Order } from '@/types';
import {
    ArrowLeft, Users, Mail, Phone, Wallet, ShoppingCart, Truck, Store, Package,
    Trash2, AlertTriangle, MapPin, Clock, Calendar, Star, Shield, XCircle, CheckCircle, Loader2,
    Eye, EyeOff, Key
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
    user: User & { umkm_store?: UmkmStore & { products?: any[]; orders?: any[] } };
    stats: {
        totalOrders: number;
        totalSpent: number;
        totalDeliveries: number;
        totalEarnings: number;
        affiliateRewards: number;
    };
    recentOrders: Order[];
    recentDeliveries: Order[];
    plainPassword?: string | null;
}

export default function UserDetail({ user, stats, recentOrders, recentDeliveries, plainPassword }: Props) {
    const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fetchedPassword, setFetchedPassword] = useState<string | null>(plainPassword ?? null);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleShowPassword = async () => {
        if (showPassword) {
            setShowPassword(false);
            return;
        }
        if (fetchedPassword) {
            setShowPassword(true);
            return;
        }
        // Fetch from backend
        setLoadingPassword(true);
        try {
            const res = await axios.get(`/admin/users/${user.id}/password`);
            setFetchedPassword(res.data.password);
            setShowPassword(true);
        } catch {
            toast.error('Gagal mengambil password');
        } finally {
            setLoadingPassword(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            buyer: 'bg-green-100 text-green-700 border-green-200',
            umkm: 'bg-purple-100 text-purple-700 border-purple-200',
            courier: 'bg-orange-100 text-orange-700 border-orange-200',
            affiliator: 'bg-blue-100 text-blue-700 border-blue-200',
            admin: 'bg-red-100 text-red-700 border-red-200',
        };
        const labels: Record<string, string> = {
            buyer: 'Pembeli',
            umkm: 'UMKM',
            courier: 'Kurir',
            affiliator: 'Affiliator',
            admin: 'Admin',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[role] || 'bg-gray-100'}`}>
                {labels[role] || role}
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            processing: 'bg-blue-100 text-blue-700',
            waiting_verification: 'bg-amber-100 text-amber-700',
            ready_to_ship: 'bg-indigo-100 text-indigo-700',
            on_delivery: 'bg-purple-100 text-purple-700',
            pending_payment: 'bg-gray-100 text-gray-700',
        };
        const labels: Record<string, string> = {
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
            processing: 'Diproses',
            waiting_verification: 'Menunggu Verifikasi',
            ready_to_ship: 'Siap Kirim',
            on_delivery: 'Dalam Pengiriman',
            pending_payment: 'Menunggu Pembayaran',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status.replace(/_/g, ' ')}
            </span>
        );
    };

    const handleDeleteStore = () => {
        setIsDeleting(true);
        router.delete(`/admin/users/${user.id}/store`, {
            onSuccess: () => {
                toast.success('Toko berhasil dihapus!');
                setShowDeleteStoreModal(false);
            },
            onError: () => toast.error('Gagal menghapus toko.'),
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleDeleteUser = () => {
        setIsDeleting(true);
        router.delete(`/admin/users/${user.id}`, {
            onSuccess: () => toast.success('Akun berhasil dihapus!'),
            onError: () => toast.error('Gagal menghapus akun.'),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <AdminLayout title={`Detail Pengguna - ${user.name}`}>
            <Head title={`Admin - ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/users" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                                {user.avatar_path ? (
                                    <img src={`/storage/${user.avatar_path}`} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <Users className="w-7 h-7 text-primary" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {getRoleBadge(user.role)}
                                    {user.is_suspended && (
                                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">SUSPENDED</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Informasi Akun
                        </h2>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            {user.wa_number && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>{user.wa_number}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wallet className="w-4 h-4" />
                                <span>Saldo: <b className="text-foreground">{formatCurrency(Number(user.wallet_balance))}</b></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Bergabung: {formatDate(user.created_at)}</span>
                            </div>
                            {user.affiliate_code && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Star className="w-4 h-4" />
                                    <span>Kode Afiliasi: <b className="text-foreground">{user.affiliate_code}</b></span>
                                </div>
                            )}
                            {/* Password Section */}
                            <div className="pt-2 border-t border-border mt-2">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Password:</span>
                                    {showPassword && fetchedPassword ? (
                                        <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono text-foreground">{fetchedPassword}</code>
                                    ) : showPassword && !fetchedPassword ? (
                                        <span className="text-xs text-amber-600 italic">Tidak tersedia (akun lama)</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">••••••••</span>
                                    )}
                                    <button
                                        onClick={handleShowPassword}
                                        disabled={loadingPassword}
                                        className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                        title={showPassword ? 'Sembunyikan' : 'Tampilkan Password'}
                                    >
                                        {loadingPassword ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                        <h2 className="font-bold text-foreground flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Statistik
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs text-blue-600 font-medium">Pesanan (Pembeli)</p>
                                <p className="text-xl font-bold text-blue-700">{stats.totalOrders}</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3">
                                <p className="text-xs text-green-600 font-medium">Total Belanja</p>
                                <p className="text-lg font-bold text-green-700">{formatCurrency(Number(stats.totalSpent))}</p>
                            </div>
                            {(user.role === 'courier') && (
                                <>
                                    <div className="bg-orange-50 rounded-xl p-3">
                                        <p className="text-xs text-orange-600 font-medium">Pengiriman</p>
                                        <p className="text-xl font-bold text-orange-700">{stats.totalDeliveries}</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-xl p-3">
                                        <p className="text-xs text-emerald-600 font-medium">Penghasilan Kurir</p>
                                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(Number(stats.totalEarnings))}</p>
                                    </div>
                                </>
                            )}
                            {(user.role === 'affiliator') && (
                                <div className="bg-purple-50 rounded-xl p-3 col-span-2">
                                    <p className="text-xs text-purple-600 font-medium">Total Reward Afiliasi</p>
                                    <p className="text-xl font-bold text-purple-700">{formatCurrency(Number(stats.affiliateRewards))}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* UMKM Store Info */}
                {user.umkm_store && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Store className="w-5 h-5 text-purple-600" />
                                Toko UMKM
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-bold text-foreground">{user.umkm_store.name}</h3>
                                    {user.umkm_store.address_pickup && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {user.umkm_store.address_pickup}
                                        </p>
                                    )}
                                    {user.umkm_store.contact_number && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {user.umkm_store.contact_number}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                        <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg font-medium">
                                            {user.umkm_store.products?.length || 0} Produk
                                        </span>
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-medium">
                                            {user.umkm_store.orders?.length || 0} Pesanan
                                        </span>
                                        <span className={`px-3 py-1 rounded-lg font-medium ${user.umkm_store.is_open ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {user.umkm_store.is_open ? 'Buka' : 'Tutup'}
                                        </span>
                                    </div>
                                    {user.umkm_store.latitude && user.umkm_store.longitude && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            📍 GPS: {user.umkm_store.latitude}, {user.umkm_store.longitude}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/admin/stores/${user.umkm_store.id}`}
                                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors text-center"
                                    >
                                        Lihat Detail Toko
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteStoreModal(true)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus Toko
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Orders (as Buyer) */}
                {recentOrders.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-600" />
                                Pesanan Terbaru (Sebagai Pembeli)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Toko</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-5 py-3 font-medium">#{order.order_number}</td>
                                            <td className="px-5 py-3">{order.store?.name || '-'}</td>
                                            <td className="px-5 py-3">{getStatusBadge(order.status)}</td>
                                            <td className="px-5 py-3 text-right font-medium">{formatCurrency(order.total_amount)}</td>
                                            <td className="px-5 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Deliveries (as Courier) */}
                {recentDeliveries.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Truck className="w-5 h-5 text-orange-600" />
                                Pengiriman Terbaru (Sebagai Kurir)
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-5 py-3">Order</th>
                                        <th className="px-5 py-3">Toko</th>
                                        <th className="px-5 py-3">Pembeli</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">Komisi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentDeliveries.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-5 py-3 font-medium">#{order.order_number}</td>
                                            <td className="px-5 py-3">{order.store?.name || '-'}</td>
                                            <td className="px-5 py-3">{order.buyer?.name || '-'}</td>
                                            <td className="px-5 py-3">{getStatusBadge(order.status)}</td>
                                            <td className="px-5 py-3 text-right font-medium text-green-600">{formatCurrency(order.courier_fee)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                {user.role !== 'admin' && (
                    <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-5">
                        <h2 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            Zona Berbahaya
                        </h2>
                        <p className="text-sm text-red-600 mb-4">
                            Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {user.umkm_store && (
                                <button
                                    onClick={() => setShowDeleteStoreModal(true)}
                                    className="px-4 py-2.5 bg-white text-red-600 border border-red-300 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <Store className="w-4 h-4" />
                                    Hapus Toko Saja
                                </button>
                            )}
                            <button
                                onClick={() => setShowDeleteUserModal(true)}
                                className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus Akun & Semua Data
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Store Modal */}
            {showDeleteStoreModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-t-3xl opacity-15" />

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                                <Store className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Hapus Toko?
                            </h3>
                            <p className="text-center text-gray-600 mb-4 text-sm leading-relaxed">
                                Toko <b>{user.umkm_store?.name}</b> beserta semua produk, review, dan data terkait akan dihapus permanen.
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 space-y-1.5 text-sm text-red-700">
                                <p className="font-bold">Yang akan dihapus:</p>
                                <p>• Semua produk ({user.umkm_store?.products?.length || 0} produk)</p>
                                <p>• Review & rating toko</p>
                                <p>• Landing page toko</p>
                                <p>• File foto toko & QRIS</p>
                                <p className="text-xs text-red-600 mt-2">* Riwayat pesanan tetap tersimpan</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowDeleteStoreModal(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteStore}
                                    disabled={isDeleting}
                                    className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:scale-105 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" /> Hapus Toko</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Modal */}
            {showDeleteUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-br from-red-600 to-rose-700 rounded-t-3xl opacity-15" />

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
                                <AlertTriangle className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                                Hapus Akun Permanen?
                            </h3>
                            <p className="text-center text-gray-600 mb-4 text-sm leading-relaxed">
                                Akun <b>{user.name}</b> ({user.email}) dan <b>SEMUA data terkait</b> akan dihapus permanen dan tidak dapat dikembalikan!
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 space-y-1.5 text-sm text-red-700">
                                <p className="font-bold">Yang akan dihapus:</p>
                                <p>• Akun pengguna</p>
                                {user.umkm_store && <p>• Toko & semua produk</p>}
                                <p>• Riwayat pesanan (diputuskan dari akun)</p>
                                <p>• Reward afiliasi</p>
                                <p>• Pengaduan & keluhan</p>
                            </div>

                            {/* Confirmation Input */}
                            <div className="mb-5">
                                <p className="text-sm text-gray-600 mb-2">
                                    Ketik <b className="text-red-600">HAPUS</b> untuk konfirmasi:
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-red-300 rounded-xl text-sm focus:outline-none focus:border-red-500 text-center font-bold"
                                    placeholder="HAPUS"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => { setShowDeleteUserModal(false); setConfirmText(''); }}
                                    disabled={isDeleting}
                                    className="px-4 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={isDeleting || confirmText !== 'HAPUS'}
                                    className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 shadow-lg shadow-red-600/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" /> Hapus Permanen</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
