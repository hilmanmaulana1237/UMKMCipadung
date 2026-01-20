import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, Trash2, Upload, Tag, CheckCircle, X, Store, MapPin, AlertTriangle, Navigation, Loader2, QrCode, Eye, ShieldAlert } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useCart } from '@/hooks/useLocalStorage';
import { UmkmStore } from '@/types';

// Cipadung area center and radius (approximately 2km)
const CIPADUNG_CENTER = { lat: -6.9213, lng: 107.7101 };
const SERVICE_RADIUS_KM = 2;

interface PageProps {
    store?: UmkmStore | null;
    maintenanceMode?: boolean;
    adminFee?: number;
    storeAdminFee?: number;
    courierFee?: number;
    [key: string]: unknown;
}

export default function CheckoutIndex() {
    const { store: serverStore, maintenanceMode, adminFee = 0, storeAdminFee = 0, courierFee = 10000 } = usePage<PageProps>().props;
    const { cart, updateQuantity, removeFromCart, getTotal, getByStore, clearCart } = useCart();

    // States
    const [promoCode, setPromoCode] = useState('');
    const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [promoMessage, setPromoMessage] = useState('');
    const [promoType, setPromoType] = useState<string | null>(null);
    const [promoValue, setPromoValue] = useState<number>(0);

    // Derived State
    // Derived State
    const storeGroups = getByStore();
    const storeIds = Object.keys(storeGroups);

    // --- RESTORED STATES ---
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isInServiceArea, setIsInServiceArea] = useState(true);
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [storeStatuses, setStoreStatuses] = useState<Record<number, { is_open: boolean; open_time: string; close_time: string; admin_fee?: number }>>({});
    const [showQrisModal, setShowQrisModal] = useState(false);
    const [pendingRemoveItem, setPendingRemoveItem] = useState<{ productId: number; name: string } | null>(null);

    // --- RESTORED LOGIC ---
    const checkStoreStatus = () => {
        if (storeIds.length === 0) return;
        fetch('/checkout/check-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ store_ids: storeIds }),
        })
            .then((res) => res.json())
            .then((data) => setStoreStatuses(data))
            .catch((err) => console.error('Error fetching store status:', err));
    };

    useEffect(() => {
        checkStoreStatus();
        const interval = setInterval(checkStoreStatus, 5000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkStoreStatus();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [storeIds.length]);

    const handleQuantityDecrease = (productId: number, currentQuantity: number, itemName: string) => {
        if (currentQuantity === 1) {
            setPendingRemoveItem({ productId, name: itemName });
        } else {
            updateQuantity(productId, currentQuantity - 1);
        }
    };

    const confirmRemoveItem = () => {
        if (pendingRemoveItem) {
            removeFromCart(pendingRemoveItem.productId);
            setPendingRemoveItem(null);
        }
    };

    // Filter cart items based on selection
    const activeShopId = selectedStoreId;
    // Note: storeGroups[activeShopId] returns { storeName, items: [...] }
    const checkoutItems = activeShopId && storeGroups[activeShopId] ? storeGroups[activeShopId].items : [];

    // Calculation Logic
    const effectiveStoreFee = storeAdminFee > 0
        ? storeAdminFee
        : (activeShopId && storeStatuses[activeShopId]?.admin_fee ? storeStatuses[activeShopId].admin_fee! : 0);

    const productTotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Promo Logic (Frontend Estimation)
    let effectiveCourierFee = courierFee;
    let effectiveProductTotal = productTotal;

    if (promoStatus === 'valid') {
        // This logic is for DISPLAY ONLY. Backend does the real validation.
    }

    // Derived cart items for the actual checkout form is already calculated above.

    // Update storeQris based on active items
    const storeQris = checkoutItems[0]?.storeQris || null;
    const qrisHandle = checkoutItems[0]?.storeQrisHandle;
    const storeName = checkoutItems[0]?.storeName;
    const storeBankName = checkoutItems[0]?.storeBankName;
    const storeBankAccount = checkoutItems[0]?.storeBankAccount;
    const storeBankHolder = checkoutItems[0]?.storeBankHolder;

    const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank'>('qris');

    const { data, setData, post, processing, errors } = useForm({
        store_id: activeShopId || 0,
        items: checkoutItems.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
        })),
        shipping_address: '',
        shipping_lat: null as number | null,
        shipping_lng: null as number | null,
        promo_code: '',
        proof: null as File | null,
    });

    // Sync form data when activeShopId changes
    useEffect(() => {
        if (activeShopId) {
            setData((prev) => ({
                ...prev,
                store_id: activeShopId,
                items: cart
                    .filter(item => item.storeId === activeShopId)
                    .map(item => ({
                        product_id: item.productId,
                        quantity: item.quantity,
                    }))
            }));
        }
    }, [activeShopId, cart]);

    const validatePromo = async () => {
        if (!promoCode.trim()) return;

        // Helper to get cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        try {
            const xsrfToken = decodeURIComponent(getCookie('XSRF-TOKEN') || '');

            const response = await fetch('/promo/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify({ code: promoCode }),
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Akses ditolak (403). Pastikan Anda login sebagai Pembeli.');
                }
                if (response.status === 419) {
                    throw new Error('Sesi kadaluarsa (419). Silakan refresh halaman.');
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.valid) {
                setPromoStatus('valid');
                setPromoMessage(result.message);
                setPromoType(result.promo_type);
                setPromoValue(result.promo_value);
                setData('promo_code', promoCode.toUpperCase());
            } else {
                setPromoStatus('invalid');
                setPromoMessage(result.message || 'Kode tidak valid');
                setPromoType(null);
                setPromoValue(0);
            }
        } catch (e: any) {
            console.error('Promo validation error:', e);
            setPromoStatus('invalid');
            setPromoMessage(e.message || 'Gagal memvalidasi kode. Coba lagi.');
        }
    };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const openLocationModal = () => {
        // 1. Check for Secure Context (Required for Geolocation in modern browsers)
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            alert('Fitur lokasi membutuhkan koneksi aman (HTTPS). Silakan akses website menggunakan standar HTTPS.');
            return;
        }

        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung fitur lokasi.');
            return;
        }

        setLocationLoading(true);
        setLocationError(null);
        setShowLocationModal(true);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            setTempLocation({ lat: latitude, lng: longitude });

            // Check if within Cipadung service area
            const distance = calculateDistance(
                latitude, longitude,
                CIPADUNG_CENTER.lat, CIPADUNG_CENTER.lng
            );
            setIsInServiceArea(distance <= SERVICE_RADIUS_KM);
            setLocationLoading(false);
        };

        const error = (err: GeolocationPositionError) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            let msg = 'Gagal mendapatkan lokasi.';

            switch (err.code) {
                case err.PERMISSION_DENIED:
                    msg = 'Akses lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser Anda (ikon gembok di url bar).';
                    break;
                case err.POSITION_UNAVAILABLE:
                    msg = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
                    break;
                case err.TIMEOUT:
                    msg = 'Waktu permintaan lokasi habis. Silakan coba lagi.';
                    break;
                default:
                    msg = 'Terjadi kesalahan tidak diketahui saat mengambil lokasi.';
            }

            setLocationError(msg);
            setLocationLoading(false);
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    // Swipe to close state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only allow dragging from the top handle area or header to avoid conflict with map
        // But user said "modal ini", so let's try allowing mostly everywhere but be careful with map
        // Ideally checking e.target but let's try simple logic first
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        // Only allow dragging down
        if (diff > 0) {
            setDragOffset(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragOffset > 150) { // Threshold to close
            setShowLocationModal(false);
            setDragOffset(0);
        } else {
            setDragOffset(0); // Reset
        }
    };

    const confirmLocation = () => {
        if (tempLocation && isInServiceArea) {
            setData('shipping_lat', tempLocation.lat);
            setData('shipping_lng', tempLocation.lng);
            setLocationConfirmed(true);
            setShowLocationModal(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.proof) {
            alert('Mohon upload bukti pembayaran');
            return;
        }

        if (!data.shipping_address) {
            alert('Mohon isi patokan lokasi');
            return;
        }

        // Create form data with current cart state
        const formData = new FormData();
        formData.append('store_id', String(data.store_id || 0));
        formData.append('shipping_address', data.shipping_address);
        formData.append('shipping_lat', String(data.shipping_lat || ''));
        formData.append('shipping_lng', String(data.shipping_lng || ''));
        if (data.promo_code) {
            formData.append('promo_code', data.promo_code);
        }
        if (data.proof) {
            formData.append('proof', data.proof);
        }

        // Add items
        checkoutItems.forEach((item, index) => {
            formData.append(`items[${index}][product_id]`, String(item.productId));
            formData.append(`items[${index}][quantity]`, String(item.quantity));
        });

        // Use router.post directly with FormData
        router.post('/checkout', formData, {
            forceFormData: true,
            onSuccess: () => {
                // Only remove items from this store
                checkoutItems.forEach(item => removeFromCart(item.productId));
            },
            onError: (errors) => {
                console.error('Checkout validation errors:', errors);
                // Show specific error for promo code
                if (errors.promo_code) {
                    alert(errors.promo_code);
                } else if (errors.items) {
                    alert(errors.items);
                } else if (errors.store) {
                    alert(errors.store);
                } else {
                    // Generic error
                    const firstError = Object.values(errors)[0];
                    if (firstError) {
                        alert(typeof firstError === 'string' ? firstError : 'Terjadi kesalahan. Silakan coba lagi.');
                    }
                }
            }
        });
    };



    if (cart.length === 0) {
        return (
            <AppLayout activeTab="marketplace" showBottomNav={false}>
                <Head title="Checkout" />
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                    <Link href="/marketplace" className="p-2 hover:bg-muted rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-semibold text-foreground">Checkout</h1>
                </div>
                <div className="px-4 pt-8 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">Keranjang Kosong</p>
                    <p className="text-muted-foreground text-sm mt-1">Belanja dulu yuk!</p>
                    <Link
                        href="/marketplace"
                        className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-xl font-medium"
                    >
                        Belanja Sekarang
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // If multiple stores OR just one store, show selection UI first.
    // Ensure we show list if no store is explicitly selected.
    if (!selectedStoreId) {
        return (
            <>
                <AppLayout activeTab="marketplace" showBottomNav={false}>
                    <Head title="Keranjang Belanja" />
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                        <Link href="/marketplace" className="p-2 hover:bg-muted rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-semibold text-foreground">Keranjang Belanja</h1>
                    </div>

                    <div className="px-4 pt-4 pb-8 space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full shrink-0">
                                <Store className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Checkout per Toko</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Anda memiliki produk dari beberapa toko. Silakan pilih toko mana yang ingin Anda proses pembayarannya terlebih dahulu.
                                </p>
                            </div>
                        </div>

                        {Object.entries(storeGroups).map(([id, group]) => (
                            <div key={id} className="bg-card rounded-2xl border border-border overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-foreground">{group.storeName}</h3>
                                        {storeStatuses[Number(id)] && !storeStatuses[Number(id)].is_open && (
                                            <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                TUTUP
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                        {group.items.length} item
                                    </span>
                                </div>

                                <div className="p-4 space-y-3">
                                    {group.items.map((item) => (
                                        <div key={item.productId} className="flex items-start gap-3">
                                            <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center text-xl overflow-hidden">
                                                {item.image ? (
                                                    <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                                ) : '📦'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-foreground line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">x{item.quantity}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm font-bold text-primary">
                                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            handleQuantityDecrease(item.productId, item.quantity, item.name);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                                                    >
                                                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => {
                                                            updateQuantity(item.productId, item.quantity + 1);
                                                        }}
                                                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${item.stock !== undefined && item.quantity >= item.stock
                                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                {item.stock !== undefined && item.quantity >= item.stock && (
                                                    <span className="text-[10px] text-red-500 font-medium">
                                                        Maks: {item.stock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Estimasi</p>
                                        <p className="font-bold text-lg text-primary">
                                            Rp {group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedStoreId(Number(id));
                                            }}
                                            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                            disabled={(storeStatuses[Number(id)] && !storeStatuses[Number(id)].is_open) || group.items.some(item => item.stock !== undefined && item.quantity > item.stock)}
                                        >
                                            Checkout Toko Ini
                                        </button>
                                        {storeStatuses[Number(id)] && !storeStatuses[Number(id)].is_open && (
                                            <p className="text-xs text-destructive font-medium">
                                                Toko tutup. Buka jam {storeStatuses[Number(id)].open_time}
                                            </p>
                                        )}
                                        {group.items.some(item => item.stock !== undefined && item.quantity > item.stock) && (
                                            <p className="text-xs text-destructive font-bold animate-pulse">
                                                ⚠️ Ada produk melebihi stok
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AppLayout>
                {pendingRemoveItem && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999999,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px'
                        }}
                        onClick={() => setPendingRemoveItem(null)}
                    >
                        <div
                            className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">Hapus dari Keranjang?</h3>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Yakin mau hapus <span className="font-semibold text-foreground">"{pendingRemoveItem.name}"</span> dari keranjang belanja?
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPendingRemoveItem(null)}
                                    className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmRemoveItem}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                                >
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // If we have default to first store, we proceed to render form.
    // If not, we are in selection mode (handled above)
    // But we need to ensure we don't render empty form if activeShopId is null (which shouldn't happen if logic is correct)
    if (!activeShopId && storeIds.length > 0) return null; // Should have returned selection view above

    return (
        <>
            <AppLayout activeTab="marketplace" showBottomNav={false}>
                <Head title="Checkout" />

                {/* Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                    {activeShopId ? (
                        <button
                            onClick={() => setSelectedStoreId(null)}
                            className="p-2 hover:bg-muted rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <Link href="/marketplace" className="p-2 hover:bg-muted rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    )}
                    <h1 className="font-semibold text-foreground">Checkout</h1>
                </div>

                <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
                    {/* Validation Errors Alert */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800">Gagal Memproses Pesanan</h3>
                                <ul className="mt-1 list-disc list-inside text-sm text-red-700 space-y-1">
                                    {Object.entries(errors).map(([key, message]) => (
                                        <li key={key}>{message}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {/* Maintenance Mode Warning */}
                    {maintenanceMode && (
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-800">⚠️ Aplikasi sedang dalam pengembangan</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    Pemesanan baru tidak tersedia untuk sementara.
                                    Silakan coba beberapa saat lagi.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Store Closed Warning */}
                    {activeShopId && storeStatuses[activeShopId] && !storeStatuses[activeShopId].is_open && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
                            <div>
                                <h3 className="font-bold text-destructive">Toko Sedang Tutup 🛑</h3>
                                <p className="text-sm text-foreground mt-1">
                                    Maaf, toko ini sedang tidak beroperasional. Silakan kembali lagi besok pukul <span className="font-bold">{storeStatuses[activeShopId].open_time?.substring(0, 5)}</span> untuk melakukan checkout.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Store Info */}
                    {checkoutItems.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 font-medium">Pesanan dari</p>
                                    <p className="font-semibold text-slate-800">{checkoutItems[0]?.storeName}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3">Pesanan Anda</h2>
                        <div className="space-y-3">
                            {checkoutItems.map((item) => (
                                <div key={item.productId} className="flex items-center gap-3">
                                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-2xl">
                                        {item.image ? (
                                            <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                        ) : '📦'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                                        <p className="text-sm text-primary font-bold">
                                            Rp {item.price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityDecrease(item.productId, item.quantity, item.name)}
                                                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80"
                                            >
                                                {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.stock !== undefined && item.quantity >= item.stock
                                                    ? 'bg-muted text-gray-300 cursor-not-allowed'
                                                    : 'bg-muted hover:bg-muted/80'
                                                    }`}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {item.stock !== undefined && item.quantity >= item.stock && (
                                            <span className="text-[10px] text-red-500 font-medium">
                                                Maks: {item.stock} item
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location & Patokan */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Lokasi Pengiriman
                        </h2>

                        {/* Location Status */}
                        {locationConfirmed ? (
                            <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-3">
                                <div className="flex items-center gap-2 text-success">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-medium text-sm">Lokasi terkonfirmasi (Area Cipadung)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={openLocationModal}
                                    className="mt-2 text-xs text-primary font-medium"
                                >
                                    Ubah lokasi
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={openLocationModal}
                                className="w-full py-3 bg-primary/10 text-primary rounded-xl font-medium flex items-center justify-center gap-2 mb-3"
                            >
                                <Navigation className="w-4 h-4" />
                                Gunakan Lokasi Saat Ini
                            </button>
                        )}

                        {/* Patokan Field */}
                        <div>
                            <label className="text-sm text-muted-foreground block mb-2">
                                Alamat Lengkap dan Patokan untuk kurir (contoh: dekat warung Bu Ani)
                            </label>
                            <textarea
                                value={data.shipping_address}
                                onChange={(e) => setData('shipping_address', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Tulis Alamat dan patokan agar kurir mudah menemukan..."
                            />
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                            ⚠️ Layanan hanya tersedia di area Cipadung
                        </p>
                        {errors.shipping_address && (
                            <p className="text-sm text-destructive mt-1">{errors.shipping_address}</p>
                        )}
                    </div>

                    {/* Promo Code */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3">Kode Promo</h2>
                        {promoStatus === 'valid' ? (
                            <div className="mt-3 bg-success/10 border border-success/20 rounded-xl p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-success max-w-[80%]">
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm uppercase tracking-wider">{promoCode}</p>
                                        <p className="text-xs">{promoMessage}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPromoCode('');
                                        setPromoStatus('idle');
                                        setPromoMessage('');
                                        setData('promo_code', '');
                                    }}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => {
                                                setPromoCode(e.target.value.toUpperCase());
                                                setPromoStatus('idle');
                                            }}
                                            placeholder="Masukkan kode"
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={validatePromo}
                                        className="px-4 py-3 bg-primary text-white rounded-xl font-medium"
                                    >
                                        Cek
                                    </button>
                                </div>
                                {promoStatus === 'invalid' && (
                                    <div className="mt-2 flex items-center gap-2 text-destructive text-sm px-1">
                                        <X className="w-4 h-4" />
                                        {promoMessage}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3">Metode Pembayaran</h2>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('qris')}
                                className={`py-2 rounded-xl text-sm font-medium transition-colors border ${paymentMethod === 'qris'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                QRIS
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('bank')}
                                className={`py-2 rounded-xl text-sm font-medium transition-colors border ${paymentMethod === 'bank'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                Transfer Bank
                            </button>
                        </div>

                        {paymentMethod === 'qris' && (
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <QrCode className="w-5 h-5" />
                                    <h2 className="font-semibold">Scan QRIS untuk Bayar</h2>
                                </div>

                                {storeQris ? (
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-white rounded-xl p-2 shrink-0">
                                            <img
                                                src={`/storage/${storeQris}`}
                                                alt="QRIS"
                                                className="w-20 h-20 object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-blue-100 mb-1">Penerima:</p>
                                            <p className="font-bold text-lg truncate">
                                                {qrisHandle || storeName}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowQrisModal(true)}
                                                className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Lihat & Download QRIS
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                                        <p className="text-sm font-medium">QRIS Belum Tersedia</p>
                                        <p className="text-xs opacity-75 mt-1 px-4">
                                            Toko ini belum mengupload kode QRIS. Silakan gunakan metode Transfer Bank.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === 'bank' && (
                            <div className="bg-muted/30 rounded-xl p-4 border border-border space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Bank Tujuan</p>
                                    <p className="font-semibold text-foreground">{storeBankName || 'Bank belum diatur'}</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Nomor Rekening</p>
                                        <p className="font-mono font-bold text-lg text-primary tracking-wide">
                                            {storeBankAccount || '-'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            a.n. {storeBankHolder || storeName}
                                        </p>
                                    </div>
                                    {storeBankAccount && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(storeBankAccount);
                                                // Optional: toast logic here if you want
                                            }}
                                            className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Salin
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Proof Upload (Moved Below) */}
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h2 className="font-medium text-foreground mb-3">Bukti Pembayaran</h2>
                        <p className="text-sm text-muted-foreground mb-3">
                            Transfer ke rekening toko dan upload bukti pembayaran.
                        </p>
                        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                {data.proof ? data.proof.name : 'Upload bukti transfer'}
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('proof', e.target.files?.[0] || null)}
                                className="hidden"
                                id="proof-upload"
                            />
                            <label
                                htmlFor="proof-upload"
                                className="inline-block px-4 py-2 bg-muted text-foreground rounded-lg text-sm cursor-pointer"
                            >
                                Pilih Gambar
                            </label>
                        </div>
                        {errors.proof && (
                            <p className="text-sm text-destructive mt-2">{errors.proof}</p>
                        )}
                    </div>

                    {/* Payment Breakdown */}
                    <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
                        <h2 className="font-medium text-foreground mb-2">Rincian Pembayaran</h2>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal Produk</span>
                            <span>Rp {productTotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Biaya Layanan Aplikasi</span>
                            <span>Rp {adminFee.toLocaleString('id-ID')}</span>
                        </div>
                        {effectiveStoreFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Biaya Layanan QRIS Toko</span>
                                <span>Rp {effectiveStoreFee.toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        {promoStatus === 'valid' && promoType === 'discount' && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Diskon Promo</span>
                                <span>- Rp {Math.min(productTotal, promoValue).toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        <div className="h-px bg-border my-2" />

                        {/* Total Transfer */}
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Total Transfer</span>
                            <span className="text-xl font-bold text-primary">
                                Rp {(
                                    productTotal + adminFee + effectiveStoreFee -
                                    (promoStatus === 'valid' && promoType === 'discount' ? Math.min(productTotal, promoValue) : 0)
                                ).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg mt-1">
                            ℹ️ Mohon transfer sesuai nominal ini (Produk + Admin)
                        </p>

                        <div className="h-px bg-border my-2" />

                        {/* Courier Fee (Cash) */}
                        <div className="flex justify-between items-center bg-orange-50 p-3 rounded-xl border border-orange-100">
                            <div className="flex flex-col">
                                <span className="font-bold text-orange-800">Ongkos Kirim (Tunai)</span>
                                <span className="text-xs text-orange-600">Bayar Cash ke Kurir</span>
                            </div>
                            <div className="text-right">
                                {promoStatus === 'valid' && promoType === 'free_shipping' ? (
                                    <>
                                        <span className="text-lg font-bold text-green-600">Rp 0</span>
                                        <p className="text-xs text-muted-foreground line-through">Rp {courierFee.toLocaleString('id-ID')}</p>
                                    </>
                                ) : (
                                    <span className="text-lg font-bold text-orange-700">Rp {courierFee.toLocaleString('id-ID')}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            processing ||
                            maintenanceMode ||
                            !locationConfirmed ||
                            (activeShopId ? (storeStatuses[activeShopId] && !storeStatuses[activeShopId].is_open) : false) ||
                            checkoutItems.some(item => item.stock !== undefined && item.quantity > item.stock)
                        }
                        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold disabled:opacity-50 disabled:grayscale"
                    >
                        {processing ? 'Memproses...' : maintenanceMode ? '🛠️ Maintenance Mode' : !locationConfirmed ? 'Konfirmasi Lokasi Dulu' : 'Bayar Sekarang'}
                    </button>

                    {/* Emergency Contact Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                        <p className="text-xs text-amber-800 text-center">
                            <strong>⚠️ Perhatian:</strong> Jika terjadi masalah dengan pesanan Anda, hubungi admin aplikasi di{' '}
                            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="font-bold underline">
                                0812-3456-7890
                            </a>
                        </p>
                    </div>
                </form>

                {/* Location Confirmation Modal */}
                {showLocationModal && (
                    <div
                        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center transition-opacity"
                        onClick={() => setShowLocationModal(false)}
                    >
                        <div
                            className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 animate-in slide-in-from-bottom transition-transform duration-200 ease-out"
                            style={{ transform: `translateY(${dragOffset}px)` }}
                            onClick={(e) => e.stopPropagation()}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

                            <h3 className="text-lg font-bold text-center mb-4">Konfirmasi Lokasi</h3>

                            {locationLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                                    <p className="text-muted-foreground">Mendapatkan lokasi...</p>
                                </div>
                            ) : locationError ? (
                                <div className="py-8 text-center">
                                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                    <p className="text-foreground font-medium">{locationError}</p>
                                    <button
                                        onClick={() => setShowLocationModal(false)}
                                        className="mt-4 px-6 py-2 bg-muted rounded-xl font-medium"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            ) : tempLocation ? (
                                <>
                                    {/* Map Display */}
                                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-border mb-4">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${tempLocation.lng - 0.005}%2C${tempLocation.lat - 0.003}%2C${tempLocation.lng + 0.005}%2C${tempLocation.lat + 0.003}&layer=mapnik&marker=${tempLocation.lat}%2C${tempLocation.lng}`}
                                            allowFullScreen
                                        />
                                    </div>

                                    {isInServiceArea ? (
                                        <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-4">
                                            <div className="flex items-center gap-2 text-success">
                                                <CheckCircle className="w-5 h-5" />
                                                <span className="font-medium">Lokasi dalam area layanan Cipadung</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                                            <div className="flex items-center gap-2 text-destructive">
                                                <AlertTriangle className="w-5 h-5" />
                                                <span className="font-medium">Di luar area layanan</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Maaf, saat ini layanan hanya tersedia di area Cipadung.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowLocationModal(false)}
                                            className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmLocation}
                                            disabled={!isInServiceArea}
                                            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
                                        >
                                            Konfirmasi
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* QRIS Preview Modal */}
                {showQrisModal && storeQris && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowQrisModal(false)}>
                        <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowQrisModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-xl font-bold text-center mb-1">QRIS Pembayaran</h3>
                            <p className="text-sm text-center text-muted-foreground mb-6">
                                Scan untuk membayar
                            </p>

                            <div className="bg-white rounded-xl p-4 border-2 border-slate-100 shadow-sm mb-4">
                                <img
                                    src={`/storage/${storeQris}`}
                                    alt="QRIS"
                                    className="w-full h-auto"
                                />
                            </div>

                            <div className="text-center mb-6">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Penerima</p>
                                <p className="text-lg font-bold text-slate-800">{qrisHandle || storeName}</p>
                            </div>

                            <div className="space-y-3">
                                <a
                                    href={`/storage/${storeQris}`}
                                    download={`QRIS-${storeName}.jpg`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Upload className="w-4 h-4 rotate-180" /> {/* Download icon hack */}
                                    Download QRIS
                                </a>
                                <p className="text-xs text-center text-muted-foreground">
                                    Total Tagihan: <strong className="text-primary">Rp {(checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + adminFee + effectiveStoreFee).toLocaleString('id-ID')}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </AppLayout>
            {pendingRemoveItem && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999999,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                    onClick={() => setPendingRemoveItem(null)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-3xl p-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Hapus dari Keranjang?</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Yakin mau hapus <span className="font-semibold text-foreground">"{pendingRemoveItem.name}"</span> dari keranjang belanja?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingRemoveItem(null)}
                                className="flex-1 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmRemoveItem}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
