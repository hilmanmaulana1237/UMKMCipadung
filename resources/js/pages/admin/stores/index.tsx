import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Store, Search, Package, ShoppingCart, DollarSign } from 'lucide-react';

interface UmkmStore {
    id: number;
    name: string;
    slug: string;
    address_pickup: string;
    is_open_today: boolean;
    products_count: number;
    orders_count: number;
    owner?: { name: string; email: string };
    created_at: string;
}

interface Props {
    stores: {
        data: UmkmStore[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function AdminStores({ stores, filters }: Props) {
    return (
        <AdminLayout title="Manajemen Toko UMKM">
            <Head title="Manajemen Toko" />

            {/* Search */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-6">
                <form className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Cari nama toko..."
                            defaultValue={filters.search}
                            className="flex-1 px-3 py-2 border border-border rounded-xl bg-background"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl font-medium">
                        Cari
                    </button>
                </form>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.data.map((store) => (
                    <Link
                        key={store.id}
                        href={`/admin/stores/${store.id}`}
                        className="bg-card rounded-2xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Store className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.is_open_today ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {store.is_open_today ? 'Buka' : 'Tutup'}
                            </span>
                        </div>
                        <h3 className="font-bold text-foreground">{store.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{store.address_pickup}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Owner: {store.owner?.name || 'N/A'}
                        </p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Package className="w-4 h-4" />
                                {store.products_count} Produk
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <ShoppingCart className="w-4 h-4" />
                                {store.orders_count} Order
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {stores.data.length === 0 && (
                <div className="bg-card rounded-2xl p-12 border border-border text-center">
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada toko ditemukan</p>
                </div>
            )}

            {/* Pagination */}
            {stores.links && stores.links.length > 3 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                    {stores.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${link.active
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-card border border-border hover:bg-muted text-foreground'
                                } ${!link.url && 'opacity-50 cursor-not-allowed hidden'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
