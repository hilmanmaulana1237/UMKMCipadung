import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { TrendingUp, Package, Share2, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    codeUsed: number;
    potentialEarnings: number;
    paidEarnings: number;
    walletBalance: number;
}

interface Props {
    affiliateCode: string | null;
    stats: Stats;
    recentRewards: any[];
}

export default function AffiliateDashboard({ affiliateCode, stats, recentRewards }: Props) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        if (affiliateCode) {
            navigator.clipboard.writeText(affiliateCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AppLayout activeTab="dashboard">
            <Head title="Dashboard Affiliator" />

            {/* Header */}
            <div className="px-4 pt-6 pb-4 bg-gradient-to-br from-primary to-secondary">
                <h1 className="text-xl font-bold text-white">Dashboard Affiliator</h1>
                <p className="text-white/80 text-sm">Dapatkan Rp 1.000 per transaksi!</p>

                {/* Affiliate Code Card */}
                {affiliateCode ? (
                    <div className="mt-4 bg-white/20 backdrop-blur rounded-2xl p-4">
                        <p className="text-white/80 text-xs mb-1">Kode Promo Anda</p>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white tracking-wider">
                                {affiliateCode}
                            </span>
                            <button
                                onClick={copyCode}
                                className="p-2 bg-white/20 rounded-lg"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <Copy className="w-4 h-4 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
                        <p className="text-white/80 text-sm mb-2">Belum punya kode promo?</p>
                        <button
                            onClick={() => router.visit('/affiliate/share')}
                            className="px-4 py-2 bg-white text-primary font-medium rounded-lg text-sm"
                        >
                            Buat Sekarang
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Kode Dipakai</p>
                            <p className="text-lg font-bold text-foreground">{stats.codeUsed}x</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Potensi</p>
                            <p className="text-lg font-bold text-foreground">
                                Rp {stats.potentialEarnings.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Komisi Cair</p>
                            <p className="text-lg font-bold text-success">
                                Rp {stats.paidEarnings.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Saldo</p>
                            <p className="text-lg font-bold text-foreground">
                                Rp {stats.walletBalance.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Rewards */}
            <div className="px-4 py-4">
                <h2 className="font-semibold text-foreground mb-3">Riwayat Komisi</h2>
                {recentRewards.length === 0 ? (
                    <div className="bg-card rounded-2xl p-6 border border-border text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Belum ada komisi</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentRewards.map((reward: any) => (
                            <div
                                key={reward.id}
                                className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {reward.order?.order_number || 'Order'}
                                    </p>
                                    <p className={`text-xs ${reward.status === 'paid' ? 'text-success' :
                                            reward.status === 'verified' ? 'text-warning' : 'text-muted-foreground'
                                        }`}>
                                        {reward.status === 'paid' ? 'Dibayar' :
                                            reward.status === 'verified' ? 'Terverifikasi' : 'Menunggu'}
                                    </p>
                                </div>
                                <span className={`font-bold ${reward.status === 'paid' ? 'text-success' : 'text-foreground'}`}>
                                    +Rp {reward.amount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
