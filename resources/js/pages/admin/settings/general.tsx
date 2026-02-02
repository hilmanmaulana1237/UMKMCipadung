
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Settings, AlertTriangle, CheckCircle, Package, Clock, Truck, Store, ArrowLeft, Power, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

interface Props {
    maintenanceMode: boolean;
    activeOrdersCount: number;
    activeOrdersByStatus: {
        waiting_verification: number;
        processing: number;
        ready_to_ship: number;
        on_delivery: number;
    };
}

export default function GeneralSettings({ maintenanceMode, activeOrdersCount, activeOrdersByStatus }: Props) {
    const [toggling, setToggling] = useState(false);
    const { flash } = usePage().props as any;

    const handleToggleMaintenance = () => {
        setToggling(true);
        router.post('/admin/settings/maintenance/toggle', {}, {
            onFinish: () => setToggling(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Umum" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Pengaturan Umum</h1>
                        <p className="text-muted-foreground">Kelola pengaturan aplikasi</p>
                    </div>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-success font-medium">{flash.success}</span>
                    </div>
                )}

                {/* Maintenance Mode Card */}
                <div className={`rounded-2xl border-2 p-6 ${maintenanceMode ? 'bg-amber-50 border-amber-300' : 'bg-card border-border'}`}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${maintenanceMode ? 'bg-amber-200' : 'bg-muted'}`}>
                                <ShieldAlert className={`w-6 h-6 ${maintenanceMode ? 'text-amber-700' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Mode Maintenance</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Aktifkan mode maintenance untuk memblokir pesanan baru sementara.
                                    Pesanan yang sudah ada tetap dapat diproses hingga selesai.
                                </p>

                                {/* Current Status */}
                                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${maintenanceMode
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-amber-600' : 'bg-green-600'}`} />
                                    {maintenanceMode ? 'Maintenance Aktif' : 'Sistem Normal'}
                                </div>
                            </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                            onClick={handleToggleMaintenance}
                            disabled={toggling}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${maintenanceMode
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200'
                                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200'
                                } disabled:opacity-50`}
                        >
                            <Power className="w-4 h-4" />
                            {toggling ? 'Memproses...' : maintenanceMode ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                    </div>

                    {/* Active Orders Warning */}
                    {activeOrdersCount > 0 && (
                        <div className="mt-6 bg-white/80 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700 mb-3">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold">Pesanan Aktif: {activeOrdersCount}</span>
                            </div>
                            <p className="text-sm text-amber-800 mb-4">
                                Pesanan berikut akan tetap berjalan meskipun maintenance mode aktif:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-amber-50 rounded-lg p-3 text-center">
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                                    <p className="text-xs text-amber-600">Menunggu Verifikasi</p>
                                    <p className="text-lg font-bold text-amber-800">{activeOrdersByStatus.waiting_verification}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <Package className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                                    <p className="text-xs text-blue-600">Diproses</p>
                                    <p className="text-lg font-bold text-blue-800">{activeOrdersByStatus.processing}</p>
                                </div>
                                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                    <Store className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                                    <p className="text-xs text-indigo-600">Siap Kirim</p>
                                    <p className="text-lg font-bold text-indigo-800">{activeOrdersByStatus.ready_to_ship}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <Truck className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                    <p className="text-xs text-purple-600">Dalam Pengiriman</p>
                                    <p className="text-lg font-bold text-purple-800">{activeOrdersByStatus.on_delivery}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Yang Diblokir Saat Maintenance:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Pembuatan pesanan baru (checkout)</li>
                    </ul>
                    <h3 className="font-semibold text-blue-900 mt-4 mb-2">✅ Yang Tetap Berjalan:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• UMKM dapat memproses pesanan yang ada</li>
                        <li>• Kurir dapat mengambil dan mengantar pesanan</li>
                        <li>• Pembeli dapat melihat status pesanan</li>
                        <li>• Semua fitur admin tetap aktif</li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/settings/api"
                        className="bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Pengaturan API</p>
                            <p className="text-sm text-muted-foreground">Konfigurasi API AI</p>
                        </div>
                    </Link>
                    <Link
                        href="/admin"
                        className="bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors flex items-center gap-3"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Kembali ke Dashboard</p>
                            <p className="text-sm text-muted-foreground">Dashboard admin</p>
                        </div>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
