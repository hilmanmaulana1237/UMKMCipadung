import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Upload, Save, Sparkles, Loader2, Lightbulb, Camera, Wand2 } from 'lucide-react';
import { FormEvent, useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
}

interface Props {
    categories: Category[];
}

interface PriceSuggestion {
    min: number;
    max: number;
    suggested: number;
    message: string;
}

export default function CreateProduct({ categories }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        price: '',
        stock: '',
        category: 'kuliner',
        description: '',
        image: null as File | null,
        is_physical: true,
    });

    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(false);
    const [isEnhanced, setIsEnhanced] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    // Create preview URL for uploaded image
    const imagePreviewUrl = useMemo(() => {
        if (data.image) {
            return URL.createObjectURL(data.image);
        }
        return null;
    }, [data.image]);

    // Cleanup URL on unmount
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    // Clear price suggestion when category changes
    useEffect(() => {
        setPriceSuggestion(null);
    }, [data.category]);

    // Debounced price suggestion when name changes (1 second after user stops typing)
    useEffect(() => {
        // Only fetch if name has at least 5 characters
        if (data.name.length >= 5 && data.category) {
            setPriceSuggestion(null); // Clear previous
            const timer = setTimeout(() => {
                fetchPriceSuggestion();
            }, 1000); // 1 second debounce
            return () => clearTimeout(timer);
        } else {
            setPriceSuggestion(null);
        }
    }, [data.name, data.category]);

    const fetchPriceSuggestion = async () => {
        if (!data.name || !data.category) return;

        setIsLoadingPrice(true);
        try {
            const response = await fetch('/ai/suggest-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: data.name,
                    category: data.category,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setPriceSuggestion({
                    min: result.min_price,
                    max: result.max_price,
                    suggested: result.suggested,
                    message: result.message,
                });
            }
        } catch (error) {
            console.error('Failed to fetch price suggestion:', error);
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const generateDescription = async () => {
        if (!data.name) {
            toast.error('Masukkan nama produk terlebih dahulu');
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const response = await fetch('/ai/generate-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: data.name,
                    category: data.category,
                    price: data.price ? parseFloat(data.price) : null,
                }),
            });

            const result = await response.json();
            if (result.success && result.description) {
                setData('description', result.description);
                toast.success('Deskripsi berhasil dibuat oleh AI! ✨');
            } else {
                toast.error('Gagal membuat deskripsi');
            }
        } catch (error) {
            console.error('Failed to generate description:', error);
            toast.error('Terjadi kesalahan saat membuat deskripsi');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            price: data.price.toString().replace(/\./g, ''),
        }));
        post('/products', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout activeTab="products" showBottomNav={false}>
            <Head title="Tambah Produk" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/products" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-semibold text-foreground">Tambah Produk</h1>
                <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                </span>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
                {/* Image Upload with AI Photo Studio */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">
                            Foto Produk
                        </label>
                        {data.image && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEnhancing(true);
                                    setTimeout(() => {
                                        setIsEnhanced(!isEnhanced);
                                        setIsEnhancing(false);
                                        toast.success(isEnhanced ? 'Filter dihapus' : '✨ Foto dioptimalkan oleh AI!');
                                    }, 800);
                                }}
                                disabled={isEnhancing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs rounded-full font-medium disabled:opacity-50 transition-all hover:shadow-lg"
                            >
                                {isEnhancing ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Wand2 className="w-3 h-3" />
                                )}
                                {isEnhanced ? 'Reset' : '📸 AI Enhance'}
                            </button>
                        )}
                    </div>

                    {imagePreviewUrl ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-border">
                            <img
                                src={imagePreviewUrl}
                                alt="Preview"
                                className={`w-full h-48 object-cover transition-all duration-500 ${isEnhanced ? 'brightness-105 contrast-110 saturate-110' : ''
                                    }`}
                            />
                            {isEnhanced && (
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <Wand2 className="w-3 h-3" />
                                    AI Enhanced
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setData('image', null);
                                    setIsEnhanced(false);
                                }}
                                className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/50 text-white text-xs rounded-lg"
                            >
                                Ganti Foto
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
                            <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Upload foto untuk preview & AI Enhance
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                className="hidden"
                                id="product-image"
                            />
                            <label
                                htmlFor="product-image"
                                className="inline-block px-4 py-2 bg-muted text-foreground rounded-lg text-sm cursor-pointer"
                            >
                                Pilih Gambar
                            </label>
                        </div>
                    )}
                </div>

                {/* Name */}
                <label className="block">
                    <span className="text-sm font-medium text-foreground">Nama Produk *</span>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Contoh: Nasi Goreng Spesial"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </label>

                {/* Category */}
                <label className="block">
                    <span className="text-sm font-medium text-foreground">Kategori *</span>
                    <select
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value as any)}
                        className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </label>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Harga (Rp) *</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={data.price}
                                onChange={(e) => {
                                    // Remove non-digits
                                    const value = e.target.value.replace(/\D/g, '');
                                    // Format with dots
                                    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    setData('price', formatted);
                                }}
                                className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="15.000"
                                required
                            />
                            {errors.price && <p className="mt-1 text-sm text-destructive">{errors.price}</p>}
                        </label>
                        {/* Smart Pricing Badge */}
                        {priceSuggestion && (
                            <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-amber-700">{priceSuggestion.message}</p>
                                    <button
                                        type="button"
                                        onClick={() => setData('price', priceSuggestion.suggested.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
                                        className="text-xs text-amber-600 underline mt-1"
                                    >
                                        Gunakan Rp {priceSuggestion.suggested.toLocaleString('id-ID')}
                                    </button>
                                </div>
                            </div>
                        )}
                        {isLoadingPrice && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Menganalisis harga pasar...
                            </div>
                        )}
                    </div>

                    <label className="block">
                        <span className="text-sm font-medium text-foreground">Stok *</span>
                        <input
                            type="number"
                            value={data.stock}
                            onChange={(e) => setData('stock', e.target.value)}
                            className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="100"
                            required
                        />
                        {errors.stock && <p className="mt-1 text-sm text-destructive">{errors.stock}</p>}
                    </label>
                </div>

                {/* Product Type Toggle */}
                <div>
                    <span className="text-sm font-medium text-foreground mb-2 block">Jenis Produk</span>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setData('is_physical', true)}
                            className={`p-4 rounded-2xl border-2 text-center transition-all ${data.is_physical
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl mb-1 block">📦</span>
                            <p className="font-medium text-sm">Produk Fisik</p>
                            <p className="text-xs text-muted-foreground">Butuh pengiriman kurir</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setData('is_physical', false)}
                            className={`p-4 rounded-2xl border-2 text-center transition-all ${!data.is_physical
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-primary/50'
                                }`}
                        >
                            <span className="text-2xl mb-1 block">💻</span>
                            <p className="font-medium text-sm">Digital/Layanan</p>
                            <p className="text-xs text-muted-foreground">Tanpa pengiriman</p>
                        </button>
                    </div>
                    {!data.is_physical && (
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                            ⚡ Produk digital/layanan akan langsung ditangani oleh Anda tanpa kurir.
                        </p>
                    )}
                </div>

                {/* Description with AI Generate Button */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">Deskripsi</span>
                        <button
                            type="button"
                            onClick={generateDescription}
                            disabled={isGeneratingDescription || !data.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium disabled:opacity-50 transition-all hover:shadow-lg hover:scale-105"
                        >
                            {isGeneratingDescription ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Membuat...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3" />
                                    ✨ Tulis Otomatis
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Deskripsi produk akan dibuatkan oleh AI..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        💡 Tip: Isi nama produk dan kategori, lalu klik "Tulis Otomatis" untuk deskripsi yang menjual!
                    </p>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {processing ? 'Menyimpan...' : 'Simpan Produk'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
