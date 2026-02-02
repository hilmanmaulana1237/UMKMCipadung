import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { User } from '@/types';
import {
    Wallet,
    Check,
    X,
    Clock,
    User as UserIcon,
    DollarSign,
    Filter,
    Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface WithdrawalRequest {
    id: number;
    user_id: number;
    amount: number;
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    processed_at?: string;
    created_at: string;
    user?: User;
}

interface Props {
    withdrawals: {
        data: WithdrawalRequest[];
        current_page: number;
        last_page: number;
    };
    pendingTotal: number;
    filters: {
        status?: string;
    };
}

export default function AdminWithdrawals({ withdrawals, pendingTotal, filters }: Props) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleApprove = (id: number) => {
        setProcessingId(id);
        router.post(`/admin/withdrawals/${id}/approve`, {
            notes: approvalNotes,
        }, {
            onSuccess: () => {
                toast.success('Penarikan berhasil disetujui!');
                setApprovingId(null);
                setApprovalNotes('');
            },
            onError: () => {
                toast.error('Gagal menyetujui penarikan');
            },
            onFinish: () => setProcessingId(null),
        });
    };

    const handleReject = (id: number) => {
        if (!rejectReason.trim()) {
            toast.error('Masukkan alasan penolakan');
            return;
        }
        setProcessingId(id);
        router.post(`/admin/withdrawals/${id}/reject`, {
            reason: rejectReason,
        }, {
            onSuccess: () => {
                toast.success('Penarikan ditolak');
                setRejectingId(null);
                setRejectReason('');
            },
            onError: () => {
                toast.error('Gagal menolak penarikan');
            },
            onFinish: () => setProcessingId(null),
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        };
        const labels: Record<string, string> = {
            pending: 'Menunggu',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            courier: 'bg-orange-100 text-orange-700',
            affiliator: 'bg-purple-100 text-purple-700',
        };
        const labels: Record<string, string> = {
            courier: 'Kurir',
            affiliator: 'Affiliator',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
                {labels[role] || role}
            </span>
        );
    };

    return (
        <AdminLayout title="Manajemen Penarikan">
            <Head title="Manajemen Penarikan" />

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/80 text-sm">Total Permintaan Pending</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(Number(pendingTotal))}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Wallet className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Status:</span>
                    </div>
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <Link
                            key={status}
                            href={status === 'all' ? '/admin/withdrawals' : `/admin/withdrawals?status=${status}`}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${(filters.status === status || (!filters.status && status === 'all'))
                                ? 'bg-primary text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {status === 'all' ? 'Semua' :
                                status === 'pending' ? 'Menunggu' :
                                    status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Withdrawals List */}
            <div className="bg-card rounded-2xl border border-border">
                {withdrawals.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Tidak ada permintaan penarikan</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {withdrawals.data.map((withdrawal) => (
                            <div key={withdrawal.id} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 md:gap-4 w-full md:w-auto">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <p className="font-semibold text-foreground truncate max-w-[150px] md:max-w-none">
                                                    {withdrawal.user?.name || 'Unknown'}
                                                </p>
                                                {withdrawal.user?.role && getRoleBadge(withdrawal.user.role)}
                                                {getStatusBadge(withdrawal.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {withdrawal.user?.email}
                                            </p>

                                            {/* Bank Details */}
                                            {withdrawal.bank_name && (
                                                <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                                    <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">Info Rekening</p>
                                                    <p className="text-sm font-medium text-blue-900">
                                                        {withdrawal.bank_name} - {withdrawal.bank_account}
                                                    </p>
                                                    <p className="text-xs text-blue-600 mt-0.5 max-w-[200px] truncate">a.n. {withdrawal.bank_holder}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(withdrawal.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    Saldo: {formatCurrency(Number(withdrawal.user?.wallet_balance || 0))}
                                                </span>
                                            </div>
                                            {withdrawal.admin_notes && (
                                                <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-2.5 rounded-lg border border-border/50">
                                                    <span className="font-semibold">Catatan:</span> {withdrawal.admin_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Amount & Actions */}
                                    <div className="w-full md:w-auto flex flex-col items-end gap-3 mt-2 md:mt-0 pl-[52px] md:pl-0">
                                        <p className="text-xl md:text-2xl font-bold text-foreground">
                                            {formatCurrency(Number(withdrawal.amount))}
                                        </p>

                                        {withdrawal.status === 'pending' && (
                                            <div className="w-full md:w-auto">
                                                {rejectingId === withdrawal.id ? (
                                                    <div className="flex flex-col gap-2 w-full md:w-64 animate-in fade-in slide-in-from-top-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Alasan penolakan..."
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-red-500/20"
                                                            autoFocus
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setRejectingId(null);
                                                                    setRejectReason('');
                                                                }}
                                                                className="px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl text-sm font-medium transition-colors"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(withdrawal.id)}
                                                                disabled={processingId === withdrawal.id}
                                                                className="px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                                                            >
                                                                {processingId === withdrawal.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    'Tolak'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : approvingId === withdrawal.id ? (
                                                    <div className="flex flex-col gap-2 w-full md:w-64 animate-in fade-in slide-in-from-top-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Catatan (opsional)"
                                                            value={approvalNotes}
                                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                                            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20"
                                                            autoFocus
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setApprovingId(null);
                                                                    setApprovalNotes('');
                                                                }}
                                                                className="px-3 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-xl text-sm font-medium transition-colors"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(withdrawal.id)}
                                                                disabled={processingId === withdrawal.id}
                                                                className="px-3 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                                                            >
                                                                {processingId === withdrawal.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    'Konfirmasi'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 w-full md:w-auto">
                                                        <button
                                                            onClick={() => setRejectingId(withdrawal.id)}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span className="md:hidden lg:inline">Tolak</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setApprovingId(withdrawal.id)}
                                                            className="flex-[2] md:flex-none px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Setujui</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {withdrawals.last_page > 1 && (
                    <div className="p-4 border-t border-border flex justify-center gap-2">
                        {Array.from({ length: withdrawals.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/withdrawals?page=${page}${filters.status ? `&status=${filters.status}` : ''}`}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${page === withdrawals.current_page
                                    ? 'bg-primary text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
