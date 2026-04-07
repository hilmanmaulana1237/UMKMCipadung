import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Film, ImageIcon, Layout, Store, Package, Camera, Sparkles, Wand2, Loader2, Upload, X, Play, Download, AlertCircle, Clock, CheckCircle, XCircle, Search, Check, Trash2, Share2, Copy, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface VideoQuota {
    used: number;
    max: number;
    remaining: number;
}

interface VideoContent {
    id: string;
    type: string;
    status: string;
    generated_result: string;
    created_at: string;
    prompt?: string;
}

interface LandingProduct {
    id: number;
    name: string;
    price: number;
    image_path: string | null;
    description: string | null;
}

interface LandingTemplate {
    name: string;
    description: string;
    preview: string;
    category: string;
}

interface LandingPageData {
    id: number;
    slug: string;
    template: string;
    hero_image_path: string | null;
    tagline: string | null;
    description: string | null;
    feature1_title: string | null;
    feature1_desc: string | null;
    feature2_title: string | null;
    feature2_desc: string | null;
    feature3_title: string | null;
    feature3_desc: string | null;
    business_phone?: string | null;
    business_address?: string | null;
    business_hours?: string | null;
    instagram?: string | null;
    email?: string | null;
    products: number[];
    is_published: boolean;
}

interface Props {
    store: { id: number; name: string; address_pickup?: string; contact_number?: string; address?: string; category?: string; description?: string } | null;
    videoQuota: VideoQuota;
    posterQuota: VideoQuota;
    contents: VideoContent[];
    landingPage: LandingPageData | null;
    landingProducts: LandingProduct[];
    landingTemplates: Record<string, LandingTemplate>;
}

const CATEGORIES = [
    { value: 'kuliner', label: '🍜 Kuliner / Makanan' },
    { value: 'fashion', label: '👗 Fashion / Pakaian' },
    { value: 'kerajinan', label: '🎨 Kerajinan / Handmade' },
    { value: 'jasa', label: '🔧 Jasa / Service' },
    { value: 'pertanian', label: '🌾 Pertanian / Agro' },
    { value: 'lainnya', label: '📦 Lainnya' },
];

// Landing Page Panel Component
function LandingPagePanel({ store, landingPage, products, templates }: {
    store: Props['store'];
    landingPage: LandingPageData | null;
    products: LandingProduct[];
    templates: Record<string, LandingTemplate>;
}) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(landingPage?.template || '');
    const [tagline, setTagline] = useState(landingPage?.tagline || '');
    const [lpDescription, setLpDescription] = useState(landingPage?.description || '');
    const [selectedProducts, setSelectedProducts] = useState<number[]>(
        (landingPage?.products || []).map(id => Number(id))
    );
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(
        landingPage?.hero_image_path ? `/storage/${landingPage.hero_image_path}` : null
    );

    // Business info states
    const [businessPhone, setBusinessPhone] = useState(landingPage?.business_phone || store?.contact_number || '');
    const [businessAddress, setBusinessAddress] = useState(landingPage?.business_address || store?.address || '');
    const [businessHours, setBusinessHours] = useState(landingPage?.business_hours || '');
    const [instagram, setInstagram] = useState(landingPage?.instagram || '');
    const [email, setEmail] = useState(landingPage?.email || '');

    const [isPublished, setIsPublished] = useState(landingPage?.is_published || false);
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [step, setStep] = useState<'template' | 'customize'>(landingPage ? 'customize' : 'template');
    const [copySuccess, setCopySuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    // Feature states for AI-generated content
    const [feature1Title, setFeature1Title] = useState(landingPage?.feature1_title || '');
    const [feature1Desc, setFeature1Desc] = useState(landingPage?.feature1_desc || '');
    const [feature2Title, setFeature2Title] = useState(landingPage?.feature2_title || '');
    const [feature2Desc, setFeature2Desc] = useState(landingPage?.feature2_desc || '');
    const [feature3Title, setFeature3Title] = useState(landingPage?.feature3_title || '');
    const [feature3Desc, setFeature3Desc] = useState(landingPage?.feature3_desc || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter products based on search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    // Get selected product details
    const selectedProductDetails = products.filter(p => selectedProducts.includes(p.id));

    // Handle initial state update if landing page prop changes
    useEffect(() => {
        if (landingPage) {
            setSelectedTemplate(landingPage.template || '');
            setTagline(landingPage.tagline || '');
            setLpDescription(landingPage.description || '');
            setSelectedProducts((landingPage.products || []).map(id => Number(id)));
            setHeroPreview(landingPage.hero_image_path ? `/storage/${landingPage.hero_image_path}` : null);
            setIsPublished(landingPage.is_published);
            // Features
            setFeature1Title(landingPage.feature1_title || '');
            setFeature1Desc(landingPage.feature1_desc || '');
            setFeature2Title(landingPage.feature2_title || '');
            setFeature2Desc(landingPage.feature2_desc || '');
            setFeature3Title(landingPage.feature3_title || '');
            setFeature3Desc(landingPage.feature3_desc || '');
        }
    }, [landingPage]);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('customize');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setHeroPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const generateAIContent = async () => {
        setGeneratingAI(true);
        setErrorMsg(null);
        try {
            const response = await axios.post('/umkm/landing-page/generate-content', {
                store_name: store?.name || '',
                category: store?.category || 'lainnya',
                description: store?.description || '',
            });
            if (response.data.success) {
                setTagline(response.data.tagline);
                setLpDescription(response.data.description);
                // Set feature content from AI
                setFeature1Title(response.data.feature1_title || '');
                setFeature1Desc(response.data.feature1_desc || '');
                setFeature2Title(response.data.feature2_title || '');
                setFeature2Desc(response.data.feature2_desc || '');
                setFeature3Title(response.data.feature3_title || '');
                setFeature3Desc(response.data.feature3_desc || '');
            } else {
                setErrorMsg(response.data.error || 'Gagal generate konten AI.');
            }
        } catch (error: any) {
            console.error('AI generation failed:', error);
            setErrorMsg(error.response?.data?.error || error.response?.data?.message || 'Gagal generate konten AI. Silakan coba lagi.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSave = async (publish: boolean = false) => {
        if (!selectedTemplate) {
            setErrorMsg('Silakan pilih template terlebih dahulu.');
            return;
        }
        setSaving(true);
        setErrorMsg(null);
        const formData = new FormData();
        formData.append('template', selectedTemplate);
        formData.append('tagline', tagline);
        formData.append('description', lpDescription);
        formData.append('is_published', publish ? '1' : '0');

        // Append selected products
        selectedProducts.forEach(id => formData.append('products[]', String(id)));

        // Append features
        formData.append('feature1_title', feature1Title);
        formData.append('feature1_desc', feature1Desc);
        formData.append('feature2_title', feature2Title);
        formData.append('feature2_desc', feature2Desc);
        formData.append('feature3_title', feature3Title);
        formData.append('feature3_desc', feature3Desc);

        // Business info
        formData.append('business_phone', businessPhone);
        formData.append('business_address', businessAddress);
        formData.append('business_hours', businessHours);
        formData.append('instagram', instagram);
        formData.append('email', email);

        if (heroImage) {
            formData.append('hero_image', heroImage);
        }

        try {
            await axios.post('/umkm/landing-page', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (publish) {
                // If publishing, reload to update status
                window.location.reload();
            } else {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            setErrorMsg(error.response?.data?.message || 'Gagal menyimpan. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!landingPage) return;
        setDeleting(true);
        try {
            await axios.delete(`/umkm/landing-page/${landingPage.id}`);
            setShowDeleteModal(false);
            window.location.reload();
        } catch (error: any) {
            console.error('Delete failed:', error);
            setErrorMsg(error.response?.data?.error || 'Gagal menghapus. Silakan coba lagi.');
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const toggleProduct = (productId: number) => {
        if (selectedProducts.includes(productId)) {
            // Remove product if already selected
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            // Add product if not at max limit (10)
            if (selectedProducts.length < 10) {
                setSelectedProducts([...selectedProducts, Number(productId)]);
            } else {
                alert('Maksimal 10 produk dapat dipilih.');
            }
        }
    };

    const copyLink = () => {
        if (landingPage?.slug) {
            navigator.clipboard.writeText(`${window.location.origin}/toko/${landingPage.slug}`);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const shareLink = () => {
        if (landingPage?.slug) {
            const url = `${window.location.origin}/toko/${landingPage.slug}`;
            if (navigator.share) {
                navigator.share({ title: store?.name || 'Toko Kami', url });
            } else {
                copyLink();
            }
        }
    };

    const openPreview = () => {
        if (landingPage?.slug) {
            window.open(`/toko/${landingPage.slug}`, '_blank');
        }
    };

    const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    if (!store) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
                <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="font-bold text-gray-800 text-lg mb-2">Setup Toko Terlebih Dahulu</h2>
                <p className="text-gray-500 text-sm">Anda harus memiliki toko untuk membuat landing page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Step 1: Template Selection */}
            {step === 'template' && (
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-violet-600" />
                        Pilih Tampilan Toko
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Klik untuk melihat preview, atau langsung pilih tampilan yang Anda suka</p>

                    <div className="space-y-3">
                        {Object.entries(templates).map(([id, template]) => {
                            // User-friendly template info
                            const templateInfo: Record<string, { emoji: string; friendlyName: string; examples: string[]; colors: { bg: string; text: string } }> = {
                                tema1: {
                                    emoji: '✨',
                                    friendlyName: 'Elegan Hitam Emas',
                                    examples: ['Restoran', 'Cafe', 'Catering'],
                                    colors: { bg: 'from-gray-900 to-gray-700', text: 'text-yellow-400' },
                                },
                                tema2: {
                                    emoji: '🎀',
                                    friendlyName: 'Lucu & Ceria',
                                    examples: ['Kue', 'Dessert', 'Snack'],
                                    colors: { bg: 'from-pink-200 to-pink-100', text: 'text-pink-600' },
                                },
                                tema3: {
                                    emoji: '🖼️',
                                    friendlyName: 'Simpel & Bersih',
                                    examples: ['Fashion', 'Aksesoris', 'Tas'],
                                    colors: { bg: 'from-gray-100 to-white', text: 'text-gray-800' },
                                },
                                tema4: {
                                    emoji: '🌿',
                                    friendlyName: 'Hangat & Tradisional',
                                    examples: ['Oleh-oleh', 'Keripik', 'Kerajinan'],
                                    colors: { bg: 'from-orange-200 to-orange-100', text: 'text-orange-700' },
                                },
                                tema5: {
                                    emoji: '💼',
                                    friendlyName: 'Profesional Biru',
                                    examples: ['Laundry', 'Service', 'Jasa'],
                                    colors: { bg: 'from-blue-200 to-blue-100', text: 'text-blue-700' },
                                },
                            };

                            const info = templateInfo[id] || { emoji: '📄', friendlyName: template.name, examples: [], colors: { bg: 'from-gray-100 to-white', text: 'text-gray-700' } };

                            return (
                                <div
                                    key={id}
                                    onClick={() => handleTemplateSelect(id)}
                                    className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${selectedTemplate === id
                                        ? 'border-violet-500 ring-2 ring-violet-200 bg-violet-50'
                                        : 'border-gray-200 hover:border-violet-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-stretch">
                                        {/* Preview thumbnail */}
                                        <div className={`w-24 h-24 flex-shrink-0 bg-gradient-to-br ${info.colors.bg} flex items-center justify-center`}>
                                            <span className="text-3xl">{info.emoji}</span>
                                        </div>

                                        {/* Template info */}
                                        <div className="flex-1 p-3 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                {info.friendlyName}
                                                {selectedTemplate === id && (
                                                    <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">Terpilih</span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                {template.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {info.examples.map((ex, i) => (
                                                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {ex}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex items-center pr-3">
                                            <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick tips */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                        💡 <b>Tips:</b> Pilih tampilan sesuai jenis usaha Anda. Anda bisa menggantinya kapanpun!
                    </div>
                </div>
            )}

            {/* Step 2: Customize */}
            {step === 'customize' && (
                <div className="space-y-4">
                    {/* Back Button */}
                    <button onClick={() => setStep('template')} className="text-violet-600 text-sm font-medium flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Ganti Template
                    </button>

                    {/* Status Banner */}
                    {landingPage && (
                        <div className={`rounded-xl p-4 ${landingPage.is_published ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-semibold text-sm">{landingPage.is_published ? '✅ Sudah Dipublish' : '⏳ Draft'}</span>
                                        {landingPage.is_published && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                URL: <span className="font-mono bg-white px-2 py-0.5 rounded">/toko/{landingPage.slug}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {landingPage.is_published && (
                                    <div className="flex gap-2">
                                        <button onClick={openPreview} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white flex items-center justify-center gap-1">
                                            👁️ Lihat Toko
                                        </button>
                                        <button onClick={copyLink} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${copySuccess ? 'bg-green-500 text-white' : 'bg-violet-600 text-white'} flex items-center justify-center gap-1`}>
                                            {copySuccess ? '✓ Copied!' : '📋 Copy Link'}
                                        </button>
                                        <button onClick={shareLink} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-pink-500 text-white flex items-center justify-center gap-1">
                                            🔗 Bagikan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}



                    {/* Hero Image Upload */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3">📸 Foto Utama</h3>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-300 transition-colors"
                            style={heroPreview ? { backgroundImage: `url(${heroPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '120px' } : {}}
                        >
                            {!heroPreview ? (
                                <div className="text-gray-500 text-sm">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    Klik untuk upload foto
                                </div>
                            ) : (
                                <span className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm">Ganti Foto</span>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    {/* Tagline & Description */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-800">✏️ Tagline & Deskripsi</h3>
                            <button onClick={generateAIContent} disabled={generatingAI} className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1.5 rounded-lg font-medium">
                                {generatingAI ? '⏳...' : '🤖 AI Generate'}
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Tagline singkat..."
                            value={tagline}
                            onChange={e => setTagline(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl mb-3 text-sm"
                        />
                        <textarea
                            placeholder="Deskripsi toko..."
                            value={lpDescription}
                            onChange={e => setLpDescription(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none"
                        />
                    </div>

                    {/* Product Selection */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3">🛒 Pilih Produk <span className="text-gray-400 font-normal">({selectedProducts.length}/10)</span></h3>

                        {/* Selected Products */}
                        {selectedProducts.length > 0 && (
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-2">Produk Terpilih:</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProductDetails.map(product => (
                                        <div key={product.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-3 pr-1 py-1.5 shadow-sm group hover:border-red-200 transition-colors">
                                            <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{product.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleProduct(product.id); }}
                                                className="w-6 h-6 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Hapus dari pilihan"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Input */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-6">Belum ada produk. Tambahkan produk terlebih dahulu.</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-6">Tidak ada produk yang cocok dengan pencarian.</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedProducts.includes(product.id);
                                    const isDisabled = !isSelected && selectedProducts.length >= 10;

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => !isDisabled && toggleProduct(product.id)}
                                            className={`relative h-20 border rounded-lg overflow-hidden cursor-pointer transition-all group ${isSelected
                                                ? 'border-green-500 ring-1 ring-green-500 bg-green-50'
                                                : isDisabled
                                                    ? 'border-gray-100 opacity-50 cursor-not-allowed grayscale'
                                                    : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Product Image or Text Fallback */}
                                            {product.image_path ? (
                                                <img
                                                    src={`/storage/${product.image_path}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center p-2 text-center text-xs text-gray-500 bg-gray-50 ${isSelected ? 'bg-green-50' : ''}`}>
                                                    {product.name}
                                                </div>
                                            )}

                                            {/* Selection Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                                                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm group-hover:bg-red-500 transition-colors">
                                                        <Check size={14} strokeWidth={3} className="group-hover:hidden" />
                                                        <Trash2 size={12} className="hidden group-hover:block" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {errorMsg && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Business Info Inputs - Bottom of Form */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-3">📋 Info Kontak</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📍 Alamat Lengkap
                                </label>
                                <textarea
                                    value={businessAddress}
                                    onChange={(e) => setBusinessAddress(e.target.value)}
                                    placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📞 Nomor Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={businessPhone}
                                        onChange={(e) => setBusinessPhone(e.target.value)}
                                        placeholder="0812-3456-7890"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🕒 Jam Operasional
                                    </label>
                                    <input
                                        type="text"
                                        value={businessHours}
                                        onChange={(e) => setBusinessHours(e.target.value)}
                                        placeholder="08:00 - 20:00"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📸 Instagram (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="@username"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📧 Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@toko.com"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                                💡 Info ini akan muncul di landing page Anda
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {landingPage && (
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm">
                                🗑️ Hapus
                            </button>
                        )}
                        <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">
                            💾 Simpan Draft
                        </button>
                        <button onClick={() => handleSave(true)} disabled={saving || !selectedTemplate} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm">
                            {saving ? '⏳...' : '🚀 Publish'}
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Landing Page?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Tindakan ini tidak dapat dibatalkan. Semua data landing page termasuk gambar akan dihapus permanen.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Menghapus...</>
                                    ) : (
                                        '🗑️ Ya, Hapus'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Poster Generator Panel Component
interface PosterTemplate {
    path: string;
    name: string;
    url: string;
}

function PosterGeneratorPanel({ store, contents, quota }: { store: Props['store']; contents: VideoContent[]; quota: VideoQuota }) {
    const [posterType, setPosterType] = useState<'makanan' | 'enhance'>('makanan');
    const [templates, setTemplates] = useState<{ makanan: PosterTemplate[] }>({ makanan: [] });
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    // Form states
    const [storeName, setStoreName] = useState(store?.name || '');
    const [slogan, setSlogan] = useState('');
    const [phone, setPhone] = useState(store?.contact_number || '');
    const [address, setAddress] = useState(store?.address || '');

    // Food poster specific
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);



    // Generation states
    const [generating, setGenerating] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [contentId, setContentId] = useState<string | null>(null);
    const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // NEW: Preview modal and copywriting states
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [posterCopywriting, setPosterCopywriting] = useState<Record<string, string>>({}); // Per-poster copywriting
    const [loadingCopywritingId, setLoadingCopywritingId] = useState<string | null>(null); // Which poster is loading
    const [copiedCaption, setCopiedCaption] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Filter poster history
    const posterHistory = contents.filter(c => c.type === 'poster' || c.type === 'poster_generation');

    // Resume polling for generating posters on mount
    useEffect(() => {
        const generatingPoster = posterHistory.find(p => ['waiting', 'queuing', 'generating'].includes(p.status));
        if (generatingPoster) {
            try {
                const data = JSON.parse(generatingPoster.generated_result || '{}');
                if (data.task_id) {
                    setTaskId(data.task_id);
                    setContentId(generatingPoster.id);
                    setGenerating(true);
                }
            } catch (e) {
                console.error('Failed to parse generating poster data');
            }
        }
    }, [posterHistory]);

    // Load existing copywriting from completed posters
    useEffect(() => {
        console.log('Checking saved copywriting for', posterHistory.length, 'posters');
        const existingCopywriting: Record<string, string> = {};

        posterHistory.forEach(poster => {
            if (poster.status === 'completed' && poster.generated_result) {
                try {
                    let resultStr = poster.generated_result;
                    // Handle case where it might be already parsed or dirty string
                    if (typeof resultStr === 'string') {
                        resultStr = resultStr.trim();
                        if (resultStr.startsWith('{')) {
                            const data = JSON.parse(resultStr);
                            if (data.copywriting) {
                                existingCopywriting[poster.id] = data.copywriting;
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse saved copywriting for poster:', poster.id, e);
                }
            }
        });

        if (Object.keys(existingCopywriting).length > 0) {
            console.log('Restored copywriting for:', Object.keys(existingCopywriting));
            setPosterCopywriting(prev => ({ ...prev, ...existingCopywriting }));
        }
    }, [posterHistory]);

    // Load templates on mount
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await axios.get('/umkm/ai-content/poster-templates');
                if (response.data.success) {
                    setTemplates(response.data.data);
                    // Auto-select first template
                    if (response.data.data.makanan.length > 0) {
                        setSelectedTemplate(response.data.data.makanan[0].path);
                    }
                }
            } catch (err) {
                console.error('Failed to load templates:', err);
            } finally {
                setLoadingTemplates(false);
            }
        };
        loadTemplates();
    }, []);

    // Poll for generation status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (taskId && contentId) {
            interval = setInterval(async () => {
                try {
                    const response = await axios.post('/umkm/ai-content/check-poster-status', {
                        task_id: taskId,
                        content_id: contentId,
                    });
                    if (response.data.success) {
                        if (response.data.status === 'completed') {
                            setGeneratedPoster(response.data.poster_url);
                            setTaskId(null);
                            setGenerating(false);
                            // Refresh page to update history
                            window.location.reload();
                        } else if (response.data.status === 'failed') {
                            setError(response.data.error || 'Gagal membuat poster');
                            setTaskId(null);
                            setGenerating(false);
                            // Refresh page to update history status
                            window.location.reload();
                        }
                    }
                } catch (err: any) {
                    console.error('Status check error:', err);
                    // If server error (500), stop polling after a few retries or immediately?
                    // For now, if we get a 500, it likely means the check failed significantly.
                    // But let's not break on intermittent network issues.
                    // Only stop if it's a 404 (content not found) or 500 with specific error.
                    if (err.response && (err.response.status === 404 || err.response.status === 422 || err.response.status === 500)) {
                        setTaskId(null);
                        setGenerating(false);
                        setError('Gagal mengecek status: ' + (err.response?.data?.error || 'Server Error'));
                        window.location.reload();
                    }
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [taskId, contentId]);

    // Handle type change and auto-select first template
    const handleTypeChange = (type: 'makanan' | 'enhance') => {
        setPosterType(type);
        if (type === 'makanan') {
            const typeTemplates = templates.makanan;
            if (typeTemplates.length > 0) {
                setSelectedTemplate(typeTemplates[0].path);
            } else {
                setSelectedTemplate('');
            }
        } else {
            // enhance mode doesn't need templates
            setSelectedTemplate('');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImage(file);
            setProductImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setProductImage(null);
        setProductImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };


    // Download image using fetch + blob (cross-origin safe)
    const handleDownload = async (url: string, filename = 'poster.jpg') => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    // NEW: Native share API + fallback
    const handleShare = async (posterUrl: string, caption?: string) => {
        const shareData = {
            title: `${storeName} - Poster Promosi`,
            text: caption || `Lihat poster promosi ${storeName}!`,
            url: posterUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            // Fallback: copy link
            await navigator.clipboard.writeText(posterUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    // NEW: Copy caption to clipboard
    const handleCopyCaption = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCaption(true);
            setTimeout(() => setCopiedCaption(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // NEW: Generate copywriting from API using poster's stored data
    const generateCopywriting = async (poster: VideoContent) => {
        console.log('Generate Copywriting clicked for poster:', poster.id);
        console.log('Poster prompt raw:', poster.prompt);
        setLoadingCopywritingId(poster.id);

        // Parse the poster's original input data from prompt field
        let inputData: any = {};
        try {
            if (poster.prompt) {
                inputData = JSON.parse(poster.prompt);
                console.log('Parsed inputData:', inputData);
            } else {
                console.warn('No prompt field found on poster, using form fallback');
            }
        } catch (e) {
            console.error('Failed to parse poster prompt:', e);
        }

        try {
            const response = await axios.post('/umkm/ai-content/generate-poster-copywriting', {
                content_id: poster.id, // Required for database persistence
                store_name: inputData.store_name || storeName,
                product_name: inputData.product_name || null,
                service_name: inputData.service_name || null,
                price: inputData.price || null,
                slogan: inputData.slogan || '',
                phone: inputData.phone || phone,
                address: inputData.address || address,
            });
            console.log('Copywriting response:', response.data);
            if (response.data.success) {
                setPosterCopywriting(prev => ({
                    ...prev,
                    [poster.id]: response.data.copywriting
                }));
            } else {
                alert('Gagal generate caption: ' + (response.data.error || 'Unknown error'));
            }
        } catch (err: any) {
            console.error('Copywriting generation failed:', err);
            alert('Gagal generate caption: ' + (err.response?.data?.error || err.message || 'Server error'));
        } finally {
            setLoadingCopywritingId(null);
        }
    };

    const handleGenerate = async () => {
        if (posterType === 'makanan' && !selectedTemplate) {
            setError('Pilih template terlebih dahulu');
            return;
        }

        if (posterType === 'enhance' && !productImage) {
            setError('Upload foto produk terlebih dahulu');
            return;
        }

        setGenerating(true);
        setError(null);
        setGeneratedPoster(null);

        try {
            const formData = new FormData();
            formData.append('poster_type', posterType);

            if (posterType === 'makanan') {
                formData.append('template_path', selectedTemplate);
                formData.append('store_name', storeName);
                formData.append('slogan', slogan);
                formData.append('phone', phone);
                formData.append('address', address);
                formData.append('product_name', productName);
                const finalPrice = price.toLowerCase().startsWith('rp') ? price : `Rp ${price}`;
                formData.append('price', finalPrice);
                if (productImage) {
                    formData.append('product_image', productImage);
                }
            } else {
                // enhance mode - only product image
                if (productImage) {
                    formData.append('product_image', productImage);
                }
            }

            const response = await axios.post('/umkm/ai-content/generate-poster-template', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setTaskId(response.data.task_id);
                setContentId(response.data.content_id);
            } else {
                setError(response.data.error || 'Gagal memulai generate');
                setGenerating(false);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Terjadi kesalahan');
            setGenerating(false);
        }
    };

    const currentTemplates = templates.makanan;

    return (
        <>
            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={previewUrl}
                            alt="Poster Preview"
                            className="w-full rounded-xl shadow-2xl"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => handleDownload(previewUrl, `poster-${storeName.replace(/\s+/g, '-')}.jpg`)}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {/* Poster Type Selection */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-violet-500" />
                        Pilih Jenis Poster
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleTypeChange('makanan')}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${posterType === 'makanan'
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">🍜</div>
                            <div className="font-semibold text-gray-800">Makanan</div>
                            <p className="text-xs text-gray-500">Fokus 1 produk dengan foto</p>
                        </button>
                        <button
                            onClick={() => handleTypeChange('enhance')}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${posterType === 'enhance'
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">✨</div>
                            <div className="font-semibold text-gray-800">Percantik Produk</div>
                            <p className="text-xs text-gray-500">Foto produk jadi profesional</p>
                        </button>
                    </div>
                </div>

                {/* Template Selection - Only for makanan type */}
                {posterType === 'makanan' && (
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-violet-500" />
                            Pilih Template
                        </h2>
                        {loadingTemplates ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                            </div>
                        ) : currentTemplates.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">Tidak ada template tersedia</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {currentTemplates.map((template) => (
                                    <button
                                        key={template.path}
                                        onClick={() => setSelectedTemplate(template.path)}
                                        className={`rounded-xl overflow-hidden border-2 transition-all ${selectedTemplate === template.path
                                            ? 'border-violet-500 ring-2 ring-violet-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={template.url}
                                            alt={template.name}
                                            className="w-full aspect-[3/4] object-cover"
                                        />
                                        {selectedTemplate === template.path && (
                                            <div className="bg-violet-500 text-white text-xs py-1 text-center font-medium">
                                                ✓ Dipilih
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Inputs - Only for makanan type */}
                {posterType === 'makanan' && (
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-violet-500" />
                            Isi Data Poster
                        </h2>
                        <div className="space-y-4">
                            {/* Common fields */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nama Toko/Warung</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Contoh: Warung Bu Siti"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Slogan (Opsional)</label>
                                <input
                                    type="text"
                                    value={slogan}
                                    onChange={(e) => setSlogan(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Contoh: Enak, Murah, Nagih!"
                                />
                            </div>

                            {/* Food Poster Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="Nasi Goreng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Harga</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-medium">Rp</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={price}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                setPrice(formatted);
                                            }}
                                            className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors font-medium"
                                            placeholder="15.000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Product Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Foto Produk (Opsional)</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {productImagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={productImagePreview}
                                            alt="Preview"
                                            className="w-full h-40 object-cover rounded-xl"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 text-gray-500 hover:border-violet-400 hover:text-violet-500 transition-colors"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span className="text-sm">Tap untuk upload foto</span>
                                    </button>
                                )}
                            </div>

                            {/* Contact fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">No. Telepon</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Alamat</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="Jl. Cipadung"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhance Product Photo - Only for enhance type */}
                {posterType === 'enhance' && (
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            ✨ Upload Foto Produk
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Upload foto produk Anda dan AI akan mempercantiknya menjadi foto berkualitas studio profesional.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {productImagePreview ? (
                            <div className="relative">
                                <img
                                    src={productImagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-xl"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-12 border-2 border-dashed border-violet-300 rounded-xl flex flex-col items-center gap-3 text-gray-500 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all"
                            >
                                <Upload className="w-8 h-8" />
                                <span className="text-sm font-medium">Tap untuk upload foto produk</span>
                                <span className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
                            </button>
                        )}
                    </div>
                )}


                {/* Quota Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Sisa Kuota Poster</p>
                            <p className="text-xs text-blue-700">{quota.remaining} dari {quota.max} poster</p>
                        </div>
                    </div>
                    {quota.remaining <= 0 && (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            Habis
                        </span>
                    )}
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={generating || quota.remaining <= 0 || (posterType === 'makanan' ? (!selectedTemplate || !storeName) : !productImage)}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {posterType === 'enhance' ? 'Sedang Mempercantik...' : 'Sedang Membuat Poster...'}
                        </>
                    ) : (
                        <>
                            <Wand2 className="w-5 h-5" />
                            {posterType === 'enhance' ? '✨ Percantik Foto Produk' : '🎨 Generate Poster AI'}
                        </>
                    )}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Generated Result */}
                {generatedPoster && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Poster Berhasil Dibuat!</span>
                        </div>
                        <img
                            src={generatedPoster}
                            alt="Generated Poster"
                            className="w-full rounded-xl shadow-lg"
                        />
                        <a
                            href={generatedPoster}
                            download
                            target="_blank"
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download Poster
                        </a>
                    </div>
                )}

                {/* Poster History */}
                {posterHistory.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-violet-500" />
                            Riwayat Poster ({posterHistory.length})
                        </h2>
                        <div className="space-y-3">
                            {posterHistory.map((poster) => {
                                const isGenerating = ['waiting', 'queuing', 'generating'].includes(poster.status);
                                const isCompleted = poster.status === 'completed';
                                const isFailed = poster.status === 'failed' || poster.status === 'fail';

                                // Helper to extract poster URL from both old (plain URL) and new (JSON) formats
                                const getPosterUrl = (): string | null => {
                                    if (!poster.generated_result) return null;
                                    if (poster.generated_result.startsWith('{')) {
                                        try {
                                            const data = JSON.parse(poster.generated_result);
                                            return data.poster_url || null;
                                        } catch {
                                            return null;
                                        }
                                    }
                                    // Plain URL
                                    return poster.generated_result;
                                };
                                const posterUrl = getPosterUrl();

                                return (
                                    <div key={poster.id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' :
                                                isGenerating ? 'bg-yellow-100 text-yellow-700' :
                                                    isFailed ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {isCompleted ? '✅ Selesai' :
                                                    isGenerating ? '⏳ Sedang Proses' :
                                                        isFailed ? '❌ Gagal' : poster.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(poster.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        {isGenerating && (
                                            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Poster sedang dibuat oleh AI...</span>
                                            </div>
                                        )}

                                        {isCompleted && posterUrl && (
                                            <div className="space-y-3">
                                                {/* Poster Image - Clickable for Preview */}
                                                <div
                                                    className="relative group cursor-pointer"
                                                    onClick={() => setPreviewUrl(posterUrl)}
                                                >
                                                    <img
                                                        src={posterUrl}
                                                        alt="Generated Poster"
                                                        className="w-full h-48 object-cover rounded-xl shadow-md"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                        <div className="text-white flex items-center gap-2 font-medium">
                                                            <Eye className="w-5 h-5" />
                                                            Lihat Full
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons Grid */}
                                                <div className="grid grid-cols-4 gap-2">
                                                    <button
                                                        onClick={() => setPreviewUrl(posterUrl)}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-[10px] font-medium">Preview</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(posterUrl, `poster-${storeName.replace(/\s+/g, '-')}.jpg`)}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span className="text-[10px] font-medium">Download</span>
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await navigator.clipboard.writeText(posterUrl);
                                                            setCopiedLink(true);
                                                            setTimeout(() => setCopiedLink(false), 2000);
                                                        }}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    >
                                                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        <span className="text-[10px] font-medium">{copiedLink ? 'Copied!' : 'Copy'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare(posterUrl, posterCopywriting[poster.id] || undefined)}
                                                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                    >
                                                        <Share2 className="w-4 h-4" />
                                                        <span className="text-[10px] font-medium">Share</span>
                                                    </button>
                                                </div>

                                                {/* Copywriting Section */}
                                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-violet-700 flex items-center gap-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            Caption AI
                                                        </span>
                                                        {!posterCopywriting[poster.id] && (
                                                            <button
                                                                onClick={() => generateCopywriting(poster)}
                                                                disabled={loadingCopywritingId === poster.id}
                                                                className="text-xs px-2 py-1 bg-violet-500 text-white rounded-md hover:bg-violet-600 disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {loadingCopywritingId === poster.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                                {loadingCopywritingId === poster.id ? 'Generating...' : 'Generate'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {posterCopywriting[poster.id] ? (
                                                        <div className="space-y-2">
                                                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                                                {posterCopywriting[poster.id]}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleCopyCaption(posterCopywriting[poster.id])}
                                                                    className="flex-1 py-2 bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-violet-600"
                                                                >
                                                                    {copiedCaption ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                                    {copiedCaption ? 'Disalin!' : 'Salin'}
                                                                </button>
                                                                <button
                                                                    onClick={() => generateCopywriting(poster)}
                                                                    disabled={loadingCopywritingId === poster.id}
                                                                    className="py-2 px-3 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-gray-200 disabled:opacity-50"
                                                                >
                                                                    {loadingCopywritingId === poster.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                                    Ulang
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-500">
                                                            Klik Generate untuk membuat caption sosmed otomatis ✨
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {isFailed && (
                                            <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                                <span className="text-sm text-red-700">
                                                    {(() => {
                                                        try {
                                                            if (poster.generated_result?.startsWith('{')) {
                                                                const res = JSON.parse(poster.generated_result);
                                                                return res.error || 'Gagal membuat poster';
                                                            }
                                                            return 'Gagal membuat poster';
                                                        } catch {
                                                            return 'Gagal membuat poster';
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}

export default function AIContentIndex({ store, videoQuota, posterQuota, contents, landingPage, landingProducts, landingTemplates }: Props) {
    // Initialize activePanel from URL query param 'tab' or default to 'video'
    const [activePanel, setActivePanel] = useState<'video' | 'poster' | 'landing'>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            if (tab === 'poster' || tab === 'landing') return tab;
        }
        return 'video';
    });
    const [loading, setLoading] = useState(false);

    // Sync activePanel to URL query param
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', activePanel);
            window.history.replaceState({}, '', url.toString());
        }
    }, [activePanel]);

    // Form State
    const [mode, setMode] = useState<'store_photo' | 'product_photo'>('store_photo');
    const [storeName, setStoreName] = useState(store?.name || '');
    const [category, setCategory] = useState('kuliner');
    const [description, setDescription] = useState('');
    const [productName, setProductName] = useState(''); // New State
    const [generatingDesc, setGeneratingDesc] = useState(false); // New State
    const [location, setLocation] = useState(store?.address_pickup || '');
    const [contact, setContact] = useState(store?.contact_number || '');
    const [duration, setDuration] = useState<'10' | '15'>('15');

    // Photo Upload
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Video Generation State
    const [taskId, setTaskId] = useState<string | null>(null);
    const [contentId, setContentId] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string>('');
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Video history from props
    const videoHistory = contents.filter(c => c.type === 'video_generation');

    // Find any generating videos on mount and resume polling
    useEffect(() => {
        const generatingVideo = videoHistory.find(v => ['waiting', 'queuing', 'generating'].includes(v.status));
        if (generatingVideo) {
            try {
                const data = JSON.parse(generatingVideo.generated_result);
                if (data.task_id) {
                    setTaskId(data.task_id);
                    setContentId(generatingVideo.id);
                    setGenerationStatus(generatingVideo.status);
                }
            } catch (e) {
                console.error('Failed to parse generating video data');
            }
        }
    }, []);

    // Polling for video status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        // Include 'waiting' in the list of active statuses
        const activeStatuses = ['waiting', 'queuing', 'generating'];
        if (taskId && contentId && activeStatuses.includes(generationStatus)) {
            interval = setInterval(async () => {
                try {
                    const response = await axios.post('/umkm/ai-content/check-video-status', {
                        task_id: taskId,
                        content_id: contentId,
                    });
                    if (response.data.success) {
                        setGenerationStatus(response.data.state);
                        if (response.data.state === 'success' && response.data.video_urls?.length) {
                            setVideoUrls(response.data.video_urls);
                            setTaskId(null);
                            // Reload page to refresh history
                            window.location.reload();
                        } else if (response.data.state === 'fail') {
                            setErrorMessage(response.data.fail_msg || 'Video generation failed');
                            setTaskId(null);
                        }
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [taskId, contentId, generationStatus]);

    // Manual refresh status for a specific video
    const refreshVideoStatus = async (videoId: string, videoTaskId: string) => {
        try {
            const response = await axios.post('/umkm/ai-content/check-video-status', {
                task_id: videoTaskId,
                content_id: videoId,
            });
            if (response.data.success && (response.data.state === 'success' || response.data.state === 'fail')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Manual refresh error:', error);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // New AI Description Generator Handler
    const handleGenerateDescription = async () => {
        if (!storeName || !category || !productName) {
            alert('Mohon isi Nama Toko, Kategori, dan Nama Produk terlebih dahulu.');
            return;
        }
        setGeneratingDesc(true);
        try {
            const response = await axios.post('/umkm/ai-content/generate-video-description', {
                store_name: storeName,
                category,
                product_name: productName
            });
            if (response.data.success) {
                setDescription(response.data.description);
            }
        } catch (error) {
            console.error('Failed to generate description', error);
            alert('Gagal menghasilkan deskripsi. Pastikan koneksi aman.');
        } finally {
            setGeneratingDesc(false);
        }
    };

    const generateVideo = async () => {
        if (!photo || !storeName || !description) return;
        if (videoQuota.remaining <= 0) {
            setErrorMessage(`Kuota video habis. Maksimal ${videoQuota.max} video per UMKM.`);
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setVideoUrls([]);
        setGenerationStatus('starting');

        const formData = new FormData();
        formData.append('mode', mode);
        formData.append('store_name', storeName);
        formData.append('category', category);
        formData.append('product_name', productName); // Append product name
        formData.append('description', description);
        formData.append('location', location);
        formData.append('contact', contact);
        formData.append('photo', photo);
        formData.append('duration', duration);

        try {
            const response = await axios.post('/umkm/ai-content/generate-video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setTaskId(response.data.task_id);
                setContentId(response.data.content_id);
                setGenerationStatus('queuing');
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.error || 'Gagal generate video');
            setGenerationStatus('');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = photo && storeName && description;
    const isGenerating = !!taskId || loading;

    const getStatusText = (status: string) => {
        switch (status) {
            case 'waiting': return '⏳ Menunggu...';
            case 'queuing': return '⏳ Dalam antrian...';
            case 'generating': return '🎬 Sedang membuat video...';
            case 'success':
            case 'completed': return '✅ Video selesai!';
            case 'fail':
            case 'failed': return '❌ Gagal';
            default: return '🚀 Memulai...';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting':
            case 'queuing':
            case 'generating':
                return <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full"><Loader2 className="w-3 h-3 animate-spin" />Proses</span>;
            case 'success':
            case 'completed':
                return <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" />Selesai</span>;
            case 'fail':
            case 'failed':
                return <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" />Gagal</span>;
            default:
                return <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"><Clock className="w-3 h-3" />{status}</span>;
        }
    };

    const parseVideoData = (jsonStr: string) => {
        try {
            return JSON.parse(jsonStr);
        } catch {
            return null;
        }
    };

    return (
        <AppLayout activeTab="dashboard">
            <Head title="AI Content Generator" />

            {/* Header */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-4 pt-6 pb-8 rounded-b-3xl text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/umkm/dashboard" className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">AI Content Generator</h1>
                        <p className="text-sm text-white/70">Buat konten promosi dengan AI</p>
                    </div>
                </div>

                {/* 3-Panel Tabs */}
                <div className="flex p-1 bg-black/20 backdrop-blur-md rounded-xl">
                    <button
                        onClick={() => setActivePanel('video')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activePanel === 'video' ? 'bg-white text-violet-600 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                    >
                        <Film className="w-4 h-4" />
                        Video AI
                    </button>
                    <button
                        onClick={() => setActivePanel('poster')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activePanel === 'poster' ? 'bg-white text-violet-600 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Poster
                    </button>
                    <button
                        onClick={() => setActivePanel('landing')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activePanel === 'landing' ? 'bg-white text-violet-600 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
                    >
                        <Layout className="w-4 h-4" />
                        Landing
                    </button>
                </div>
            </div>

            <div className="px-4 -mt-4 pb-24 space-y-4">
                {/* VIDEO GENERATOR PANEL */}
                {activePanel === 'video' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        {/* Quota Display */}
                        <div className={`rounded-xl p-4 ${videoQuota.remaining > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Kuota Video AI</span>
                                <span className={`text-lg font-bold ${videoQuota.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {videoQuota.used}/{videoQuota.max}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {videoQuota.remaining > 0
                                    ? `Sisa ${videoQuota.remaining} video lagi`
                                    : 'Kuota habis. Hubungi admin untuk tambah kuota.'}
                            </p>
                        </div>

                        {/* Currently Generating Video Status */}
                        {isGenerating && (
                            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-violet-800">{getStatusText(generationStatus)}</p>
                                        <p className="text-xs text-violet-600">Video sedang diproses, mohon tunggu...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mode Selection */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Film className="w-5 h-5 text-violet-500" />
                                Pilih Jenis Video
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMode('store_photo')}
                                    disabled={isGenerating}
                                    className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${mode === 'store_photo' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}
                                >
                                    <Store className={`w-8 h-8 mb-2 ${mode === 'store_photo' ? 'text-violet-500' : 'text-gray-400'}`} />
                                    <p className="font-semibold text-sm text-gray-800">Foto Toko</p>
                                    <p className="text-xs text-gray-500">Gunakan foto lokasi usaha</p>
                                </button>
                                <button
                                    onClick={() => setMode('product_photo')}
                                    disabled={isGenerating}
                                    className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${mode === 'product_photo' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}
                                >
                                    <Package className={`w-8 h-8 mb-2 ${mode === 'product_photo' ? 'text-violet-500' : 'text-gray-400'}`} />
                                    <p className="font-semibold text-sm text-gray-800">Foto Produk</p>
                                    <p className="text-xs text-gray-500">AI buatkan suasana</p>
                                </button>
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-violet-500" />
                                {mode === 'store_photo' ? 'Upload Foto Toko' : 'Upload Foto Produk'}
                            </h2>

                            {/* Warning Alert */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>⚠️ Penting:</strong> Pastikan <strong>TIDAK ADA ORANG</strong> dalam foto agar AI dapat memproses video dengan lancar dan tidak error.
                                </p>
                            </div>

                            {!photoPreview ? (
                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 transition-all">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Tap untuk pilih foto</span>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={isGenerating} />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                                    <button onClick={removePhoto} disabled={isGenerating} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg disabled:opacity-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Business Info */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 space-y-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-violet-500" />
                                Info Usaha
                            </h2>

                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                disabled={isGenerating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl disabled:bg-gray-50"
                                placeholder="Nama Usaha / Toko"
                            />

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isGenerating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white disabled:bg-gray-50"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>



                            {/* New Product Name & Auto Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detail Produk</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        disabled={isGenerating}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl disabled:bg-gray-50 bg-gray-50 focus:bg-white transition-colors"
                                        placeholder="Nama Produk (Cth: Seblak Jeletot)"
                                    />
                                    <button
                                        onClick={handleGenerateDescription}
                                        disabled={generatingDesc || isGenerating || !productName}
                                        className="px-4 py-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                                        title="Buat deskripsi otomatis dengan AI"
                                    >
                                        {generatingDesc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{generatingDesc ? 'Membuat...' : 'Buat Deskripsi'}</span>
                                        <span className="sm:hidden">{generatingDesc ? '...' : 'Auto'}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400">
                                    💡 Masukkan nama produk, lalu klik tombol "Buat Deskripsi".
                                </p>
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
                                    <p className="font-semibold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" />
                                        Jaminan Konten Relevan
                                    </p>
                                    <p>
                                        AI akan otomatis menyesuaikan visual dengan <b>Kategori Toko</b> Anda agar tidak melenceng (misal: Toko Sembako tidak akan dibuatkan video Makanan Siap Saji).
                                    </p>
                                    <p className="opacity-80">
                                        *Kami juga otomatis menyelipkan produk lain dari etalase toko Anda sebagai latar belakang agar video terlihat lebih nyata & "hidup".
                                    </p>
                                </div>
                            </div>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isGenerating}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl h-28 resize-none disabled:bg-gray-50 text-sm leading-relaxed"
                                placeholder={mode === 'store_photo' ? 'Deskripsi suasana toko...' : 'Deskripsi visual produk...'}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    disabled={isGenerating}
                                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50"
                                    placeholder="Lokasi (Opsional)"
                                />
                                <input
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    disabled={isGenerating}
                                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm disabled:bg-gray-50"
                                    placeholder="Kontak (Opsional)"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">Durasi:</span>
                                <div className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white">
                                    15 detik
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-700">Gagal Generate</p>
                                    <p className="text-sm text-red-600">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={generateVideo}
                            disabled={loading || !isFormValid || videoQuota.remaining <= 0 || isGenerating}
                            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {getStatusText(generationStatus)}
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate Video AI
                                </>
                            )}
                        </button>

                        {/* New Video Result */}
                        {videoUrls.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-200 animate-in fade-in">
                                <h3 className="font-bold text-green-600 flex items-center gap-2 mb-4">
                                    <Play className="w-5 h-5" />
                                    Video Siap! 🎉
                                </h3>
                                <video
                                    src={videoUrls[0]}
                                    controls
                                    className="w-full rounded-xl shadow-md"
                                    poster={photoPreview || undefined}
                                />
                                <a
                                    href={videoUrls[0]}
                                    download
                                    target="_blank"
                                    className="mt-4 w-full py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Video
                                </a>
                            </div>
                        )}

                        {/* VIDEO HISTORY SECTION */}
                        {videoHistory.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-violet-500" />
                                    Riwayat Video ({videoHistory.length})
                                </h2>
                                <div className="space-y-4">
                                    {videoHistory.map((video) => {
                                        const data = parseVideoData(video.generated_result);
                                        const videoUrl = data?.video_urls?.[0];
                                        const storeName = data?.store_name || 'Video';
                                        const createdAt = new Date(video.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        // Smart status: if video_urls exist, treat as completed regardless of stored status
                                        const effectiveStatus = videoUrl ? 'completed' : video.status;

                                        return (
                                            <div key={video.id} className="border border-gray-200 rounded-xl p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{storeName}</p>
                                                        <p className="text-xs text-gray-500">{createdAt}</p>
                                                    </div>
                                                    {getStatusBadge(effectiveStatus)}
                                                </div>

                                                {/* Video Player - show whenever video URL exists */}
                                                {videoUrl && (
                                                    <div className="space-y-2">
                                                        <video
                                                            src={videoUrl}
                                                            controls
                                                            className="w-full rounded-lg aspect-video bg-black"
                                                        />
                                                        <a
                                                            href={videoUrl}
                                                            download
                                                            target="_blank"
                                                            className="w-full py-2 bg-violet-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-600"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </a>
                                                    </div>
                                                )}

                                                {/* Processing status - including 'waiting' */}
                                                {!videoUrl && ['waiting', 'queuing', 'generating'].includes(effectiveStatus) && (
                                                    <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                                                            <span className="text-sm text-yellow-700">Video sedang diproses...</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (data?.task_id) {
                                                                    refreshVideoStatus(video.id, data.task_id);
                                                                }
                                                            }}
                                                            className="w-full py-2 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600"
                                                        >
                                                            🔄 Cek Status Manual
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Failed status */}
                                                {!videoUrl && (effectiveStatus === 'fail' || effectiveStatus === 'failed') && (
                                                    <div className="bg-red-50 rounded-lg p-3">
                                                        <span className="text-sm text-red-700">Gagal membuat video. {data?.error || ''}</span>
                                                    </div>
                                                )}

                                                {/* Unknown status without video - show retry button */}
                                                {!videoUrl && !['waiting', 'queuing', 'generating', 'completed', 'success', 'fail', 'failed'].includes(effectiveStatus) && (
                                                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                                                        <span className="text-sm text-blue-700">Status: {video.status}. Video mungkin sudah selesai.</span>
                                                        <button
                                                            onClick={() => {
                                                                if (data?.task_id) {
                                                                    refreshVideoStatus(video.id, data.task_id);
                                                                }
                                                            }}
                                                            className="w-full py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                                                        >
                                                            🔄 Cek Status Ulang
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* POSTER GENERATOR PANEL */}
                {activePanel === 'poster' && (
                    <PosterGeneratorPanel store={store} contents={contents} quota={posterQuota} />
                )}

                {/* LANDING PAGE PANEL */}
                {activePanel === 'landing' && (
                    <LandingPagePanel
                        store={store}
                        landingPage={landingPage}
                        products={landingProducts}
                        templates={landingTemplates}
                    />
                )}
            </div>
        </AppLayout >
    );
}
