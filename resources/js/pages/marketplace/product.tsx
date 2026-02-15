import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Product, UmkmStore } from '@/types';
import { ShoppingCart, Store, ArrowLeft, Minus, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useLocalStorage';

import SeoHead from '@/components/SeoHead';

interface Props {
    product: Product & { store: UmkmStore };
    relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: Props) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const { addToCart, getItemCount, cart } = useCart();

    // Derived store ID for robust checkout link
    const storeId = cart.length > 0 ? cart[0].storeId : null;
    const checkoutUrl = storeId ? `/checkout?store_id=${storeId}` : '/checkout';

    const { auth } = usePage<any>().props;
    const isBuyer = auth.user.role === 'buyer';

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image_path,
            storeId: product.store.id,
            storeName: product.store.name,
            storeQris: product.store.qris_path,
            storeQrisHandle: product.store.qris_handle,
            storeBankName: product.store.bank_name,
            storeBankAccount: product.store.bank_account,
            storeBankHolder: product.store.bank_holder,
            stock: product.stock,
        }, quantity);

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const goToCheckout = () => {
        handleAddToCart();
        router.visit(`/checkout?store_id=${product.store.id}`);
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image_path ? `https://umkmcipadung.com/storage/${product.image_path}` : undefined,
        "description": product.description || `Beli ${product.name} dari toko ${product.store.name} di Marketplace Cipadung.`,
        "sku": `P-${product.id}`,
        "offers": {
            "@type": "Offer",
            "url": `https://umkmcipadung.com/marketplace/product/${product.id}`,
            "priceCurrency": "IDR",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": product.store.name
            }
        }
    };

    return (
        <AppLayout activeTab="marketplace" showBottomNav={false}>
            <SeoHead
                title={`${product.name} - Jual Murah Cipadung`}
                description={`Jual ${product.name} termurah di Cipadung. Harga ${formatPrice(Number(product.price))}. Stok ${product.stock > 0 ? 'Tersedia' : 'Habis'}. Pesan sekarang via Marketplace Cipadung.`}
                image={product.image_path ? `https://umkmcipadung.com/storage/${product.image_path}` : undefined}
                type="product"
                url={`https://umkmcipadung.com/marketplace/product/${product.id}`}
                schema={schema}
            />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                    <Link href="/marketplace" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-semibold text-foreground line-clamp-1">{product.name}</h1>
                </div>

                {isBuyer && (
                    <Link href={checkoutUrl} className="relative p-2 hover:bg-muted rounded-full">
                        <ShoppingCart className="w-5 h-5" />
                        {getItemCount() > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                {getItemCount()}
                            </span>
                        )}
                    </Link>
                )}
            </div>

            {/* Product Image */}
            <div className="aspect-square bg-muted">
                {product.image_path ? (
                    <img
                        src={`/storage/${product.image_path}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="px-4 py-4">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs rounded-full capitalize">
                    {product.category}
                </span>
                <h2 className="text-xl font-bold text-foreground mt-2">{product.name}</h2>
                <p className="text-2xl font-bold text-primary mt-2">
                    {formatPrice(Number(product.price))}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Stok: {product.stock} tersedia
                </p>

                {/* Special Instruction for Services (Jasa) */}
                {product.category === 'jasa' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h3 className="font-bold text-blue-800 mb-2">Cara Pemesanan Jasa</h3>
                                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                                    <li>Datang ke lokasi toko (Drop-off)</li>
                                    <li>Serahkan barang untuk ditimbang/dicek</li>
                                    <li>Tunggu konfirmasi total harga dari petugas</li>
                                    <li>Lakukan pembayaran via Aplikasi ini</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Store Info */}
            <div className="px-4 py-3 border-t border-border">
                <Link
                    href={`/marketplace/store/${product.store.id}`}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-foreground">{product.store.name}</p>
                        <p className="text-xs text-muted-foreground">{product.store.address_pickup}</p>
                    </div>
                </Link>
            </div>

            {/* Description */}
            <div className="px-4 py-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-2">Deskripsi</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {product.description || 'Tidak ada deskripsi'}
                </p>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="px-4 py-4 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3">Produk Serupa</h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {relatedProducts.map((related) => (
                            <Link
                                key={related.id}
                                href={`/marketplace/product/${related.id}`}
                                className="flex-shrink-0 w-32 bg-card rounded-xl overflow-hidden border border-border"
                            >
                                <div className="aspect-square bg-muted">
                                    {related.image_path ? (
                                        <img
                                            src={`/storage/${related.image_path}`}
                                            alt={related.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-medium line-clamp-2">{related.name}</p>
                                    <p className="text-xs font-bold text-primary mt-1">
                                        {formatPrice(Number(related.price))}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Fixed Bottom CTA */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-background border-t border-border">
                {isBuyer ? (
                    <div className="flex items-center gap-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={goToCheckout}
                            disabled={added}
                            className={`flex-1 py-4 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all ${added
                                ? 'bg-success text-white'
                                : 'bg-primary text-white'
                                }`}
                        >
                            {added ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Ditambahkan!
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5" />
                                    Keranjang
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="w-full py-3 bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-center font-medium">
                        👁️ Mode Preview (Tidak bisa membeli)
                    </div>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-24"></div>
        </AppLayout>
    );
}

