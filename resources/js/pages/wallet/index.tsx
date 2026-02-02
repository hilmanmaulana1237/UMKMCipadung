import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Order } from '@/types';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeft, History, Truck, CheckCircle, DollarSign, TrendingUp, Calendar, Clock, Loader2, AlertCircle, XCircle, Bot, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CourierStats {
    totalDeliveries: number;
    totalEarnings: number;
    thisMonthEarnings: number;
}

interface WithdrawalRequest {
    id: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes?: string;
    created_at: string;
}

interface Props {
    balance: number;
    courierDeliveries?: Order[];
    courierStats?: CourierStats | null;
    userRole: string;
    withdrawalRequests?: WithdrawalRequest[];
    canWithdraw: boolean;
}

export default function WalletIndex({ balance, courierDeliveries = [], courierStats, userRole, withdrawalRequests = [], canWithdraw }: Props) {
    const isCourier = userRole === 'courier';
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [bankHolder, setBankHolder] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Indonesian Banks and E-Wallets
    const bankOptions = [
        { value: '', label: 'Pilih Bank/E-Wallet' },
        // Conventional Banks
        { value: 'BCA', label: 'BCA' },
        { value: 'BNI', label: 'BNI' },
        { value: 'BRI', label: 'BRI' },
        { value: 'Mandiri', label: 'Bank Mandiri' },
        { value: 'CIMB Niaga', label: 'CIMB Niaga' },
        { value: 'BTN', label: 'BTN' },
        { value: 'Permata', label: 'Bank Permata' },
        { value: 'Danamon', label: 'Bank Danamon' },
        { value: 'OCBC NISP', label: 'OCBC NISP' },
        { value: 'Maybank', label: 'Maybank Indonesia' },
        { value: 'Panin', label: 'Bank Panin' },
        { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)' },
        // Digital Banks
        { value: 'Jago', label: 'Bank Jago' },
        { value: 'Blu BCA', label: 'Blu by BCA Digital' },
        { value: 'Seabank', label: 'SeaBank' },
        { value: 'Neo Commerce', label: 'Bank Neo Commerce' },
        // E-Wallets
        { value: 'GoPay', label: 'GoPay' },
        { value: 'OVO', label: 'OVO' },
        { value: 'DANA', label: 'DANA' },
        { value: 'ShopeePay', label: 'ShopeePay' },
        { value: 'LinkAja', label: 'LinkAja' },
    ];

    const handleWithdraw = () => {
        const amount = parseInt(withdrawAmount);
        if (!amount || amount < 10000) {
            toast.error('Minimal penarikan Rp 10.000');
            return;
        }
        if (amount > balance) {
            toast.error('Saldo tidak mencukupi');
            return;
        }
        if (!bankName) {
            toast.error('Pilih bank atau e-wallet tujuan');
            return;
        }
        if (!bankAccount.trim()) {
            toast.error('Masukkan nomor rekening/akun');
            return;
        }
        if (!bankHolder.trim()) {
            toast.error('Masukkan nama pemilik rekening');
            return;
        }

        setIsSubmitting(true);
        router.post('/wallet/withdraw', {
            amount,
            bank_name: bankName,
            bank_account: bankAccount,
            bank_holder: bankHolder,
        }, {
            onSuccess: () => {
                toast.success('Permintaan penarikan diajukan!');
                setShowWithdrawForm(false);
                setWithdrawAmount('');
                setBankName('');
                setBankAccount('');
                setBankHolder('');
            },
            onError: () => {
                toast.error('Gagal mengajukan penarikan');
            },
            onFinish: () => setIsSubmitting(false),
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
        const icons: Record<string, any> = {
            pending: <Clock className="w-3 h-3" />,
            approved: <CheckCircle className="w-3 h-3" />,
            rejected: <XCircle className="w-3 h-3" />,
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status]}`}>
                {icons[status]}
                {labels[status]}
            </span>
        );
    };

    const hasPendingWithdrawal = withdrawalRequests.some(w => w.status === 'pending');

    return (
        <AppLayout activeTab="wallet" showBottomNav={true}>
            <Head title="Dompet" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/profile" className="p-2 hover:bg-muted rounded-full transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-bold text-foreground">Dompet Digital</h1>
            </div>

            {/* Balance Card */}
            <div className="px-4 py-6">
                <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm">Saldo Tersedia</p>
                            <p className="text-3xl font-bold">
                                Rp {balance.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    {canWithdraw && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWithdrawForm(!showWithdrawForm)}
                                disabled={hasPendingWithdrawal}
                                className="flex-1 py-3 bg-white/20 rounded-xl flex items-center justify-center gap-2 hover:bg-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowUpRight className="w-5 h-5" />
                                <span className="font-medium">
                                    {hasPendingWithdrawal ? 'Ada Penarikan Pending' : 'Tarik Saldo'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Form */}
            {showWithdrawForm && (
                <div className="px-4 pb-4">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h3 className="font-bold text-foreground mb-3">Ajukan Penarikan</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-muted-foreground">Jumlah (min. Rp 10.000)</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                                    <input
                                        type="number"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background text-lg font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Bank Selection */}
                            <div>
                                <label className="text-sm text-muted-foreground">Bank / E-Wallet Tujuan</label>
                                <select
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background text-foreground font-medium appearance-none cursor-pointer"
                                >
                                    {bankOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="text-sm text-muted-foreground">Nomor Rekening / Nomor Akun</label>
                                <input
                                    type="text"
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    placeholder="Contoh: 1234567890"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>

                            {/* Account Holder Name */}
                            <div>
                                <label className="text-sm text-muted-foreground">Nama Pemilik Rekening</label>
                                <input
                                    type="text"
                                    value={bankHolder}
                                    onChange={(e) => setBankHolder(e.target.value)}
                                    placeholder="Nama sesuai rekening"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-sm text-amber-700 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    Pastikan data rekening benar. Dana akan ditransfer ke rekening ini setelah disetujui admin.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleWithdraw}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ArrowUpRight className="w-5 h-5" />
                                            Ajukan Penarikan
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowWithdrawForm(false)}
                                    className="px-4 py-3 bg-muted text-muted-foreground rounded-xl font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal History */}
            {canWithdraw && withdrawalRequests.length > 0 && (
                <div className="px-4 pb-4">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Riwayat Penarikan
                    </h3>
                    <div className="space-y-2">
                        {withdrawalRequests.map((request) => (
                            <div key={request.id} className="bg-card rounded-xl p-4 border border-border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-foreground">
                                            Rp {Number(request.amount).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(request.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                                {request.admin_notes && (
                                    <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-lg">
                                        {request.admin_notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Courier Stats - Only for Couriers */}
            {isCourier && courierStats && (
                <div className="px-4 pb-4">
                    <div className="bg-gradient-to-br from-success to-emerald-600 rounded-2xl p-4 shadow-lg shadow-success/20">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-white/80" />
                            <span className="text-white/80 text-sm font-medium">Statistik Pengantaran</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                <Truck className="w-5 h-5 text-white/80 mx-auto mb-1" />
                                <p className="text-white font-bold text-lg">{courierStats.totalDeliveries}</p>
                                <p className="text-white/60 text-xs">Total</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                <DollarSign className="w-5 h-5 text-white/80 mx-auto mb-1" />
                                <p className="text-white font-bold text-sm">
                                    {Number(courierStats.totalEarnings).toLocaleString('id-ID')}
                                </p>
                                <p className="text-white/60 text-xs">Komisi</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                <Calendar className="w-5 h-5 text-white/80 mx-auto mb-1" />
                                <p className="text-white font-bold text-sm">
                                    {Number(courierStats.thisMonthEarnings).toLocaleString('id-ID')}
                                </p>
                                <p className="text-white/60 text-xs">Bulan Ini</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction/Delivery History */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                    <History className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-bold text-foreground">
                        {isCourier ? 'Riwayat Pengantaran' : 'Riwayat Transaksi'}
                    </h2>
                </div>

                {isCourier && courierDeliveries.length > 0 ? (
                    <div className="space-y-3">
                        {courierDeliveries.map((delivery, index) => (
                            <div
                                key={delivery.id}
                                className="bg-card rounded-2xl p-4 border border-border hover:border-success/30 hover:shadow-md transition-all"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-foreground text-sm">
                                                {delivery.order_number}
                                            </p>
                                            <span className="text-success font-bold flex items-center gap-1">
                                                +Rp {Number(delivery.courier_fee).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {delivery.store?.name} → {delivery.buyer?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(delivery.updated_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            {isCourier ? (
                                <Truck className="w-8 h-8 text-muted-foreground" />
                            ) : (
                                <Wallet className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-muted-foreground font-medium">
                            {isCourier ? 'Belum ada pengantaran selesai' : 'Belum ada transaksi'}
                        </p>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="px-4 py-4">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                    <h3 className="font-bold text-foreground mb-2">💡 Tips</h3>
                    <p className="text-sm text-muted-foreground">
                        Saldo dompet akan bertambah otomatis ketika:
                    </p>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                        <li>• <b>Kurir:</b> Selesaikan pengiriman</li>
                        <li>• <b>Affiliator:</b> Kode promo digunakan dan pesanan selesai</li>
                    </ul>
                    {canWithdraw && (
                        <p className="mt-3 text-sm text-primary font-medium">
                            Untuk tarik saldo, ajukan permintaan dan hubungi admin.
                        </p>
                    )}
                </div>
            </div>

            {/* Floating AI Insights Button - Courier Only */}
            {isCourier && (
                <Link
                    href="/courier/ai-insights"
                    className="fixed bottom-32 z-[100] group"
                    style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-25" />
                        <div className="relative w-14 h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40 transition-all active:scale-95">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-500" />
                                AI Insights
                            </p>
                            <p className="text-xs text-muted-foreground">Prediksi & Tips</p>
                        </div>
                    </div>
                </Link>
            )}

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
