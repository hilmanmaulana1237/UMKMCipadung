import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Product, UmkmStore, ProductMenuCategory } from '@/types';
import { ArrowLeft, Store as StoreIcon, MapPin, ShoppingCart, Package, Star, Tag } from 'lucide-react';
import { useCart } from '@/hooks/useLocalStorage';
import StarDisplay from '@/components/StarDisplay';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';

import SeoHead from '@/components/SeoHead';

interface Props {
    store: UmkmStore;
    products: {
        data: Product[];
        links: any[];
    };
    productCategories: ProductMenuCategory[];
}

export default function StorePage({ store, products, productCategories = [] }: Props) {
    const { getItemCount } = useCart();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const tabsRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Group products by category
    const groupedProducts = useMemo(() => {
        const groups: { id: string; name: string; products: Product[] }[] = [];

        if (productCategories.length === 0) {
            // No categories defined — show all products flat
            return [{ id: 'all', name: 'Semua Produk', products: products.data }];
        }

        // Products grouped by their category (use Number() to avoid string/number mismatch)
        for (const cat of productCategories) {
            const catProducts = products.data.filter(p => Number(p.product_category_id) === Number(cat.id));
            if (catProducts.length > 0) {
                groups.push({ id: String(cat.id), name: cat.name, products: catProducts });
            }
        }

        // Uncategorized products (null or undefined or 0)
        const categorizedIds = new Set(productCategories.map(c => Number(c.id)));
        const uncategorized = products.data.filter(p => !p.product_category_id || !categorizedIds.has(Number(p.product_category_id)));
        if (uncategorized.length > 0) {
            groups.push({ id: 'uncategorized', name: 'Lainnya', products: uncategorized });
        }

        return groups;
    }, [products.data, productCategories]);

    // Handle category tab click — smooth scroll to section
    const scrollToCategory = useCallback((categoryId: string) => {
        setActiveCategory(categoryId);
        if (categoryId === 'all') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const section = sectionRefs.current[categoryId];
        if (section) {
            const offset = 120; // tabs height + some padding
            const top = section.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, []);

    // Scroll active tab into view
    useEffect(() => {
        const activeBtn = tabsRef.current?.querySelector(`[data-cat="${activeCategory}"]`) as HTMLElement;
        if (activeBtn && tabsRef.current) {
            const container = tabsRef.current;
            const scrollLeft = activeBtn.offsetLeft - container.offsetWidth / 2 + activeBtn.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [activeCategory]);

    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": store.name,
        "image": store.store_photo_path ? `https://umkmcipadung.com/storage/${store.store_photo_path}` : undefined,
        "description": store.description,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": store.address_pickup,
            "addressLocality": "Cipadung",
            "addressRegion": "Jawa Barat",
            "addressCountry": "ID"
        },
        "priceRange": "Rp 10.000 - Rp 500.000",
        "openingHours": store.open_time && store.close_time ? `Mo-Su ${store.open_time}-${store.close_time}` : undefined,
        "url": `https://umkmcipadung.com/marketplace/store/${store.id}`
    };

    const hasCategories = productCategories.length > 0;

    return (
        <AppLayout activeTab="marketplace" showBottomNav={false}>
            <SeoHead
                title={`${store.name} - Marketplace Cipadung`}
                description={`Kunjungi toko ${store.name} di Marketplace Cipadung. ${store.description || 'Temukan produk lokal berkualitas terbaik disini.'}`}
                image={store.store_photo_path ? `https://umkmcipadung.com/storage/${store.store_photo_path}` : undefined}
                type="profile"
                url={`https://umkmcipadung.com/marketplace/store/${store.id}`}
                schema={schema}
            />

            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                    <Link href="/marketplace" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-semibold text-foreground line-clamp-1">{store.name}</h1>
                </div>
                <Link href="/checkout" className="relative p-2 hover:bg-muted rounded-full">
                    <ShoppingCart className="w-5 h-5" />
                    {getItemCount() > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            {getItemCount()}
                        </span>
                    )}
                </Link>
            </div>

            {/* Store Info Banner */}
            <div className="relative">
                {store.banner_path ? (
                    <div className="h-48 md:h-64 w-full relative">
                        <img
                            src={`/storage/${store.banner_path}`}
                            alt={`${store.name} banner`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                    </div>
                ) : (
                    <div className="h-48 md:h-64 w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pb-6">
                    <div className="flex items-end gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1 rounded-2xl shadow-lg -mb-2 overflow-hidden flex-shrink-0">
                            {store.profile_photo_path ? (
                                <img
                                    src={`/storage/${store.profile_photo_path}`}
                                    alt={store.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-xl">
                                    <StoreIcon className="w-10 h-10 text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white">{store.name}</h2>
                            {store.average_rating && store.total_ratings && store.total_ratings > 0 ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.round(store.average_rating!) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-semibold text-sm">{store.average_rating.toFixed(1)}</span>
                                    <span className="text-white/70 text-sm">({store.total_ratings} rating)</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star className="w-4 h-4 text-white/30" />
                                    <span className="text-white/70 text-sm italic">Belum ada rating</span>
                                </div>
                            )}
                            {store.address_pickup && (
                                <div className="flex items-center gap-1 mt-1 text-white/70 text-sm">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span className="line-clamp-1">{store.address_pickup}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {store.description && (
                        <p className="text-white/80 text-sm mt-3 line-clamp-2">{store.description}</p>
                    )}
                </div>
            </div>

            {/* Sentiment Card */}
            {store.review_stats && (store.review_stats.positive_count > 0 || store.review_stats.negative_count > 0) && (
                <div className="px-4 pt-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span className="font-semibold text-slate-800">Sentimen Pembeli</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                            {store.review_stats.positive_count > store.review_stats.negative_count
                                ? '😊 Pembeli menyukai produk ini! Banyak yang bilang produknya bagus.'
                                : store.review_stats.positive_count < store.review_stats.negative_count
                                    ? '😞 Ada beberapa keluhan dari pembeli. Pertimbangkan baik-baik sebelum membeli.'
                                    : '😐 Pendapat pembeli beragam tentang produk ini.'}
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500">
                                    <path d="M7 10v12"></path>
                                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"></path>
                                </svg>
                                <span className="text-sm font-medium text-green-600">
                                    {store.review_stats.positive_count} positif
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-400">
                                    <path d="M17 14V2"></path>
                                    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"></path>
                                </svg>
                                <span className="text-sm font-medium text-red-500">
                                    {store.review_stats.negative_count} negatif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== GrabFood-Style Category Tabs ===== */}
            {hasCategories && (
                <div className="sticky top-[57px] z-10 bg-background/95 backdrop-blur-sm border-b border-border">
                    <div
                        ref={tabsRef}
                        className="flex gap-1 px-4 py-2.5 overflow-x-auto"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <button
                            data-cat="all"
                            onClick={() => scrollToCategory('all')}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === 'all'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            🍽️ Semua
                        </button>
                        {groupedProducts.map((group) => (
                            <button
                                key={group.id}
                                data-cat={group.id}
                                onClick={() => scrollToCategory(group.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === group.id
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {group.name}
                                <span className="ml-1 text-xs opacity-75">({group.products.length})</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== Products Grouped by Category ===== */}
            <div className="px-4 py-4 space-y-6">
                {products.data.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Belum ada produk</p>
                    </div>
                ) : hasCategories ? (
                    // Grouped view
                    groupedProducts.map((group) => (
                        <div
                            key={group.id}
                            ref={(el) => { sectionRefs.current[group.id] = el; }}
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                                <Tag className="w-4 h-4 text-green-600" />
                                <h3 className="font-bold text-slate-800">{group.name}</h3>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {group.products.length} item
                                </span>
                            </div>

                            {/* Products in this group */}
                            <div className="grid grid-cols-2 gap-3">
                                {group.products.map((product) => (
                                    <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Flat view (no categories)
                    <>
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Produk ({products.data.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} formatPrice={formatPrice} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="h-8" />
        </AppLayout>
    );
}

function ProductCard({ product, formatPrice }: { product: Product; formatPrice: (p: number) => string }) {
    return (
        <Link
            href={`/marketplace/product/${product.id}`}
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all group"
        >
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {product.image_path ? (
                    <img
                        src={`/storage/${product.image_path}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
                        📦
                    </div>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Sisa {product.stock}
                    </div>
                )}
            </div>
            <div className="p-3">
                <h4 className="font-medium text-sm text-slate-800 line-clamp-2 leading-snug">
                    {product.name}
                </h4>
                <p className="text-primary font-bold mt-1.5 text-[15px]">
                    {formatPrice(Number(product.price))}
                </p>
                {product.product_category && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                        <Tag className="w-2.5 h-2.5" />
                        {product.product_category.name}
                    </span>
                )}
            </div>
        </Link>
    );
}
