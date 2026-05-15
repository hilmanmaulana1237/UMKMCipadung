import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    price: number;
    image_path: string | null;
    description: string | null;
}

interface Template {
    name: string;
    description: string;
    preview: string;
    category: string;
}

interface LandingPage {
    id: number;
    slug: string;
    template: string;
    hero_image_path: string | null;
    tagline: string | null;
    description: string | null;
    products: number[];
    is_published: boolean;
    public_url: string;
}

interface Store {
    id: number;
    name: string;
    address: string;
    phone: string;
    description: string;
    category: string;
}

interface Props {
    store: Store;
    landingPage: LandingPage | null;
    products: Product[];
    templates: Record<string, Template>;
}

// Template data yang lebih user-friendly untuk UMKM
const templateInfo: Record<string, {
    emoji: string;
    friendlyName: string;
    simpleDesc: string;
    examples: string[];
    colors: { primary: string; secondary: string; accent: string };
}> = {
    tema1: {
        emoji: '✨',
        friendlyName: 'Elegan Hitam Emas',
        simpleDesc: 'Tampilan mewah dan premium. Warna hitam dengan aksen emas yang elegan.',
        examples: ['Restoran', 'Cafe', 'Makanan Premium', 'Catering'],
        colors: { primary: '#1a1a1a', secondary: '#d4af37', accent: '#fff8e7' },
    },
    tema2: {
        emoji: '🎀',
        friendlyName: 'Lucu & Ceria',
        simpleDesc: 'Tampilan imut dengan warna pink pastel. Cocok untuk produk yang manis dan menggemaskan.',
        examples: ['Kue', 'Dessert', 'Snack', 'Produk Anak'],
        colors: { primary: '#ff9a9e', secondary: '#fad0c4', accent: '#fff5f5' },
    },
    tema3: {
        emoji: '🖼️',
        friendlyName: 'Simpel & Bersih',
        simpleDesc: 'Tampilan minimalis hitam-putih. Fokus pada foto produk dengan desain yang bersih.',
        examples: ['Fashion', 'Aksesoris', 'Tas', 'Sepatu'],
        colors: { primary: '#1a1a1a', secondary: '#f5f5f5', accent: '#ffffff' },
    },
    tema4: {
        emoji: '🌿',
        friendlyName: 'Hangat & Tradisional',
        simpleDesc: 'Tampilan hangat dengan warna oranye kecoklatan. Cocok untuk produk tradisional.',
        examples: ['Oleh-oleh', 'Keripik', 'Makanan Tradisional', 'Kerajinan'],
        colors: { primary: '#c45c26', secondary: '#f4a460', accent: '#fff3e0' },
    },
    tema5: {
        emoji: '💼',
        friendlyName: 'Profesional Biru',
        simpleDesc: 'Tampilan profesional dengan warna biru. Cocok untuk jasa dan layanan.',
        examples: ['Laundry', 'Service', 'Jasa', 'Bengkel'],
        colors: { primary: '#2563eb', secondary: '#3b82f6', accent: '#eff6ff' },
    }
};

export default function LandingPageBuilder({ store, landingPage, products, templates }: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(landingPage?.template || '');
    const [tagline, setTagline] = useState(landingPage?.tagline || '');
    const [description, setDescription] = useState(landingPage?.description || '');
    // Products state now stores the full objects to be saved
    const [landingProducts, setLandingProducts] = useState<Partial<Product>[]>(
        landingPage?.products ? (landingPage.products as any).map((p: any, i: number) => ({
            ...p,
            id: -(i + 1), // Temporary IDs for manual products
            isManual: true
        })) : []
    );
    const [productImages, setProductImages] = useState<Record<number, File>>({});
    const [productPreviews, setProductPreviews] = useState<Record<number, string>>({});

    const [isPublished, setIsPublished] = useState(landingPage?.is_published || false);
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [step, setStep] = useState<'template' | 'customize'>(landingPage ? 'customize' : 'template');
    const [copySuccess, setCopySuccess] = useState(false);
    const [previewModal, setPreviewModal] = useState<{ open: boolean; templateId: string | null }>({ open: false, templateId: null });
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showChangeTemplate, setShowChangeTemplate] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('customize');
    };

    const handleChangeTemplate = (templateId: string) => {
        if (confirm('Yakin ingin ganti template?\n\nData tagline, deskripsi, dan produk akan tetap tersimpan.')) {
            setSelectedTemplate(templateId);
            setShowChangeTemplate(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductImages(prev => ({ ...prev, [index]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductPreviews(prev => ({ ...prev, [index]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addManualProduct = () => {
        if (landingProducts.length >= 10) {
            alert('Maksimal 10 produk.');
            return;
        }
        const newId = -(landingProducts.length + 1);
        setLandingProducts([...landingProducts, {
            id: newId,
            name: '',
            price: 0,
            description: '',
            image_path: null,
            isManual: true
        } as any]);
    };

    const selectFromStore = (product: Product) => {
        if (landingProducts.length >= 10) {
            alert('Maksimal 10 produk.');
            return;
        }
        // Don't add if already in list
        if (landingProducts.find(p => p.name === product.name)) return;

        setLandingProducts([...landingProducts, {
            ...product,
            isManual: false
        }]);
    };

    const removeProduct = (index: number) => {
        const newProducts = [...landingProducts];
        newProducts.splice(index, 1);
        setLandingProducts(newProducts);
        
        // Also cleanup images/previews
        const newImages = { ...productImages };
        delete newImages[index];
        setProductImages(newImages);
        
        const newPreviews = { ...productPreviews };
        delete newPreviews[index];
        setProductPreviews(newPreviews);
    };

    const updateProduct = (index: number, field: keyof Product, value: any) => {
        const newProducts = [...landingProducts];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setLandingProducts(newProducts);
    };

    const generateAIContent = async () => {
        setGeneratingAI(true);
        try {
            const response = await axios.post('/umkm/landing-page/generate-content', {
                store_name: store.name,
                category: store.category,
                description: store.description,
            });
            if (response.data.success) {
                setTagline(response.data.tagline);
                setDescription(response.data.description);
            }
        } catch (error) {
            console.error('AI generation failed:', error);
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSave = (publish: boolean = false) => {
        if (!selectedTemplate) {
            alert('Pilih template terlebih dahulu.');
            return;
        }
        
        setSaving(true);
        const formData = new FormData();
        formData.append('template', selectedTemplate);
        formData.append('tagline', tagline);
        formData.append('description', description);
        formData.append('is_published', publish ? '1' : '0');
        
        // Filter out products without names to avoid validation errors
        const validProducts = landingProducts.filter(p => p.name && p.name.trim() !== '');
        
        validProducts.forEach((product, index) => {
            formData.append(`products[${index}][name]`, product.name || '');
            formData.append(`products[${index}][price]`, (product.price || 0).toString());
            formData.append(`products[${index}][description]`, product.description || '');
            if (product.image_path) {
                formData.append(`products[${index}][image_path]`, product.image_path);
            }
            
            // Map the product images based on their index in the validProducts array
            // Find the original index from landingProducts to get the correct image file
            const originalIndex = landingProducts.indexOf(product);
            if (productImages[originalIndex]) {
                formData.append(`product_images[${index}]`, productImages[index]);
            }
        });

        if (heroImage) {
            formData.append('hero_image', heroImage);
        }

        router.post('/umkm/landing-page', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
            onError: (errors) => {
                console.error(errors);
                alert('Gagal menyimpan. Silakan coba lagi atau cek apakah ada data yang belum lengkap.');
            }
        });
    };

    const handleDelete = () => {
        if (landingPage && confirm('Yakin ingin menghapus landing page ini?')) {
            router.delete(`/umkm/landing-page/${landingPage.id}`);
        }
    };

    const copyLink = () => {
        if (landingPage?.public_url) {
            navigator.clipboard.writeText(window.location.origin + '/lp/' + landingPage.slug);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    const openPreview = (templateId: string) => {
        setPreviewModal({ open: true, templateId });
    };

    const closePreview = () => {
        setPreviewModal({ open: false, templateId: null });
    };

    const getPreviewUrl = (templateId: string) => {
        return `/landing-page-templates/${templateId}`;
    };

    const templateIds = Object.keys(templateInfo);
    const currentPreviewIndex = previewModal.templateId ? templateIds.indexOf(previewModal.templateId) : 0;

    const navigatePreview = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev'
            ? (currentPreviewIndex - 1 + templateIds.length) % templateIds.length
            : (currentPreviewIndex + 1) % templateIds.length;
        setPreviewModal({ open: true, templateId: templateIds[newIndex] });
    };

    // Styles
    const cardStyle: React.CSSProperties = {
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '2px solid transparent',
    };

    const selectedCardStyle: React.CSSProperties = {
        ...cardStyle,
        border: '2px solid #22c55e',
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.2)',
    };

    return (
        <AppLayout>
            <Head title="Landing Page Builder" />

            <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '120px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                        🌐 Buat Landing Page Toko
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Pilih tampilan yang cocok untuk usaha Anda. Cukup 3 langkah!
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '24px',
                    background: '#f9fafb',
                    padding: '12px 16px',
                    borderRadius: '12px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: step === 'template' ? '#3b82f6' : '#22c55e',
                        fontWeight: '600',
                    }}>
                        <span style={{
                            background: step === 'template' ? '#3b82f6' : '#22c55e',
                            color: '#fff',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                        }}>
                            {step === 'customize' || landingPage ? '✓' : '1'}
                        </span>
                        Pilih Tampilan
                    </div>
                    <div style={{ flex: 1, height: '2px', background: '#e5e7eb', margin: '0 12px' }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: step === 'customize' ? '#3b82f6' : '#9ca3af',
                        fontWeight: '600',
                    }}>
                        <span style={{
                            background: step === 'customize' ? '#3b82f6' : '#e5e7eb',
                            color: step === 'customize' ? '#fff' : '#9ca3af',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                        }}>2</span>
                        Isi Konten
                    </div>
                    <div style={{ flex: 1, height: '2px', background: '#e5e7eb', margin: '0 12px' }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#9ca3af',
                        fontWeight: '600',
                    }}>
                        <span style={{
                            background: '#e5e7eb',
                            color: '#9ca3af',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                        }}>3</span>
                        Publish
                    </div>
                </div>

                {/* Step 1: Template Selection */}
                {step === 'template' && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                            🎨 Pilih Tampilan yang Cocok
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Klik "Lihat Preview" untuk melihat contoh tampilan
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px',
                        }}>
                            {Object.entries(templateInfo).map(([id, info]) => (
                                <div
                                    key={id}
                                    style={selectedTemplate === id ? selectedCardStyle : cardStyle}
                                >
                                    {/* Preview Thumbnail */}
                                    <div style={{
                                        height: '180px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        background: '#f5f5f5',
                                    }}>
                                        <iframe
                                            src={getPreviewUrl(id)}
                                            style={{
                                                width: '200%',
                                                height: '400%',
                                                border: 'none',
                                                transform: 'scale(0.5)',
                                                transformOrigin: '0 0',
                                                pointerEvents: 'none',
                                            }}
                                            title={info.friendlyName}
                                        />
                                        {/* Overlay & Badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            background: 'rgba(255,255,255,0.95)',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '1.2rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        }}>
                                            {info.emoji}
                                        </div>
                                        {selectedTemplate === id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                background: '#22c55e',
                                                color: '#fff',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                            }}>
                                                ✓ Dipilih
                                            </div>
                                        )}
                                        {/* Preview Button Overlay */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openPreview(id); }}
                                            style={{
                                                position: 'absolute',
                                                bottom: '12px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            👁️ Lihat Preview
                                        </button>
                                    </div>

                                    {/* Card Info */}
                                    <div style={{ padding: '16px' }}>
                                        <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>
                                            {info.friendlyName}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>
                                            {info.simpleDesc}
                                        </p>

                                        {/* Example Tags */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginRight: '8px' }}>
                                                Cocok untuk:
                                            </span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                                {info.examples.map((ex, i) => (
                                                    <span key={i} style={{
                                                        background: info.colors.accent,
                                                        color: info.colors.primary,
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500',
                                                    }}>
                                                        {ex}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color Palette */}
                                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: info.colors.primary, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: info.colors.secondary, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: info.colors.accent, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                        </div>

                                        {/* Select Button */}
                                        <button
                                            onClick={() => handleTemplateSelect(id)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: selectedTemplate === id
                                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '0.95rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {selectedTemplate === id ? '✓ Template Ini Dipilih' : '✓ Pilih Template Ini'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Customize */}
                {step === 'customize' && (
                    <div>
                        {/* Template Info Bar */}
                        <div style={{
                            background: templateInfo[selectedTemplate]?.colors.accent || '#f9fafb',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{templateInfo[selectedTemplate]?.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: '600' }}>
                                        Template: {templateInfo[selectedTemplate]?.friendlyName}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                        Klik "Ganti Tampilan" jika ingin pilih yang lain
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowChangeTemplate(true)}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                }}
                            >
                                🔄 Ganti Tampilan
                            </button>
                        </div>

                        {/* Current Status */}
                        {landingPage && (
                            <div style={{
                                background: landingPage.is_published ? '#dcfce7' : '#fef3c7',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <div>
                                    <span style={{ fontWeight: '600' }}>
                                        {landingPage.is_published ? '✅ Sudah Online' : '⏳ Masih Draft'}
                                    </span>
                                    {landingPage.is_published && (
                                        <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: '4px' }}>
                                            Link: {window.location.origin}/lp/{landingPage.slug}
                                        </div>
                                    )}
                                </div>
                                {landingPage.is_published && (
                                    <button
                                        onClick={copyLink}
                                        style={{
                                            background: copySuccess ? '#22c55e' : '#3b82f6',
                                            color: '#fff',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {copySuccess ? '✓ Link Disalin!' : '📋 Salin Link'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hero Image Upload */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                                📸 Foto Utama Toko (opsional)
                            </label>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
                                Upload foto terbaik produk atau toko Anda
                            </p>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: heroPreview ? `url(${heroPreview}) center/cover` : '#f9fafb',
                                    minHeight: '150px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {!heroPreview && (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                                        <span style={{ color: '#6b7280' }}>
                                            Klik untuk upload foto
                                        </span>
                                    </div>
                                )}
                                {heroPreview && (
                                    <span style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        color: '#fff',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                    }}>
                                        Klik untuk ganti foto
                                    </span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Tagline & Description */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontWeight: '600' }}>✏️ Judul & Deskripsi</label>
                                <button
                                    onClick={generateAIContent}
                                    disabled={generatingAI}
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                        color: '#fff',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {generatingAI ? '⏳ Membuat...' : '🤖 Buat Otomatis (AI)'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '12px' }}>
                                Tulis judul menarik dan deskripsi singkat toko Anda
                            </p>
                            <input
                                type="text"
                                placeholder="Contoh: Bakso Pak Joko - Bakso Enak Harga Merakyat!"
                                value={tagline}
                                onChange={e => setTagline(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    marginBottom: '12px',
                                    fontSize: '1rem',
                                }}
                            />
                            <textarea
                                placeholder="Contoh: Kami menyediakan bakso dengan kuah gurih spesial dan daging sapi pilihan sejak tahun 2010..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {/* Product Management Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontWeight: '600' }}>🛒 Produk yang Ditampilkan ({landingProducts.length}/10)</label>
                                <button
                                    onClick={addManualProduct}
                                    style={{
                                        background: '#f3f4f6',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ➕ Tambah Produk Manual
                                </button>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '16px' }}>
                                Kelola daftar produk yang akan muncul di landing page Anda. Anda bisa edit nama, harga, and upload foto khusus.
                            </p>

                            {/* Selected Products List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {landingProducts.map((product, index) => (
                                    <div key={index} style={{
                                        background: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        position: 'relative'
                                    }}>
                                        {/* Product Photo Upload */}
                                        <div 
                                            onClick={() => document.getElementById(`p-img-${index}`)?.click()}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '8px',
                                                background: productPreviews[index] 
                                                    ? `url(${productPreviews[index]}) center/cover` 
                                                    : (product.image_path ? `url(/storage/${product.image_path}) center/cover` : '#f3f4f6'),
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e5e7eb',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {!productPreviews[index] && !product.image_path && <span style={{ fontSize: '1.2rem' }}>📷</span>}
                                            <input 
                                                id={`p-img-${index}`}
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleProductImageChange(index, e)}
                                                style={{ display: 'none' }}
                                            />
                                        </div>

                                        {/* Product Details Inputs */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input 
                                                type="text" 
                                                placeholder="Nama Produk"
                                                value={product.name || ''}
                                                onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.9rem', fontWeight: '600' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input 
                                                    type="number" 
                                                    placeholder="Harga"
                                                    value={product.price || 0}
                                                    onChange={(e) => updateProduct(index, 'price', parseInt(e.target.value))}
                                                    style={{ width: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem' }}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Keterangan singkat"
                                                    value={product.description || ''}
                                                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                                                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button 
                                            onClick={() => removeProduct(index)}
                                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer' }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}

                                {landingProducts.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
                                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Belum ada produk terpilih. Tambahkan manual atau pilih dari toko di bawah.</p>
                                    </div>
                                )}
                            </div>

                            {/* Store Products Gallery */}
                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>📦 Produk dari Toko Anda</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                gap: '12px',
                                background: '#f9fafb',
                                padding: '12px',
                                borderRadius: '12px',
                                maxHeight: '300px',
                                overflow: 'auto',
                            }}>
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => selectFromStore(product)}
                                        style={{
                                            background: '#fff',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: '1px solid #e5e7eb',
                                            opacity: landingProducts.find(p => p.name === product.name) ? 0.5 : 1
                                        }}
                                    >
                                        <div style={{ height: '80px', background: product.image_path ? `url(/storage/${product.image_path}) center/cover` : '#f3f4f6' }} />
                                        <div style={{ padding: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#22c55e' }}>{formatPrice(product.price)}</div>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '0.85rem' }}>
                                        Tidak ada produk di toko.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            position: 'fixed',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            background: '#fff',
                            padding: '16px 20px',
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            zIndex: 100,
                        }}>
                            {landingPage && (
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        background: '#fee2e2',
                                        color: '#dc2626',
                                        padding: '12px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    🗑️
                                </button>
                            )}
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                style={{
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                💾 Simpan Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                style={{
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                }}
                            >
                                {saving ? '⏳ Menyimpan...' : '🚀 Publish Online'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewModal.open && previewModal.templateId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* Modal Header */}
                    <div style={{
                        background: '#1a1a1a',
                        padding: '12px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                                {templateInfo[previewModal.templateId]?.emoji}
                            </span>
                            <span style={{ color: '#fff', fontWeight: '600' }}>
                                {templateInfo[previewModal.templateId]?.friendlyName}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {/* Device Toggle */}
                            <div style={{
                                display: 'flex',
                                background: '#333',
                                borderRadius: '8px',
                                padding: '4px',
                            }}>
                                <button
                                    onClick={() => setPreviewDevice('desktop')}
                                    style={{
                                        background: previewDevice === 'desktop' ? '#fff' : 'transparent',
                                        color: previewDevice === 'desktop' ? '#1a1a1a' : '#999',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    💻 Desktop
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('mobile')}
                                    style={{
                                        background: previewDevice === 'mobile' ? '#fff' : 'transparent',
                                        color: previewDevice === 'mobile' ? '#1a1a1a' : '#999',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    📱 HP
                                </button>
                            </div>
                            <button
                                onClick={closePreview}
                                style={{
                                    background: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                }}
                            >
                                ✕ Tutup
                            </button>
                        </div>
                    </div>

                    {/* Navigation & Preview */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {/* Prev Button */}
                        <button
                            onClick={() => navigatePreview('prev')}
                            style={{
                                position: 'absolute',
                                left: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                border: 'none',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                            }}
                        >
                            ←
                        </button>

                        {/* Preview Frame */}
                        <div style={{
                            width: previewDevice === 'desktop' ? '90%' : '375px',
                            maxWidth: previewDevice === 'desktop' ? '1200px' : '375px',
                            height: previewDevice === 'desktop' ? '85%' : '667px',
                            background: '#fff',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}>
                            <iframe
                                src={getPreviewUrl(previewModal.templateId)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                                title="Template Preview"
                            />
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => navigatePreview('next')}
                            style={{
                                position: 'absolute',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                border: 'none',
                                padding: '16px 20px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                            }}
                        >
                            →
                        </button>
                    </div>

                    {/* Select Button */}
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                            onClick={() => { handleTemplateSelect(previewModal.templateId!); closePreview(); }}
                            style={{
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                color: '#fff',
                                padding: '14px 40px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                            }}
                        >
                            ✓ Pilih Template Ini
                        </button>
                    </div>
                </div>
            )}

            {/* Change Template Modal */}
            {showChangeTemplate && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '20px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '24px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>🔄 Ganti Tampilan</h2>
                            <button
                                onClick={() => setShowChangeTemplate(false)}
                                style={{
                                    background: '#f3f4f6',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                ✕ Batal
                            </button>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Data tagline, deskripsi, dan produk akan tetap tersimpan saat ganti tampilan.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {Object.entries(templateInfo).map(([id, info]) => (
                                <div
                                    key={id}
                                    onClick={() => handleChangeTemplate(id)}
                                    style={{
                                        border: selectedTemplate === id ? '2px solid #22c55e' : '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: selectedTemplate === id ? '#f0fdf4' : '#fff',
                                    }}
                                >
                                    <div style={{
                                        height: '100px',
                                        background: info.colors.accent,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                    }}>
                                        {info.emoji}
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{info.friendlyName}</div>
                                        {selectedTemplate === id && (
                                            <span style={{
                                                background: '#22c55e',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                            }}>
                                                Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
