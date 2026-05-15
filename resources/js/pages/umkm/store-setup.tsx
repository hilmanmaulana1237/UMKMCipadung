import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { UmkmStore } from '@/types';
import { Save, Store, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import { toast } from 'sonner';

interface Props {
    store: UmkmStore | null;
    avatar_path: string | null;
}

const CATEGORIES = [
    { value: 'kuliner',  label: '🍜 Kuliner & Makanan',   desc: 'Warung, katering, kue, minuman' },
    { value: 'kriya',   label: '🎨 Kerajinan & Produk',  desc: 'Handicraft, fashion, souvenir' },
    { value: 'jasa',    label: '⚙️ Jasa & Layanan',       desc: 'Laundry, servis, salon, les' },
    { value: 'lainnya', label: '🏪 Lainnya',              desc: 'Kategori lain' },
];

export default function StoreSetup({ store, avatar_path }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name:          store?.name || '',
        category:      store?.category || '',
        description:   store?.description || '',
        profile_photo: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/umkm/store', {
            forceFormData: true,
            onSuccess: () => toast.success('Profil toko berhasil disimpan!'),
            onError: (errors) => {
                const msgs = Object.values(errors).flat();
                toast.error(msgs[0] as string || 'Gagal menyimpan profil toko');
            },
        });
    };

    return (
        <AppLayout activeTab="dashboard" showBottomNav={false}>
            <Head title="Setup Profil Toko" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/umkm/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="font-semibold text-foreground">
                        {store ? 'Edit Profil Toko' : 'Setup Profil Toko'}
                    </h1>
                    <p className="text-xs text-muted-foreground">Info ini digunakan AI untuk membuat konten yang relevan</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 pb-32 max-w-xl mx-auto">

                {/* AI Info Banner */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 text-sm">Mengapa perlu diisi?</p>
                            <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                                Nama toko, kategori, dan deskripsi digunakan AI untuk membuat video, poster, dan deskripsi produk yang relevan dan personal untuk bisnis Anda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Photo */}
                <div className="space-y-3">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">Foto Profil Toko *</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Foto ini akan digunakan sebagai wajah/subjek dalam video AI yang dihasilkan</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {/* Avatar preview - uses user's avatar (same as /profile) */}
                        <div className="relative">
                            <div className="w-28 h-28 bg-card rounded-2xl flex items-center justify-center shadow-md border-2 border-border overflow-hidden group cursor-pointer hover:border-primary transition-colors relative">
                                {data.profile_photo ? (
                                    <img
                                        src={URL.createObjectURL(data.profile_photo)}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                ) : avatar_path ? (
                                    <img
                                        src={`/storage/${avatar_path}`}
                                        className="w-full h-full object-cover"
                                        alt="Foto profil Anda"
                                    />
                                ) : (
                                    <Store className="w-12 h-12 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-white" />
                                    <span className="text-[9px] text-white mt-1">Ubah Foto</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('profile_photo', e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {data.profile_photo ? (
                            <p className="text-xs text-green-600 font-medium">✅ {data.profile_photo.name}</p>
                        ) : avatar_path ? (
                            <p className="text-xs text-muted-foreground">Klik foto untuk menggantinya</p>
                        ) : (
                            <p className="text-xs text-amber-600 font-medium">⚠️ Belum ada foto — wajib diisi untuk menggunakan AI Video</p>
                        )}
                    </div>
                </div>

                {/* Store Identity */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-t border-border pt-4">Identitas Toko</h2>

                    {/* Store Name */}
                    <label className="block">
                        <span className="text-sm font-medium text-foreground">Nama Toko / Usaha *</span>
                        <div className="relative mt-1">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Contoh: Warung Makan Bu Sari"
                                required
                            />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </label>

                    {/* Category */}
                    <div>
                        <span className="text-sm font-medium text-foreground">Kategori Usaha *</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setData('category', cat.value)}
                                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                                        data.category === cat.value
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-border bg-card hover:border-primary/40'
                                    }`}
                                >
                                    <p className="font-medium text-sm text-foreground">{cat.label}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{cat.desc}</p>
                                </button>
                            ))}
                        </div>
                        {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category}</p>}
                    </div>

                    {/* Description */}
                    <label className="block">
                        <span className="text-sm font-medium text-foreground">Deskripsi Singkat</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Ceritakan produk/layanan unggulan Anda. AI akan pakai ini sebagai referensi.</p>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="mt-2 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                            placeholder="Contoh: Kami menjual nasi goreng spesial dengan bumbu rahasia turun-temurun, tersedia dalam berbagai varian rasa..."
                        />
                        <p className="text-right text-[11px] text-muted-foreground mt-0.5">{data.description.length}/500</p>
                    </label>
                </div>

                {/* Submit */}
                <div className="sticky bottom-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
                    >
                        <Save className="w-5 h-5" />
                        {processing ? 'Menyimpan...' : 'Simpan Profil Toko'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
