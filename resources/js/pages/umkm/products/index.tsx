import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Product } from '@/types';
import { Plus, Package, ToggleLeft, ToggleRight, Pencil, ShoppingCart, AlertTriangle, Settings, Sparkles, Box, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    stats?: Stats;
    filters?: {
        search?: string;
    };
    [key: string]: unknown;
}

export default function UmkmProductsIndex({ products, stats, filters }: { products: PageProps['products']; stats?: Stats; filters?: { search?: string } }) {
    const { auth } = usePage<PageProps>().props;
    const storeName = auth?.user?.store?.name || 'Toko Saya';
    const [search, setSearch] = useState(filters?.search || '');

    const toggleProduct = (productId: number) => {
        router.post(`/products/${productId}/toggle`, {}, { preserveScroll: true });
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                router.get('/products', { search }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Calculate stats from products if not provided
    const productStats = stats || {
        totalProducts: products.data.length,
        activeProducts: products.data.filter(p => p.is_active).length,
        lowStockCount: products.data.filter(p => p.stock < 10).length,
        pendingOrders: 0,
    };

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
                    <Link href="/umkm/setup-toko" className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                        <Settings className="w-5 h-5 text-white" />
                    </Link>
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
                                                Rp {product.price.toLocaleString('id-ID')}
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
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock < 10 ? 'bg-red-100 text-red-600' :
                                                product.stock < 20 ? 'bg-amber-100 text-amber-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                Stok: {product.stock}
                                            </span>
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
                        {products.links.map((link, i) => (
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
