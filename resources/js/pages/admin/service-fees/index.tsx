import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, DollarSign, Store, ArrowUpRight } from 'lucide-react';

interface FeeData {
    umkm_store_id: number;
    total_unbilled: string; // Decimal comes as string
    order_count: number;
    umkm_store: {
        id: number;
        name: string;
        bank_name: string;
        bank_account: string;
        bank_holder: string;
    };
}

interface Props {
    fees: FeeData[];
}

export default function ServiceFeesIndex({ fees }: Props) {
    const handleBill = (storeId: number, storeName: string) => {
        if (confirm(`Tandai tagihan untuk ${storeName} sebagai SUDAH DITAGIH?`)) {
            router.post(`/admin/service-fees/${storeId}/bill`);
        }
    };

    const totalUnbilled = fees.reduce((acc, fee) => acc + parseFloat(fee.total_unbilled), 0);

    return (
        <AdminLayout title="Monitoring Biaya Layanan">
            <Head title="Monitoring Biaya Layanan" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Biaya Layanan</h1>
                        <p className="text-muted-foreground">Monitoring tagihan biaya layanan aplikasi ke UMKM</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-medium">Total Belum Ditagih</p>
                            <p className="text-lg font-bold text-green-700">Rp {totalUnbilled.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">UMKM</th>
                                    <th className="px-6 py-4 font-semibold">Jumlah Order</th>
                                    <th className="px-6 py-4 font-semibold">Total Tagihan (Pending)</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {fees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            Tidak ada tagihan pending saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    fees.map((item) => (
                                        <tr key={item.umkm_store_id} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                        <Store className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{item.umkm_store.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.umkm_store.bank_name} - {item.umkm_store.bank_account}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {item.order_count} Transaksi
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-foreground">
                                                Rp {parseFloat(item.total_unbilled).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleBill(item.umkm_store_id, item.umkm_store.name)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Tagih Sekarang
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
