import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Product, ProductMenuCategory } from '@/types';
import {
    Plus, Package, ToggleLeft, ToggleRight, Pencil, ShoppingCart,
    AlertTriangle, Settings, Sparkles, Box, Search, Tag, X, Check,
    Trash2, GripVertical, FolderPlus, Layers
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface Stats {
    totalProducts: number;
    activeProducts: number;
    lowStockCount: number;
    pendingOrders: number;
}

interface PageProps {
    auth: {
        user: {
            store?: {
                name: string;
            };
        };
    };
    products: {
        data: Product[];
        links: any[];
    };
    productCategories: ProductMenuCategory[];
    stats?: Stats;
    filters?: {
        search?: string;
        category_id?: string;
    };
    [key: string]: unknown;
}

export default function UmkmProductsIndex({
    products,
    productCategories = [],
    stats,
    filters,
}: {
    products: PageProps['products'];
    productCategories?: ProductMenuCategory[];
    stats?: Stats;
    filters?: { search?: string; category_id?: string };
}) {
    const { auth } = usePage<PageProps>().props;
    const storeName = auth?.user?.store?.name || 'Toko Saya';
    const [search, setSearch] = useState(filters?.search || '');
    const [activeCategory, setActiveCategory] = useState<string>(filters?.category_id || 'all');

    // Category management states
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoryScrollRef = useRef<HTMLDivElement>(null);

    const toggleProduct = (productId: number) => {
        router.post(`/products/${productId}/toggle`, {}, { preserveScroll: true });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                router.get('/products', { search, category_id: activeCategory }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Filter by category
    const handleCategoryFilter = (categoryId: string) => {
        setActiveCategory(categoryId);
        router.get('/products', { search, category_id: categoryId }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Category CRUD
    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        router.post('/products/categories', { name: newCategoryName.trim() }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewCategoryName('');
                toast.success('Kategori berhasil ditambahkan!');
            },
            onError: () => toast.error('Gagal menambahkan kategori'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleUpdateCategory = (id: number) => {
        if (!editingCategoryName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        router.put(`/products/categories/${id}`, { name: editingCategoryName.trim() }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCategoryId(null);
                toast.success('Kategori berhasil diperbarui!');
            },
            onError: () => toast.error('Gagal memperbarui kategori'),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteCategory = (id: number, name: string) => {
        if (!confirm(`Hapus kategori "${name}"? Produk di kategori ini akan menjadi tanpa kategori.`)) return;
        router.delete(`/products/categories/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Kategori berhasil dihapus!'),
            onError: () => toast.error('Gagal menghapus kategori'),
        });
    };

    // Calculate stats from products if not provided
    const productStats = stats || {
        totalProducts: products.data.length,
        activeProducts: products.data.filter(p => p.is_active).length,
        lowStockCount: products.data.filter(p => p.stock < 10).length,
        pendingOrders: 0,
    };

    const uncategorizedCount = products.data.filter(p => !p.product_category_id).length;

    return (
        <AppLayout activeTab="products">
            <Head title="Produk Saya" />

            {/* Gradient Header */}
            <div className="px-4 pt-6 pb-5 bg-gradient-to-br from-primary via-blue-600 to-indigo-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-white/70 text-xs">Kelola Produk</p>
                        <h1 className="text-xl font-bold text-white">{storeName}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCategoryManager(!showCategoryManager)}
                            className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${showCategoryManager ? 'bg-white/30 ring-2 ring-white/50' : 'bg-white/15 hover:bg-white/25'}`}
                            title="Kelola Kategori"
                        >
                            <Layers className="w-5 h-5 text-white" />
                        </button>
                        <Link href="/umkm/setup-toko" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                            <Settings className="w-5 h-5 text-white" />
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl leading-5 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:ring-0 sm:text-sm backdrop-blur-sm"
                        placeholder="Cari produk..."
                    />
                </div>

                {/* Stats in Header */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <Package className="w-5 h-5 text-white/80 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{productStats.activeProducts}</p>
                        <p className="text-[10px] text-white/70">Aktif</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <ShoppingCart className="w-5 h-5 text-white/80 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{productStats.pendingOrders}</p>
                        <p className="text-[10px] text-white/70">Pesanan</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-amber-300 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{productStats.lowStockCount}</p>
                        <p className="text-[10px] text-white/70">Stok Tipis</p>
                    </div>
                </div>
            </div>

            {/* Category Manager Panel */}
            {showCategoryManager && (
                <div className="px-4 pt-4">
                    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <h3 className="font-semibold text-foreground">Kelola Kategori Menu</h3>
                                </div>
                                <button onClick={() => setShowCategoryManager(false)} className="p-1 hover:bg-black/10 rounded-lg">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Buat kategori untuk mengelompokkan produk di toko Anda (seperti GrabFood)
                            </p>
                        </div>

                        {/* Add Category */}
                        <div className="p-3 border-b border-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Nama kategori baru (misal: Minuman)"
                                    className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategoryName.trim() || isSubmitting}
                                    className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    Tambah
                                </button>
                            </div>
                        </div>

                        {/* Category List */}
                        <div className="divide-y divide-border max-h-64 overflow-y-auto">
                            {productCategories.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Belum ada kategori</p>
                                    <p className="text-xs text-muted-foreground mt-1">Tambahkan kategori pertama di atas!</p>
                                </div>
                            ) : (
                                productCategories.map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors">
                                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                                        {editingCategoryId === cat.id ? (
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingCategoryName}
                                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm border border-border rounded-lg bg-background focus:ring-2 focus:ring-purple-500"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleUpdateCategory(cat.id)}
                                                    disabled={isSubmitting}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingCategoryId(null)}
                                                    className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                                        {cat.products_count ?? 0} produk
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditingCategoryId(cat.id);
                                                        setEditingCategoryName(cat.name);
                                                    }}
                                                    className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter Tabs (Horizontal Scroll) */}
            {productCategories.length > 0 && (
                <div className="px-4 pt-4">
                    <div
                        ref={categoryScrollRef}
                        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <button
                            onClick={() => handleCategoryFilter('all')}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
                                }`}
                        >
                            Semua
                        </button>
                        {productCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryFilter(String(cat.id))}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === String(cat.id)
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
                                    }`}
                            >
                                {cat.name}
                                <span className="ml-1.5 text-xs opacity-70">({cat.products_count ?? 0})</span>
                            </button>
                        ))}
                        <button
                            onClick={() => handleCategoryFilter('uncategorized')}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'uncategorized'
                                ? 'bg-gray-700 text-white shadow-md'
                                : 'bg-card text-muted-foreground border border-border hover:border-gray-400'
                                }`}
                        >
                            Tanpa Kategori
                        </button>
                    </div>
                </div>
            )}

            {/* Add Product Button */}
            <div className="px-4 py-4">
                <Link
                    href="/products/create"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg"
                >
                    <Sparkles className="w-5 h-5" />
                    Tambah Produk dengan AI
                </Link>
            </div>

            {/* Products List */}
            <div className="px-4 pb-8">
                {products.data.length === 0 ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <Box className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground">Belum ada produk</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            Tambahkan produk pertama Anda dengan bantuan AI!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.data.map((product) => (
                            <div
                                key={product.id}
                                className="bg-card rounded-2xl p-3 border border-border flex gap-3"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                                    {product.image_path ? (
                                        <img
                                            src={`/storage/${product.image_path}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                            📦
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-foreground line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-primary font-bold text-sm">
                                                Rp {Number(product.price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleProduct(product.id)}
                                            className={`flex-shrink-0 p-1 ${product.is_active ? 'text-green-500' : 'text-gray-400'}`}
                                        >
                                            {product.is_active ? (
                                                <ToggleRight className="w-7 h-7" />
                                            ) : (
                                                <ToggleLeft className="w-7 h-7" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock < 10 ? 'bg-red-100 text-red-600' :
                                                product.stock < 20 ? 'bg-amber-100 text-amber-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                Stok: {product.stock}
                                            </span>
                                            {product.product_category ? (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                                                >
                                                    <Tag className="w-3 h-3" />
                                                    {product.product_category.name}
                                                </span>
                                            ) : null}
                                            {!product.is_active && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                    Nonaktif
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            href={`/products/${product.id}/edit`}
                                            className="p-2 hover:bg-muted rounded-lg"
                                        >
                                            <Pencil className="w-4 h-4 text-muted-foreground" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-1">
                        {products.links.map((link: any, i: number) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-3 py-1.5 min-w-[32px] text-sm font-medium rounded-lg flex items-center justify-center transition-colors ${link.active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                    preserveState
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 min-w-[32px] text-sm font-medium rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
