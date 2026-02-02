import AdminLayout from '@/layouts/admin-layout';
import { Head, router } from '@inertiajs/react';
import { UserPlus, Store, Users, Truck, Award, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateUser() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer',
        wa_number: '',
        // UMKM specific
        store_name: '',
        store_category: '',
        store_description: '',
        store_address: '',
        // Affiliator specific
        affiliate_code: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roles = [
        { value: 'buyer', label: 'Pembeli', icon: Users, color: 'green', description: 'Pengguna yang dapat membeli produk' },
        { value: 'umkm', label: 'UMKM', icon: Store, color: 'purple', description: 'Penjual yang memiliki toko' },
        { value: 'courier', label: 'Kurir', icon: Truck, color: 'orange', description: 'Pengantar pesanan' },
        { value: 'affiliator', label: 'Affiliator', icon: Award, color: 'blue', description: 'Mempromosikan dengan kode referral' },
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateAffiliateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        handleChange('affiliate_code', code);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Nama, email, dan password harus diisi');
            return;
        }

        if (formData.role === 'umkm' && (!formData.store_name || !formData.store_address || !formData.store_category)) {
            toast.error('Nama, alamat, dan kategori toko wajib diisi');
            return;
        }

        if (formData.role === 'affiliator' && !formData.affiliate_code) {
            toast.error('Kode referral wajib diisi untuk Affiliator');
            return;
        }

        setIsSubmitting(true);
        router.post('/admin/users', formData, {
            onSuccess: () => {
                toast.success('Pengguna berhasil ditambahkan!');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string || 'Gagal menambahkan pengguna');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const selectedRole = roles.find(r => r.value === formData.role);

    return (
        <AdminLayout title="Tambah Pengguna">
            <Head title="Tambah Pengguna" />

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.visit('/admin/users')}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tambah Pengguna Baru</h1>
                    <p className="text-muted-foreground text-sm">Buat akun untuk buyer, UMKM, kurir, atau affiliator</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold text-foreground mb-4">Pilih Jenis Pengguna</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = formData.role === role.value;
                            return (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => handleChange('role', role.value)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? `border-${role.color}-500 bg-${role.color}-50`
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                    style={isSelected ? {
                                        borderColor: role.color === 'green' ? '#22c55e' :
                                            role.color === 'purple' ? '#a855f7' :
                                                role.color === 'orange' ? '#f97316' : '#3b82f6',
                                        backgroundColor: role.color === 'green' ? '#f0fdf4' :
                                            role.color === 'purple' ? '#faf5ff' :
                                                role.color === 'orange' ? '#fff7ed' : '#eff6ff'
                                    } : {}}
                                >
                                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <p className="font-semibold text-foreground">{role.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Informasi Dasar
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Contoh: Ahmad Prasetyo"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="contoh@email.com"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground">Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground">No. WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.wa_number}
                                    onChange={(e) => handleChange('wa_number', e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full mt-1 px-4 py-3 border border-border rounded-xl bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* UMKM Specific Fields */}
                {formData.role === 'umkm' && (
                    <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6">
                        <h2 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5" />
                            Informasi Toko UMKM
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-purple-800">Nama Toko *</label>
                                <input
                                    type="text"
                                    value={formData.store_name}
                                    onChange={(e) => handleChange('store_name', e.target.value)}
                                    placeholder="Contoh: Warung Bu Tuti"
                                    className="w-full mt-1 px-4 py-3 border border-purple-200 rounded-xl bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-purple-800">Alamat Toko *</label>
                                <input
                                    type="text"
                                    value={formData.store_address}
                                    onChange={(e) => handleChange('store_address', e.target.value)}
                                    placeholder="Contoh: Jl. Cipadung No. 123, Cibiru"
                                    className="w-full mt-1 px-4 py-3 border border-purple-200 rounded-xl bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-purple-800">Kategori Toko *</label>
                                <select
                                    value={formData.store_category}
                                    onChange={(e) => handleChange('store_category', e.target.value)}
                                    className="w-full mt-1 px-4 py-3 border border-purple-200 rounded-xl bg-white"
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    <option value="kuliner">Kuliner</option>
                                    <option value="kriya">Kriya (Kerajinan)</option>
                                    <option value="jasa">Jasa</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-purple-800">Deskripsi Toko</label>
                                <textarea
                                    value={formData.store_description}
                                    onChange={(e) => handleChange('store_description', e.target.value)}
                                    placeholder="Ceritakan tentang toko ini..."
                                    rows={3}
                                    className="w-full mt-1 px-4 py-3 border border-purple-200 rounded-xl bg-white resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Affiliator Specific Fields */}
                {formData.role === 'affiliator' && (
                    <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                        <h2 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Informasi Affiliator
                        </h2>
                        <div>
                            <label className="text-sm font-medium text-blue-800">Kode Referral *</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={formData.affiliate_code}
                                    onChange={(e) => handleChange('affiliate_code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: PROMO2024"
                                    maxLength={20}
                                    className="flex-1 px-4 py-3 border border-blue-200 rounded-xl bg-white uppercase"
                                />
                                <button
                                    type="button"
                                    onClick={generateAffiliateCode}
                                    className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Generate
                                </button>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                                Kode ini akan digunakan pembeli untuk mendapatkan diskon dan affiliator mendapat komisi.
                            </p>
                        </div>
                    </div>
                )}

                {/* Courier Info */}
                {formData.role === 'courier' && (
                    <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
                        <h2 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Informasi Kurir
                        </h2>
                        <p className="text-sm text-orange-700">
                            Akun kurir akan otomatis dibuat dengan status tidak aktif. Kurir bisa mengaktifkan dirinya
                            sendiri melalui aplikasi saat mulai bekerja.
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.visit('/admin/users')}
                        className="px-6 py-3 bg-muted text-muted-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Tambah {selectedRole?.label}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
