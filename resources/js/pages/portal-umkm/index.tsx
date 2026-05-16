import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Globe2,
    LayoutGrid,
    MapPin,
    Search,
    ShoppingBag,
    SlidersHorizontal,
    Store,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface PortalProduct {
    name: string;
    price: string | null;
    description: string | null;
    image_url: string | null;
}

interface PortalWebsite {
    id: number;
    store_id: number | null;
    slug: string;
    public_url: string;
    name: string;
    category: string;
    category_label: string;
    tagline: string | null;
    description: string | null;
    preview_image_url: string | null;
    address: string | null;
    phone: string | null;
    business_hours: string | null;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
    product_count: number;
    featured_products: PortalProduct[];
    template_name: string;
    updated_label: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface PortalCategory {
    id: string;
    name: string;
    count: number;
}

interface Props {
    websites: Paginated<PortalWebsite>;
    categories: PortalCategory[];
    filters: {
        search: string;
        category: string | null;
        sort: string;
    };
    stats: {
        published_count: number;
        open_count: number;
        product_count: number;
        store_count: number;
    };
}

const sortOptions = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'name', label: 'Nama A-Z' },
    { value: 'oldest', label: 'Terlama' },
];

const categoryTone: Record<string, string> = {
    kuliner: 'bg-amber-50 text-amber-700 border-amber-200',
    kriya: 'bg-rose-50 text-rose-700 border-rose-200',
    jasa: 'bg-blue-50 text-blue-700 border-blue-200',
    fashion: 'bg-violet-50 text-violet-700 border-violet-200',
    kerajinan: 'bg-sky-50 text-sky-700 border-sky-200',
    pertanian: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lainnya: 'bg-accent text-accent-foreground border-blue-200',
};

function buildPortalHref(filters: Props['filters'], next: Partial<Props['filters']> = {}) {
    const params = new URLSearchParams();
    const search = next.search !== undefined ? next.search : filters.search;
    const category = next.category !== undefined ? next.category : filters.category;
    const sort = next.sort !== undefined ? next.sort : filters.sort;

    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort && sort !== 'latest') params.set('sort', sort);

    const query = params.toString();

    return query ? `/portal-umkm?${query}` : '/portal-umkm';
}

function cleanPaginationLabel(label: string) {
    if (label.includes('Previous')) return 'Sebelumnya';
    if (label.includes('Next')) return 'Berikutnya';

    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
}

function WebsiteCard({ website }: { website: PortalWebsite }) {
    const tone = categoryTone[website.category] ?? categoryTone.lainnya;
    const schedule = website.business_hours || [website.open_time, website.close_time].filter(Boolean).join(' - ');

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl">
            <div className="relative aspect-[16/10] bg-slate-100">
                {website.preview_image_url ? (
                    <img
                        src={website.preview_image_url}
                        alt={website.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Store className="h-12 w-12 text-slate-300" />
                    </div>
                )}
                <div className="absolute left-3 top-3 flex gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
                        {website.category_label}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${website.is_open ? 'bg-emerald-500 text-white' : 'bg-slate-900/80 text-white'}`}>
                        {website.is_open ? 'Buka' : 'Tutup'}
                    </span>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div>
                    <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="line-clamp-1 text-lg font-bold text-slate-950">{website.name}</h2>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                                {website.tagline || website.description || 'Website UMKM Cipadung yang sudah dipublish.'}
                            </p>
                        </div>
                        <Globe2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-500">
                        {website.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="line-clamp-1">{website.address}</span>
                            </div>
                        )}
                        {schedule && (
                            <div className="flex items-center gap-2">
                                <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>{schedule}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-accent/70 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        {website.product_count} produk
                    </span>
                    <span className="text-xs text-slate-500">{website.template_name}</span>
                </div>

                {website.featured_products.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {website.featured_products.map((product, index) => (
                            <div key={`${product.name}-${index}`} className="w-28 shrink-0">
                                <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-slate-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <ShoppingBag className="h-5 w-5 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <p className="line-clamp-1 text-xs font-semibold text-slate-800">{product.name}</p>
                                {product.price && <p className="text-xs font-bold text-primary">{product.price}</p>}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex">
                    <a
                        href={website.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
                    >
                        Buka Website
                        <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export default function PortalUmkmIndex({ websites, categories, filters, stats }: Props) {
    const { auth } = usePage<{ auth: { user?: { role?: string } | null } }>().props;
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    const allCategories = useMemo(
        () => [{ id: '', name: 'Semua', count: stats.published_count }, ...categories],
        [categories, stats.published_count],
    );

    const dashboardUrl = auth?.user?.role === 'admin' ? '/admin/dashboard' : '/umkm/dashboard';

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(buildPortalHref(filters, { search }), {}, { preserveScroll: true, preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        router.get('/portal-umkm', {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <Head title="Portal Website UMKM Cipadung" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border bg-card/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                                <Globe2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-none">MudaPreneur.AI</p>
                                <p className="mt-1 text-xs text-slate-500">Portal UMKM Cipadung</p>
                            </div>
                        </Link>
                        <nav className="flex items-center gap-2">
                            <Link href="/marketplace" className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:block">
                                Marketplace
                            </Link>
                            <Link
                                href={auth?.user ? dashboardUrl : '/login'}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                            >
                                {auth?.user ? 'Dashboard' : 'Masuk'}
                            </Link>
                        </nav>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.24),transparent_34%)]" />
                        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8 lg:py-14">
                            <div>
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-white shadow-lg shadow-blue-900/10">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                    {stats.published_count} website sudah online
                                </div>
                                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                                    Portal Website UMKM Cipadung
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-blue-50/85">
                                    Kumpulan website hasil generate dari penjual UMKM. Cari toko, lihat produk unggulan, lalu buka website resmi mereka.
                                </p>

                                <form onSubmit={handleSearch} className="mt-7 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Cari nama toko, produk, atau alamat..."
                                            className="h-12 w-full rounded-xl border-0 bg-slate-50 pl-12 pr-4 text-sm font-medium outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-primary/50"
                                        />
                                    </div>
                                    <button className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/30">
                                        Cari Website
                                    </button>
                                </form>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-white">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                                    <p className="text-3xl font-black">{stats.store_count}</p>
                                    <p className="mt-1 text-sm text-blue-50/80">UMKM aktif</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                                    <p className="text-3xl font-black">{stats.open_count}</p>
                                    <p className="mt-1 text-sm text-blue-50/80">Sedang buka</p>
                                </div>
                                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-5">
                                    <p className="text-3xl font-black">{stats.product_count}</p>
                                    <p className="mt-1 text-sm text-blue-50/80">Produk dan layanan ditampilkan</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-bold text-slate-950">Direktori Website</p>
                                        <p className="text-sm text-slate-500">
                                            {websites.total > 0
                                                ? `Menampilkan ${websites.from}-${websites.to} dari ${websites.total} website`
                                                : 'Belum ada website pada filter ini'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(filters.search || filters.category || filters.sort !== 'latest') && (
                                        <button
                                            onClick={resetFilters}
                                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                            Reset
                                        </button>
                                    )}
                                    <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <select
                                            value={filters.sort}
                                            onChange={(event) => router.get(buildPortalHref(filters, { sort: event.target.value }), {}, { preserveScroll: true, preserveState: true })}
                                            className="bg-transparent text-sm font-semibold outline-none"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {allCategories.map((category) => {
                                    const active = (filters.category || '') === category.id;

                                    return (
                                        <Link
                                            key={category.id || 'all'}
                                            href={buildPortalHref(filters, { category: category.id })}
                                            preserveScroll
                                            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${active
                                                ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-blue-500/20'
                                                : 'border-border bg-white text-slate-600 hover:border-primary/50 hover:text-primary'
                                                }`}
                                        >
                                            {category.name}
                                            <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {category.count}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {websites.data.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {websites.data.map((website) => (
                                    <WebsiteCard key={website.id} website={website} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
                                <Store className="mx-auto h-12 w-12 text-slate-300" />
                                <h2 className="mt-4 text-xl font-bold text-slate-950">Website belum ditemukan</h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Coba pakai kata kunci lain atau kosongkan filter untuk melihat semua website UMKM yang sudah publish.
                                </p>
                                <button onClick={resetFilters} className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
                                    Lihat Semua Website
                                </button>
                            </div>
                        )}

                        {websites.last_page > 1 && (
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                {websites.links.map((link, index) => (
                                    link.url ? (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            className={`rounded-xl px-4 py-2 text-sm font-bold ${link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border border-border bg-white text-slate-600 hover:border-primary/50 hover:text-primary'
                                                }`}
                                        >
                                            {cleanPaginationLabel(link.label)}
                                        </Link>
                                    ) : (
                                        <span key={`${link.label}-${index}`} className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-bold text-slate-400">
                                            {cleanPaginationLabel(link.label)}
                                        </span>
                                    )
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}
