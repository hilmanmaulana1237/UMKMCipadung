import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Save, Settings, Truck, ShieldAlert, Power, AlertTriangle, Clock, Package, Store, CheckCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
    settings: Record<string, string>;
    maintenanceMode: boolean;
    activeOrdersCount: number;
    activeOrdersByStatus: {
        waiting_verification: number;
        processing: number;
        ready_to_ship: number;
        on_delivery: number;
    };
}

export default function GeneralSettings({ settings, maintenanceMode, activeOrdersCount, activeOrdersByStatus }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        courier_fee: settings.courier_fee || '10000',
        admin_fee: settings.admin_fee || '0',
        fonnte_api_token: settings.fonnte_api_token || '',
        whatsapp_notifications_enabled: settings.whatsapp_notifications_enabled === 'true',
    });

    const [toggling, setToggling] = useState(false);
    const { flash } = usePage().props as any;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings/api');
    };

    const handleToggleMaintenance = () => {
        setToggling(true);
        router.post('/admin/settings/maintenance/toggle', {}, {
            onFinish: () => setToggling(false),
        });
    };

    return (
        <AdminLayout title="Pengaturan Umum">
            <Head title="Pengaturan Umum" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
                        <p className="text-muted-foreground">Konfigurasi variabel global aplikasi</p>
                    </div>
                </div>

                {/* Maintenance Mode Section */}
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
                                </p>
                                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${maintenanceMode
                                    ? 'bg-amber-200 text-amber-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-amber-600' : 'bg-green-600'}`} />
                                    {maintenanceMode ? 'Maintenance Aktif' : 'Sistem Normal'}
                                </div>
                            </div>
                        </div>

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
                    {activeOrdersCount > 0 && maintenanceMode && (
                        <div className="mt-6 bg-white/80 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 text-amber-700 mb-3">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-semibold">Pesanan Aktif: {activeOrdersCount}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-amber-50 rounded-lg p-3 text-center">
                                    <Clock className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                                    <p className="text-xs text-amber-600">Verifikasi</p>
                                    <p className="text-lg font-bold text-amber-800">{activeOrdersByStatus.waiting_verification}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <Package className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                                    <p className="text-xs text-blue-600">Proses</p>
                                    <p className="text-lg font-bold text-blue-800">{activeOrdersByStatus.processing}</p>
                                </div>
                                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                    <Store className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                                    <p className="text-xs text-indigo-600">Siap Kirim</p>
                                    <p className="text-lg font-bold text-indigo-800">{activeOrdersByStatus.ready_to_ship}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <Truck className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                                    <p className="text-xs text-purple-600">Dikirim</p>
                                    <p className="text-lg font-bold text-purple-800">{activeOrdersByStatus.on_delivery}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Courier Settings */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-lg">Konfigurasi Biaya</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Biaya Ongkir Dasar (Bayar Tunai)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                        value={data.courier_fee}
                                        onChange={e => setData('courier_fee', e.target.value)}
                                        placeholder="10000"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Nominal ini yang harus dibayar user secara tunai ke kurir (jika tidak ada promo).
                                </p>
                                {errors.courier_fee && (
                                    <p className="text-sm text-destructive mt-1">{errors.courier_fee}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-border">
                                <label className="block text-sm font-medium mb-2">Biaya Layanan Admin (Global)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                                        value={data.admin_fee}
                                        onChange={e => setData('admin_fee', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Biaya tambahan yang masuk ke aplikasi setiap transaksi.
                                </p>
                                {errors.admin_fee && (
                                    <p className="text-sm text-destructive mt-1">{errors.admin_fee}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Notification Settings */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <h2 className="font-bold text-lg">Notifikasi WhatsApp (Fonnte)</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                                <div>
                                    <p className="font-medium">Aktifkan Notifikasi WA</p>
                                    <p className="text-sm text-muted-foreground">Kirim notif ke penjual saat ada order baru</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('whatsapp_notifications_enabled', !data.whatsapp_notifications_enabled)}
                                    className={`relative w-14 h-8 rounded-full transition-colors ${data.whatsapp_notifications_enabled ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${data.whatsapp_notifications_enabled ? 'left-7' : 'left-1'
                                        }`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Fonnte API Token</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-background font-mono"
                                    value={data.fonnte_api_token}
                                    onChange={e => setData('fonnte_api_token', e.target.value)}
                                    placeholder="Masukkan token dari fonnte.com"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Dapatkan token di <a href="https://fonnte.com" target="_blank" className="text-primary hover:underline">fonnte.com</a> setelah menghubungkan WhatsApp.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
