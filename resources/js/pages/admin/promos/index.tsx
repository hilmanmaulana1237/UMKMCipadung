import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Ticket, Search, Plus, Trash2, CheckCircle, XCircle, AlertCircle, Percent, Truck } from 'lucide-react';
import { useState } from 'react';

interface Props {
    promos: {
        data: any[];
        links: any[];
    };
}

export default function AdminPromos({ promos }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        code: '',
        type: 'free_shipping',
        value: '',
        quota: '',
        min_purchase: '0',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/promos', {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    return (
        <AdminLayout title="Kelola Kode Promo">
            <Head title="Promo" />

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-primary" />
                        Kode Promo
                    </h1>
                    <p className="text-muted-foreground">Buat kupon diskon atau gratis ongkir untuk pelanggan.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Buat Promo Baru
                </button>
            </div>

            {/* Promo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.data.map((promo) => (
                    <div key={promo.id} className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-md transition-all relative">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            {promo.type === 'free_shipping' ? <Truck className="w-32 h-32" /> : <Percent className="w-32 h-32" />}
                        </div>

                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${promo.type === 'free_shipping' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {promo.type === 'free_shipping' ? <Truck className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                                    {promo.type === 'free_shipping' ? 'Gratis Ongkir' : 'Diskon'}
                                </div>
                                <div className={`w-3 h-3 rounded-full ${promo.is_active && promo.used_count < promo.quota ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-2xl font-black text-primary tracking-tight font-mono">{promo.code}</h3>
                                <p className="text-sm font-medium mt-1">
                                    Potongan {formatCurrency(promo.value)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Min. Belanja {formatCurrency(promo.min_purchase)}
                                </p>
                            </div>

                            {/* Quota Progress */}
                            <div className="bg-muted/50 p-3 rounded-xl">
                                <div className="flex justify-between text-xs font-medium mb-1.5">
                                    <span>Terpakai</span>
                                    <span>{promo.used_count} / {promo.quota}</span>
                                </div>
                                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${promo.used_count >= promo.quota ? 'bg-red-500' : 'bg-primary'
                                            }`}
                                        style={{ width: `${Math.min((promo.used_count / promo.quota) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/20 border-t border-border p-3 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                Dibuat {new Date(promo.created_at).toLocaleDateString()}
                            </span>
                            <Link
                                href="#"
                                method="delete"
                                as="button"
                                data={{ promo: promo.id }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {promos.data.length === 0 && (
                <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border/60">
                    <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-muted-foreground">Belum ada Promo</h3>
                    <p className="text-sm text-muted-foreground/80">Buat kode promo pertama Anda untuk menarik pelanggan.</p>
                </div>
            )}

            {/* Create Promo Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border animate-in fade-in zoom-in duration-200">
                        <form onSubmit={submit}>
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-xl font-bold">Buat Promo Baru</h2>
                                <button type="button" onClick={() => setShowCreateModal(false)}>
                                    <XCircle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Kode Promo (Unik)</label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={e => setData('code', e.target.value.toUpperCase())}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary uppercase font-mono font-bold"
                                            placeholder="CONTOH: KEMERDEKAAN45"
                                            required
                                        />
                                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Tipe Promo</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="free_shipping"
                                                    checked={data.type === 'free_shipping'}
                                                    onChange={e => setData('type', e.target.value)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border peer-checked:border-primary peer-checked:bg-primary/5">
                                                    <Truck className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium">Gratis Ongkir</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="discount"
                                                    checked={data.type === 'discount'}
                                                    onChange={e => setData('type', e.target.value)}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border peer-checked:border-primary peer-checked:bg-primary/5">
                                                    <Percent className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium">Diskon Harga</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            {data.type === 'free_shipping' ? 'Max Subsidi Ongkir' : 'Nominal Diskon'}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                            <input
                                                type="number"
                                                value={data.value}
                                                onChange={e => setData('value', e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary"
                                                placeholder="10000"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kuota (Limit)</label>
                                        <input
                                            type="number"
                                            value={data.quota}
                                            onChange={e => setData('quota', e.target.value)}
                                            className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary"
                                            placeholder="100"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Minimal Belanja (Opsional)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                            <input
                                                type="number"
                                                value={data.min_purchase}
                                                onChange={e => setData('min_purchase', e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary"
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Isi 0 jika tidak ada minimal belanja.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-border rounded-xl hover:bg-muted font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium transition-all shadow-md items-center flex gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Promo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
