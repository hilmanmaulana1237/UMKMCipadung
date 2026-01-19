import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, User, Phone, CheckCircle, XCircle, Ban, RefreshCw, Truck, Star, AlertTriangle, Calendar } from 'lucide-react';

interface Props {
    courier: any;
    stats: {
        completed_deliveries: number;
        total_earnings: number;
        average_rating: number;
        active_days: number;
    };
    recentDeliveries: any[];
    complaints: any[];
}

export default function CourierDetail({ courier, stats, recentDeliveries, complaints }: Props) {

    const handleToggleStatus = () => {
        if (confirm(`Apakah Anda yakin ingin ${courier.is_courier_active ? 'menonaktifkan' : 'mengaktifkan'} kurir ini?`)) {
            router.post(`/admin/couriers/${courier.id}/toggle-status`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout title={`Detail Kurir - ${courier.name}`}>
            <Head title={`Admin - ${courier.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/couriers" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-full overflow-hidden border-2 border-border">
                                {courier.avatar_path ? (
                                    <img src={'/storage/' + courier.avatar_path} alt={courier.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <User className="w-8 h-8 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    {courier.name}
                                    {courier.is_courier_active ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span>{courier.email}</span>
                                    {courier.wa_number && (
                                        <>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {courier.wa_number}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {courier.wa_number && (
                            <a
                                href={`https://wa.me/${courier.wa_number}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                                <Phone className="w-4 h-4" />
                                Hubungi WA
                            </a>
                        )}
                        <button
                            onClick={handleToggleStatus}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${courier.is_courier_active
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {courier.is_courier_active ? (
                                <>
                                    <Ban className="w-4 h-4" />
                                    Nonaktifkan Akun
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Aktifkan Akun
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pengiriman</p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.completed_deliveries}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rating Rata-rata</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <h3 className="text-2xl font-bold text-foreground">
                                        {Number(stats.average_rating).toFixed(1)}
                                    </h3>
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bergabung</p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.active_days} Hari
                                </h3>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Keluhan Masuk</p>
                                <h3 className={`text-2xl font-bold mt-1 ${complaints.length > 0 ? 'text-red-500' : 'text-foreground'}`}>
                                    {complaints.length}
                                </h3>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Complaints Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-full">
                            <div className="p-5 border-b border-border bg-red-50/50">
                                <h2 className="text-lg font-bold flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="w-5 h-5" />
                                    Riwayat Keluhan
                                </h2>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {complaints.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {complaints.map((complaint) => (
                                            <div key={complaint.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-700">
                                                        {complaint.type_label}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(complaint.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium mb-1">Order #{complaint.order?.order_number}</p>
                                                <p className="text-sm text-foreground/80 italic">"{complaint.description}"</p>
                                                <div className="mt-2 text-xs">
                                                    Status: <span className="font-medium">{complaint.status_label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3 opacity-20" />
                                        <p>Tidak ada keluhan terkait kurir ini.</p>
                                        <p className="text-sm">Kinerja pengiriman sangat baik!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Deliveries */}
                    <div className="lg:col-span-2">
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary" />
                                    Pengiriman Terbaru
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Waktu</th>
                                            <th className="px-6 py-3">Order ID</th>
                                            <th className="px-6 py-3">Toko</th>
                                            <th className="px-6 py-3">Tujuan</th>
                                            <th className="px-6 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentDeliveries.length > 0 ? recentDeliveries.map((delivery) => (
                                            <tr key={delivery.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {formatDate(delivery.updated_at)}
                                                </td>
                                                <td className="px-6 py-4 font-medium">#{delivery.order_number}</td>
                                                <td className="px-6 py-4">{delivery.store?.name}</td>
                                                <td className="px-6 py-4 max-w-[200px] truncate" title={delivery.shipping_address}>
                                                    {delivery.shipping_address}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                                                        ${delivery.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            delivery.status === 'on_delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {delivery.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                    Belum ada riwayat pengiriman.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
