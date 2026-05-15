import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
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
    products: Array<{
        name?: string;
        price?: string;
        description?: string;
        image_path?: string | null;
    }>;
    is_published: boolean;
}

type ManualProduct = {
    name: string;
    price: string;
    description: string;
    image_path?: string | null;
    imageFile?: File | null;
    imagePreview?: string | null;
};

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

    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(
        landingPage?.hero_image_path ? `/storage/${landingPage.hero_image_path}` : null
    );

    // Manual Products
    const [manualProducts, setManualProducts] = useState<ManualProduct[]>(
        Array.isArray(landingPage?.products)
            ? landingPage.products.map((p) => ({
                name: p?.name || '',
                price: p?.price || '',
                description: p?.description || '',
                image_path: p?.image_path || null,
                imageFile: null,
                imagePreview: null,
            }))
            : []
    );

    const addProduct = () => {
        if (manualProducts.length >= 10) {
            alert('Maksimal 10 produk dapat ditambahkan.');
            return;
        }
        setManualProducts([...manualProducts, { name: '', price: '', description: '', image_path: null, imageFile: null, imagePreview: null }]);
    };

    const removeProduct = (index: number) => {
        setManualProducts(manualProducts.filter((_, i) => i !== index));
    };

    const updateProduct = (index: number, field: 'name' | 'price' | 'description', value: string) => {
        const newProducts = [...manualProducts];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setManualProducts(newProducts);
    };

    const updateProductImage = (index: number, file: File | null) => {
        const newProducts = [...manualProducts];

        if (!file) {
            newProducts[index] = {
                ...newProducts[index],
                imageFile: null,
                imagePreview: null,
                image_path: null,
            };
            setManualProducts(newProducts);
            return;
        }

        newProducts[index] = {
            ...newProducts[index],
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
        };
        setManualProducts(newProducts);
    };

    const [generatingProductIndex, setGeneratingProductIndex] = useState<number | null>(null);

    const generateProductDescription = async (index: number) => {
        const prod = manualProducts[index];

        setGeneratingProductIndex(index);
        try {
            const response = await axios.post('/ai/generate-description', {
                name: prod.name || null,
                category: store?.category || 'lainnya',
                price: prod.price ? Number(prod.price.replace(/[^0-9]/g, '')) : null,
                mode: 'short',
            });
            
            if (response.data.success) {
                const shortDescription = String(response.data.description || '').slice(0, 120);
                const newProducts = [...manualProducts];
                newProducts[index] = {
                    ...newProducts[index],
                    name: response.data.name,
                    price: response.data.price,
                    description: shortDescription
                };
                setManualProducts(newProducts);
            } else {
                alert('Gagal membuat deskripsi. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Failed to generate description', error);
            alert('Gagal membuat deskripsi. Silakan coba lagi.');
        } finally {
            setGeneratingProductIndex(null);
        }
    };

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



    // Handle initial state update if landing page prop changes
    useEffect(() => {
        if (landingPage) {
            setSelectedTemplate(landingPage.template || '');
            setTagline(landingPage.tagline || '');
            setLpDescription(landingPage.description || '');

            setHeroPreview(landingPage.hero_image_path ? `/storage/${landingPage.hero_image_path}` : null);
            setIsPublished(landingPage.is_published);
            setManualProducts(
                Array.isArray(landingPage.products)
                    ? landingPage.products.map((p) => ({
                        name: p?.name || '',
                        price: p?.price || '',
                        description: p?.description || '',
                        image_path: p?.image_path || null,
                        imageFile: null,
                        imagePreview: null,
                    }))
                    : []
            );
            // Features
            setFeature1Title(landingPage.feature1_title || '');
            setFeature1Desc(landingPage.feature1_desc || '');
            setFeature2Title(landingPage.feature2_title || '');
            setFeature2Desc(landingPage.feature2_desc || '');
            setFeature3Title(landingPage.feature3_title || '');
            setFeature3Desc(landingPage.feature3_desc || '');
        }
    }, [landingPage]);

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('customize');
        
        if (landingPage) {
            // Auto save when changing template
            await handleSave(isPublished, templateId);
            window.location.reload();
        }
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

    const handleSave = async (publish: boolean = false, overrideTemplate?: string) => {
        const templateToSave = overrideTemplate || selectedTemplate;
        if (!templateToSave) {
            setErrorMsg('Silakan pilih template terlebih dahulu.');
            return;
        }
        setSaving(true);
        setErrorMsg(null);
        const formData = new FormData();
        formData.append('template', templateToSave);
        formData.append('tagline', tagline);
        formData.append('description', lpDescription);
        formData.append('is_published', publish ? '1' : '0');

        // Append manual products
        manualProducts.forEach((prod, index) => {
            formData.append(`products[${index}][name]`, prod.name);
            formData.append(`products[${index}][price]`, prod.price);
            formData.append(`products[${index}][description]`, prod.description);
            if (prod.imageFile) {
                formData.append(`product_images[${index}]`, prod.imageFile);
            }
        });

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
                                        {selectedTemplate !== landingPage.template && (
                                            <div className="text-xs text-orange-600 mt-1 font-medium animate-pulse">
                                                ⚠️ Tema diubah. Jangan lupa klik "Simpan/Publish".
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setStep('template')} className="text-xs bg-white border border-gray-300 shadow-sm text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-1 transition-colors">
                                        🎨 Ganti Tema
                                    </button>
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

                    {/* Manual Products Entry */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-800">🛒 Daftar Produk/Layanan <span className="text-gray-400 font-normal">({manualProducts.length}/10)</span></h3>
                            <button onClick={addProduct} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium border border-green-200 hover:bg-green-100 transition">
                                + Tambah Produk
                            </button>
                        </div>
                        
                        {manualProducts.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-6 border-2 border-dashed border-gray-200 rounded-xl">
                                Belum ada produk. Klik tombol tambah untuk memasukkan produk/layanan Anda.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {manualProducts.map((prod, index) => (
                                    <div key={index} className="relative bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <button 
                                            onClick={() => removeProduct(index)}
                                            className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Produk/Layanan</label>
                                                <input
                                                    type="text"
                                                    value={prod.name}
                                                    onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                                    placeholder="Contoh: Nasi Goreng Spesial (Atau biarkan AI yang isi)"
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Harga (Opsional)</label>
                                                <input
                                                    type="text"
                                                    value={prod.price}
                                                    onChange={(e) => updateProduct(index, 'price', e.target.value)}
                                                    placeholder="Contoh: 25000"
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Foto Produk</label>
                                            <div className="flex items-start gap-3">
                                                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-violet-400 transition-colors cursor-pointer overflow-hidden flex items-center justify-center">
                                                    {(prod.imagePreview || prod.image_path) ? (
                                                        <img
                                                            src={prod.imagePreview || `/storage/${prod.image_path}`}
                                                            alt={`Produk ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-500 text-center px-1">Upload Foto</span>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => updateProductImage(index, e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                                <div className="flex-1 text-xs text-gray-500 space-y-2">
                                                    <p>Gunakan foto asli produk agar tampil di landing page.</p>
                                                    {(prod.imagePreview || prod.image_path) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateProductImage(index, null)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            Hapus Foto
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-medium text-gray-600">Deskripsi Singkat</label>
                                                <button 
                                                    onClick={() => generateProductDescription(index)}
                                                    disabled={generatingProductIndex === index}
                                                    className="text-[10px] bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-1 rounded-md font-medium"
                                                >
                                                    {generatingProductIndex === index ? '⏳ AI...' : '🤖 AI Generate'}
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={prod.description}
                                                onChange={(e) => updateProduct(index, 'description', e.target.value)}
                                                placeholder="Contoh: Jersey handmade motif tradisional, nyaman dipakai harian."
                                                maxLength={120}
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>                    {/* Error Display */}
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
    const [posterType, setPosterType] = useState<'makanan' | 'enhance'>('enhance');
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
    const [newVideoUnavailable, setNewVideoUnavailable] = useState(false);
    const [historyVideoUnavailable, setHistoryVideoUnavailable] = useState<Record<string, boolean>>({});

    // UGC Photo Generation State
    const [ugcTaskId, setUgcTaskId] = useState<string | null>(null);
    const [ugcContentId, setUgcContentId] = useState<string | null>(null);
    const [ugcStatus, setUgcStatus] = useState<string>('');
    const [ugcPhotoUrl, setUgcPhotoUrl] = useState<string | null>(null);

    // Video history from props
    const videoHistory = contents.filter(c => c.type === 'video_generation');

    // Find any generating videos or UGC photos on mount and resume polling
    useEffect(() => {
        const generatingVideo = videoHistory.find(v => ['waiting', 'queuing', 'generating', 'running', 'starting'].includes(v.status));
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
        } else {
            // Only check UGC if no video is generating, to resume the 2-step process
            const generatingUgc = contents.find(c => c.type === 'ugc_photo' && ['waiting', 'queuing', 'generating', 'running', 'starting'].includes(c.status));
            if (generatingUgc) {
                try {
                    const data = JSON.parse(generatingUgc.generated_result);
                    if (data.task_id) {
                        setUgcTaskId(data.task_id);
                        setUgcContentId(generatingUgc.id);
                        setUgcStatus(generatingUgc.status);
                        if (data.product_name) {
                            setProductName(data.product_name);
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse generating UGC data');
                }
            }
        }
    }, []);

    // Ref lock to prevent duplicate generateVideo POST requests
    const isGeneratingVideoRef = useRef(false);

    // Polling for video status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        // Include 'waiting', 'running' in the list of active statuses
        const activeStatuses = ['waiting', 'queuing', 'generating', 'running', 'starting'];
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
                            setNewVideoUnavailable(false);
                            setVideoUrls(response.data.video_urls);
                            setTaskId(null);
                            isGeneratingVideoRef.current = false;
                            // Reload page to refresh history
                            window.location.reload();
                        } else if (response.data.state === 'fail') {
                            setErrorMessage(response.data.fail_msg || 'Video generation failed');
                            setTaskId(null);
                            isGeneratingVideoRef.current = false;
                        }
                    }
                } catch (error) {
                    console.error('Status check error:', error);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [taskId, contentId, generationStatus]);

    // Ref guard to prevent duplicate auto-video-generation from overlapping polling callbacks
    const hasAutoTriggeredVideoRef = useRef(false);

    // Reset the guard when user starts a new UGC photo generation
    useEffect(() => {
        if (ugcTaskId) {
            hasAutoTriggeredVideoRef.current = false;
        }
    }, [ugcTaskId]);

    // Polling for UGC Photo status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const activeStatuses = ['waiting', 'queuing', 'generating', 'running', 'starting'];
        if (ugcTaskId && ugcContentId && activeStatuses.includes(ugcStatus)) {
            interval = setInterval(async () => {
                // If we already triggered video generation, stop polling immediately
                if (hasAutoTriggeredVideoRef.current) {
                    clearInterval(interval);
                    return;
                }
                try {
                    const response = await axios.post('/umkm/ai-content/check-ugc-photo-status', {
                        task_id: ugcTaskId,
                        content_id: ugcContentId,
                    });
                    if (response.data.success) {
                        setUgcStatus(response.data.state);
                        if (response.data.state === 'success') {
                            // Guard: only trigger video generation once
                            if (hasAutoTriggeredVideoRef.current) return;
                            hasAutoTriggeredVideoRef.current = true;

                            // Stop polling immediately (don't wait for React state update)
                            clearInterval(interval);

                            const generatedUrl = response.data.local_url || (response.data.image_urls && response.data.image_urls[0]);
                            setUgcPhotoUrl(generatedUrl);
                            setUgcTaskId(null);
                            
                            // Auto-proceed to video generation (called exactly once)
                            generateVideo(generatedUrl);
                            
                        } else if (response.data.state === 'fail') {
                            clearInterval(interval);
                            setErrorMessage(response.data.fail_msg || 'Gagal membuat foto UGC');
                            setUgcTaskId(null);
                            setLoading(false);
                        }
                    }
                } catch (error) {
                    console.error('UGC Status check error:', error);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [ugcTaskId, ugcContentId, ugcStatus]);

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

    const generateUGCPhoto = async () => {
        if (!photo || !productName) return;
        isGeneratingVideoRef.current = false; // Reset video lock for new generation cycle
        setLoading(true);
        setErrorMessage('');
        setUgcStatus('starting');
        setUgcPhotoUrl(null);
        
        const formData = new FormData();
        formData.append('product_name', productName);
        formData.append('photo', photo);
        
        try {
            const response = await axios.post('/umkm/ai-content/generate-ugc-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setUgcTaskId(response.data.task_id);
                setUgcContentId(response.data.content_id);
                setUgcStatus('queuing');
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.error || 'Gagal memulai foto UGC');
            setUgcStatus('');
        } finally {
            setLoading(false);
        }
    };



    const generateVideo = async (providedUgcUrl?: string) => {
        // Prevent duplicate calls (race condition guard)
        if (isGeneratingVideoRef.current) {
            console.warn('generateVideo: already in progress, skipping duplicate call');
            return;
        }

        const finalUgcUrl = providedUgcUrl || ugcPhotoUrl;
        
        if ((!photo && !finalUgcUrl) || !productName) return;
        if (videoQuota.remaining <= 0) {
            setErrorMessage(`Kuota video habis. Maksimal ${videoQuota.max} video per UMKM.`);
            return;
        }

        isGeneratingVideoRef.current = true;
        setLoading(true);
        setErrorMessage('');
        setVideoUrls([]);
        setNewVideoUnavailable(false);
        setGenerationStatus('starting');

        const formData = new FormData();
        formData.append('product_name', productName);
        
        if (finalUgcUrl) {
            formData.append('ugc_photo_url', finalUgcUrl);
        } else if (photo) {
            formData.append('photo', photo);
        }

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
            isGeneratingVideoRef.current = false;
            setErrorMessage(error.response?.data?.error || 'Gagal generate video');
            setGenerationStatus('');
            setLoading(false);
        }
    };

    const isFormValid = photo && productName;
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

    const { auth } = usePage().props as any;
    const hasAvatar = !!auth?.user?.avatar_path;

    return (
        <AppLayout activeTab="ai-tools">
            <Head title="AI Content Generator" />

            {/* Modal: Foto profil wajib */}
            {!hasAvatar && auth?.user?.role !== 'admin' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Foto Profil</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Foto profil Anda diperlukan sebagai bahan untuk AI Content Generator.
                            Silakan upload foto terlebih dahulu.
                        </p>
                        <Link
                            href="/profile"
                            className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            <Camera className="w-4 h-4 inline mr-2" />
                            Upload Foto Sekarang
                        </Link>
                        <Link
                            href="/umkm/dashboard"
                            className="block mt-3 text-sm text-gray-400 hover:text-gray-600"
                        >
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            )}

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

                        {/* Photo Upload */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-violet-500" />
                                Upload Foto Produk
                            </h2>

                            {!photoPreview ? (
                                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 transition-all">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Tap untuk pilih foto produk</span>
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
                                Detail Produk
                            </h2>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    disabled={isGenerating}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl disabled:bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Cth: Seblak Jeletot"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    💡 Masukkan nama produk Anda. AI akan otomatis membuatkan narasi video untuk mempromosikan produk ini.
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-700">Terjadi Kesalahan</p>
                                    <p className="text-sm text-red-600">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* GENERATE ACTION BUTTON */}
                        <div className="space-y-3">
                            <button
                                onClick={generateUGCPhoto}
                                disabled={loading || !photo || !productName || !!ugcTaskId || isGenerating}
                                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                            >
                                {!!ugcTaskId ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sedang Menyatukan Foto...
                                    </>
                                ) : isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sedang Membuat Video... ({getStatusText(generationStatus)})
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-5 h-5" />
                                        Generate Video AI
                                    </>
                                )}
                            </button>
                        </div>

                        {/* New Video Result */}
                        {videoUrls.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-green-200 animate-in fade-in">
                                <h3 className="font-bold text-green-600 flex items-center gap-2 mb-4">
                                    <Play className="w-5 h-5" />
                                    Video Siap! 🎉
                                </h3>
                                {!newVideoUnavailable ? (
                                    <>
                                        <video
                                            src={videoUrls[0]}
                                            controls
                                            className="w-full rounded-xl shadow-md"
                                            poster={photoPreview || undefined}
                                            onError={() => setNewVideoUnavailable(true)}
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
                                    </>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                        Maaf kak, video yang Anda cari sudah tidak tersedia di server karena melewati masa simpan media. Data proses pembuatan tetap tercatat untuk pelaporan.
                                    </div>
                                )}
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
                                        const hasExpiredVideos = Array.isArray(data?.expired_video_urls) && data.expired_video_urls.length > 0;
                                        const retentionNotice = data?.video_retention_notice;
                                        const playbackUnavailable = !!historyVideoUnavailable[video.id];
                                        const shouldShowUnavailableNotice = (!videoUrl && hasExpiredVideos) || !!retentionNotice || playbackUnavailable;
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
                                                {videoUrl && !playbackUnavailable && (
                                                    <div className="space-y-2">
                                                        <video
                                                            src={videoUrl}
                                                            controls
                                                            className="w-full rounded-lg aspect-video bg-black"
                                                            onError={() => setHistoryVideoUnavailable(prev => ({ ...prev, [video.id]: true }))}
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

                                                {shouldShowUnavailableNotice && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                        <span className="text-sm text-amber-800">
                                                            Maaf kak, video yang Anda inginkan sudah tidak tersedia di server karena melewati masa simpan media dari penyedia AI. Namun, riwayat proses dan data pelaporan tetap aman.
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Processing status - including 'waiting' */}
                                                {!videoUrl && !shouldShowUnavailableNotice && ['waiting', 'queuing', 'generating'].includes(effectiveStatus) && (
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
                                                {!videoUrl && !shouldShowUnavailableNotice && (effectiveStatus === 'fail' || effectiveStatus === 'failed') && (
                                                    <div className="bg-red-50 rounded-lg p-3">
                                                        <span className="text-sm text-red-700">Gagal membuat video. {data?.error || ''}</span>
                                                    </div>
                                                )}

                                                {/* Unknown status without video - show retry button */}
                                                {!videoUrl && !shouldShowUnavailableNotice && !['waiting', 'queuing', 'generating', 'completed', 'success', 'fail', 'failed'].includes(effectiveStatus) && (
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
