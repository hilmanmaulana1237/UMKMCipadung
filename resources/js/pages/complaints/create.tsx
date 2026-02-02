import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Order } from '@/types';
import { ArrowLeft, AlertTriangle, Package, Truck, User, MessageCircle, Send } from 'lucide-react';
import { FormEvent } from 'react';

interface Props {
    order: Order;
}

const complaintTypes = [
    { value: 'product_quality', label: 'Kualitas Produk', icon: Package, description: 'Produk rusak, tidak sesuai, atau kadaluarsa' },
    { value: 'delivery', label: 'Pengiriman', icon: Truck, description: 'Terlambat, hilang, atau rusak saat pengiriman' },
    { value: 'seller', label: 'Penjual', icon: User, description: 'Pelayanan buruk atau tidak responsif' },
    { value: 'courier', label: 'Kurir', icon: Truck, description: 'Masalah dengan kurir pengantar' },
    { value: 'other', label: 'Lainnya', icon: MessageCircle, description: 'Masalah lain yang tidak tercantum' },
];

export default function CreateComplaint({ order }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        type: '',
        description: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/complaints');
    };

    return (
        <AppLayout activeTab="history" showBottomNav={false}>
            <Head title="Laporkan Masalah" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href={`/orders/${order.id}/status`} className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-semibold text-foreground">Laporkan Masalah</h1>
                    <p className="text-xs text-muted-foreground">{order.order_number}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
                {/* Order Info */}
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{order.store?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Complaint Type */}
                <div>
                    <label className="block font-medium text-foreground mb-3">
                        Jenis Masalah
                    </label>
                    <div className="space-y-2">
                        {complaintTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setData('type', type.value)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${data.type === type.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-card hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.type === type.value ? 'bg-primary/10' : 'bg-muted'
                                            }`}>
                                            <Icon className={`w-5 h-5 ${data.type === type.value ? 'text-primary' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{type.label}</p>
                                            <p className="text-xs text-muted-foreground">{type.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {errors.type && (
                        <p className="text-sm text-red-500 mt-2">{errors.type}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block font-medium text-foreground mb-2">
                        Jelaskan Masalah Anda
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Ceritakan detail masalah yang Anda alami..."
                        rows={5}
                        className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                        Minimal 10 karakter
                    </p>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-800 font-medium">Perhatian</p>
                            <p className="text-xs text-amber-700 mt-1">
                                Keluhan Anda akan ditinjau oleh tim kami dalam 1-3 hari kerja.
                                Pastikan informasi yang Anda berikan akurat dan jujur.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing || !data.type || !data.description}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                    Kirim Keluhan
                </button>
            </form>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
