import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, AlertCircle, Clock, CheckCircle, XCircle, ChevronRight, MessageSquare } from 'lucide-react';

interface Complaint {
    id: number;
    type: string;
    description: string;
    status: 'pending' | 'in_review' | 'resolved' | 'rejected';
    admin_response: string | null;
    created_at: string;
    order: {
        id: number;
        order_number: string;
        store?: {
            name: string;
        };
    };
}

interface Props {
    complaints: Complaint[];
}

const statusConfig = {
    pending: { label: 'Menunggu', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    in_review: { label: 'Ditinjau', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    resolved: { label: 'Selesai', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    rejected: { label: 'Ditolak', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

const typeLabels: Record<string, string> = {
    product_quality: 'Kualitas Produk',
    delivery: 'Pengiriman',
    seller: 'Penjual',
    courier: 'Kurir',
    other: 'Lainnya',
};

export default function ComplaintsList({ complaints }: Props) {
    return (
        <AppLayout activeTab="history" showBottomNav={false}>
            <Head title="Keluhan Saya" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/history" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-semibold text-foreground">Keluhan Saya</h1>
                    <p className="text-xs text-muted-foreground">{complaints.length} keluhan</p>
                </div>
            </div>

            <div className="px-4 py-4">
                {complaints.length === 0 ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Belum ada keluhan</p>
                        <Link
                            href="/history"
                            className="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
                        >
                            Lihat Riwayat Pesanan
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {complaints.map((complaint) => {
                            const status = statusConfig[complaint.status];
                            const StatusIcon = status.icon;

                            return (
                                <Link
                                    key={complaint.id}
                                    href={`/complaints/${complaint.id}`}
                                    className="bg-card rounded-2xl p-4 border border-border block"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg}`}>
                                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-foreground mt-2">
                                                {typeLabels[complaint.type] || complaint.type}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {complaint.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {complaint.order?.order_number} • {complaint.order?.store?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(complaint.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
