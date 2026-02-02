import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { User } from '@/types';
import { MessageSquare, Filter, Clock, Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Complaint {
    id: number;
    user_id: number;
    order_id: number;
    type: string;
    description: string;
    status: 'pending' | 'in_review' | 'resolved' | 'rejected';
    admin_response?: string;
    created_at: string;
    user?: User;
    order?: { order_number: string; store?: { name: string } };
}

interface Props {
    complaints: {
        data: Complaint[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
    };
}

export default function AdminComplaints({ complaints, filters }: Props) {
    const [respondingId, setRespondingId] = useState<number | null>(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('resolved');
    const [processing, setProcessing] = useState(false);

    const getTypeBadge = (type: string) => {
        const labels: Record<string, string> = {
            product_quality: 'Kualitas Produk',
            delivery: 'Pengiriman',
            seller: 'Penjual',
            courier: 'Kurir',
            other: 'Lainnya',
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            in_review: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            pending: 'Menunggu',
            in_review: 'Ditinjau',
            resolved: 'Selesai',
            rejected: 'Ditolak',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleRespond = (id: number) => {
        if (!response.trim()) {
            toast.error('Masukkan respons');
            return;
        }
        setProcessing(true);
        router.post(`/admin/complaints/${id}/respond`, {
            status,
            admin_response: response,
        }, {
            onSuccess: () => {
                toast.success('Keluhan berhasil direspons');
                setRespondingId(null);
                setResponse('');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout title="Manajemen Keluhan">
            <Head title="Manajemen Keluhan" />

            {/* Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    {['all', 'pending', 'in_review', 'resolved', 'rejected'].map((s) => (
                        <Link
                            key={s}
                            href={s === 'all' ? '/admin/complaints' : `/admin/complaints?status=${s}`}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${(filters.status === s || (!filters.status && s === 'all'))
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {s === 'all' ? 'Semua' :
                                s === 'pending' ? 'Menunggu' :
                                    s === 'in_review' ? 'Ditinjau' :
                                        s === 'resolved' ? 'Selesai' : 'Ditolak'}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
                {complaints.data.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 border border-border text-center">
                        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Tidak ada keluhan</p>
                    </div>
                ) : (
                    complaints.data.map((complaint) => (
                        <div key={complaint.id} className="bg-card rounded-2xl p-5 border border-border">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {getTypeBadge(complaint.type)}
                                        </span>
                                        {getStatusBadge(complaint.status)}
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(complaint.created_at).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-foreground">{complaint.user?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Pesanan: {complaint.order?.order_number} - {complaint.order?.store?.name}
                                    </p>
                                    <p className="mt-3 text-foreground bg-muted p-3 rounded-xl">
                                        {complaint.description}
                                    </p>
                                    {complaint.admin_response && (
                                        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                            <p className="text-sm font-medium text-primary">Respons Admin:</p>
                                            <p className="text-sm text-foreground">{complaint.admin_response}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {complaint.status === 'pending' && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    {respondingId === complaint.id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                placeholder="Tulis respons..."
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background min-h-[100px]"
                                            />
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={status}
                                                    onChange={(e) => setStatus(e.target.value)}
                                                    className="px-3 py-2 border border-border rounded-xl bg-background"
                                                >
                                                    <option value="in_review">Sedang Ditinjau</option>
                                                    <option value="resolved">Selesai</option>
                                                    <option value="rejected">Ditolak</option>
                                                </select>
                                                <button
                                                    onClick={() => handleRespond(complaint.id)}
                                                    disabled={processing}
                                                    className="px-4 py-2 bg-primary text-white rounded-xl font-medium flex items-center gap-2"
                                                >
                                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    Kirim
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setRespondingId(null);
                                                        setResponse('');
                                                    }}
                                                    className="px-4 py-2 bg-muted text-muted-foreground rounded-xl"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRespondingId(complaint.id)}
                                            className="px-4 py-2 bg-primary text-white rounded-xl font-medium"
                                        >
                                            Respons
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
}
