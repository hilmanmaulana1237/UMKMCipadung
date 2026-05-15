import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LayoutDashboard, Users, Search, ChevronRight, Video, Image, MessageCircle, Plus, X, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Seller {
    id: number;
    name: string;
    email: string;
    avatar_path: string | null;
    created_at: string;
    total_content: number;
    video_count: number;
    poster_count: number;
    chat_count: number;
    store_name: string | null;
    store_incomplete: boolean;
    umkm_store: { id: number; name: string } | null;
}

interface Props {
    sellers: { data: Seller[]; links: any[]; current_page: number; last_page: number };
    search: string;
}

export default function AdminSellers({ sellers, search }: Props) {
    const { flash } = usePage<any>().props;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/sellers', { search: searchQuery }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/sellers', {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/sellers/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Daftar Penjual - Admin" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">Admin <span className="text-blue-600">Panel</span></span>
                        </div>
                        <nav className="hidden sm:flex items-center gap-1">
                            <Link href="/admin/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Dashboard</Link>
                            <Link href="/admin/sellers" className="px-3 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg">Penjual</Link>
                            <Link href="/admin/contents" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Konten AI</Link>
                            <Link href="/admin/chats" className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Chat AI</Link>
                        </nav>
                    </div>
                </div>
            </nav>

            {/* Mobile nav */}
            <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
                <Link href="/admin/dashboard" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Dashboard</Link>
                <Link href="/admin/sellers" className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg whitespace-nowrap">Penjual</Link>
                <Link href="/admin/contents" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Konten AI</Link>
                <Link href="/admin/chats" className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg whitespace-nowrap">Chat AI</Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-medium">
                        ✅ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium">
                        ❌ {flash.error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Daftar Penjual</h1>
                        <p className="text-slate-500 text-sm mt-1">Monitor dan kelola akun penjual UMKM</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama atau email..."
                                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cari</button>
                        </form>

                        {/* Create seller button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Akun Penjual
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {sellers.data.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {sellers.data.map((seller) => (
                                <div key={seller.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                                    <Link href={`/admin/sellers/${seller.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold shrink-0">
                                            {seller.avatar_path ? (
                                                <img src={`/storage/${seller.avatar_path}`} className="w-full h-full rounded-xl object-cover" alt="" />
                                            ) : (
                                                seller.name[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 truncate">{seller.name}</p>
                                            <p className="text-sm text-slate-500 truncate">{seller.email}</p>
                                            {seller.store_incomplete ? (
                                                <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    ⚠️ Belum setup toko
                                                </span>
                                            ) : seller.store_name ? (
                                                <p className="text-xs text-blue-600 mt-0.5">🏪 {seller.store_name}</p>
                                            ) : null}
                                        </div>
                                        <div className="hidden sm:flex gap-3 shrink-0">
                                            <div className="text-center px-3">
                                                <p className="text-lg font-bold text-indigo-600">{seller.video_count}</p>
                                                <p className="text-[10px] text-slate-500">Video</p>
                                            </div>
                                            <div className="text-center px-3">
                                                <p className="text-lg font-bold text-pink-600">{seller.poster_count}</p>
                                                <p className="text-[10px] text-slate-500">Poster</p>
                                            </div>
                                            <div className="text-center px-3">
                                                <p className="text-lg font-bold text-cyan-600">{seller.chat_count}</p>
                                                <p className="text-[10px] text-slate-500">Chat</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                                    </Link>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => setDeleteTarget(seller)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Hapus akun penjual"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 mb-4">Tidak ada penjual ditemukan</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Akun Penjual Pertama
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {sellers.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {sellers.links?.filter((l: any) => l.url).map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url}
                                className={`px-3 py-1.5 text-sm rounded-lg ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Seller Modal ── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Buat Akun Penjual</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Daftarkan akun UMKM baru</p>
                            </div>
                            <button
                                onClick={() => { setShowCreateModal(false); reset(); }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="contoh@email.com"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Min. 8 karakter"
                                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                                <p className="mt-1 text-[11px] text-slate-400">Password akan disimpan agar dapat dibagikan ke penjual.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); reset(); }}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                                >
                                    {processing ? 'Membuat...' : 'Buat Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 mb-1">Hapus Akun Penjual?</h2>
                            <p className="text-sm text-slate-500 mb-1">
                                Anda akan menghapus akun:
                            </p>
                            <p className="font-semibold text-slate-800">{deleteTarget.name}</p>
                            <p className="text-sm text-slate-500 mb-4">{deleteTarget.email}</p>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
                                <p className="text-xs text-red-700">⚠️ Semua data AI (video, poster, chat) dan toko penjual ini akan ikut terhapus secara permanen.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
