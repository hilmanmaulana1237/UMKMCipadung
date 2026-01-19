import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { User } from '@/types';
import { UserCheck, DollarSign, TrendingUp } from 'lucide-react';

interface Affiliate extends User {
    affiliate_rewards_count: number;
    affiliate_rewards_sum_amount: number;
}

interface Props {
    affiliates: {
        data: Affiliate[];
        current_page: number;
        last_page: number;
    };
}

export default function AdminAffiliates({ affiliates }: Props) {
    const formatCurrency = (amount: number) => `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;

    return (
        <AdminLayout title="Manajemen Affiliator">
            <Head title="Manajemen Affiliator" />

            {/* Affiliates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {affiliates.data.map((affiliate) => (
                    <div
                        key={affiliate.id}
                        className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-7 h-7 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-foreground">{affiliate.name}</h3>
                                <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                                <p className="text-xs text-primary mt-1 font-mono bg-primary/10 px-2 py-1 rounded inline-block">
                                    {affiliate.affiliate_code}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                            <div className="bg-muted/50 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <TrendingUp className="w-4 h-4" />
                                    Referrals
                                </div>
                                <p className="text-xl font-bold text-foreground mt-1">
                                    {affiliate.affiliate_rewards_count}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <DollarSign className="w-4 h-4" />
                                    Total Komisi
                                </div>
                                <p className="text-lg font-bold text-green-600 mt-1">
                                    {formatCurrency(affiliate.affiliate_rewards_sum_amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {affiliates.data.length === 0 && (
                <div className="bg-card rounded-2xl p-12 border border-border text-center">
                    <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Belum ada affiliator</p>
                </div>
            )}
        </AdminLayout>
    );
}
