import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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

export default function LandingPageBuilder({ store, landingPage, products, templates }: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<string>(landingPage?.template || '');
    const [tagline, setTagline] = useState(landingPage?.tagline || '');
    const [description, setDescription] = useState(landingPage?.description || '');
    const [selectedProducts, setSelectedProducts] = useState<number[]>(landingPage?.products || []);
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(
        landingPage?.hero_image_path ? `/storage/${landingPage.hero_image_path}` : null
    );
    const [isPublished, setIsPublished] = useState(landingPage?.is_published || false);
    const [saving, setSaving] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [step, setStep] = useState<'template' | 'customize'>(landingPage ? 'customize' : 'template');
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('customize');
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

    const toggleProduct = (productId: number) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else if (selectedProducts.length < 10) {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const generateAIContent = async () => {
        setGeneratingAI(true);
        try {
            const response = await fetch('/umkm/landing-page/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    store_name: store.name,
                    category: store.category,
                    description: store.description,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setTagline(data.tagline);
                setDescription(data.description);
            }
        } catch (error) {
            console.error('AI generation failed:', error);
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSave = (publish: boolean = false) => {
        setSaving(true);
        const formData = new FormData();
        formData.append('template', selectedTemplate);
        formData.append('tagline', tagline);
        formData.append('description', description);
        formData.append('is_published', publish ? '1' : '0');
        selectedProducts.forEach((id, index) => {
            formData.append(`products[${index}]`, id.toString());
        });
        if (heroImage) {
            formData.append('hero_image', heroImage);
        }

        router.post('/umkm/landing-page', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
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

    return (
        <AppLayout>
            <Head title="Landing Page Builder" />

            <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                        🌐 Landing Page Builder
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Buat landing page profesional untuk toko Anda dalam hitungan menit.
                    </p>
                </div>

                {/* Step 1: Template Selection */}
                {step === 'template' && (
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
                            Pilih Template
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                            {Object.entries(templates).map(([id, template]) => (
                                <div
                                    key={id}
                                    onClick={() => handleTemplateSelect(id)}
                                    style={{
                                        border: selectedTemplate === id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: '#fff',
                                    }}
                                >
                                    {/* Preview Image Placeholder */}
                                    <div style={{
                                        height: '120px',
                                        background: id === 'tema1' ? 'linear-gradient(135deg, #1a1a1a, #333)' :
                                            id === 'tema2' ? 'linear-gradient(135deg, #fff5f5, #ffe8e6)' :
                                                id === 'tema3' ? 'linear-gradient(135deg, #fff, #f5f5f5)' :
                                                    id === 'tema4' ? 'linear-gradient(135deg, #fff3e0, #ffe0b2)' :
                                                        'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                    }}>
                                        {id === 'tema1' ? '✨' : id === 'tema2' ? '🎀' : id === 'tema3' ? '🖼️' : id === 'tema4' ? '🌿' : '💧'}
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{template.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.4' }}>
                                            {template.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Customize */}
                {step === 'customize' && (
                    <div>
                        {/* Back Button */}
                        <button
                            onClick={() => setStep('template')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            ← Ganti Template
                        </button>

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
                                        {landingPage.is_published ? '✅ Sudah Dipublish' : '⏳ Draft'}
                                    </span>
                                    {landingPage.is_published && (
                                        <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: '4px' }}>
                                            URL: {window.location.origin}/lp/{landingPage.slug}
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
                                        {copySuccess ? '✓ Copied!' : '📋 Copy Link'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hero Image Upload */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                                📸 Foto Utama (Hero)
                            </label>
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
                                    <span style={{ color: '#6b7280' }}>
                                        Klik untuk upload foto toko/produk utama
                                    </span>
                                )}
                                {heroPreview && (
                                    <span style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        color: '#fff',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                    }}>
                                        Klik untuk ganti
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
                                <label style={{ fontWeight: '600' }}>✏️ Tagline & Deskripsi</label>
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
                                    {generatingAI ? '⏳ Generating...' : '🤖 Generate AI'}
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Tagline singkat dan menarik..."
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
                                placeholder="Deskripsi toko Anda..."
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

                        {/* Product Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                                🛒 Pilih Produk (Max 10)
                                <span style={{ fontWeight: '400', color: '#6b7280', marginLeft: '8px' }}>
                                    {selectedProducts.length}/10 terpilih
                                </span>
                            </label>

                            {products.length === 0 ? (
                                <div style={{
                                    background: '#f9fafb',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    color: '#6b7280',
                                }}>
                                    Belum ada produk. Tambahkan produk terlebih dahulu.
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '12px',
                                }}>
                                    {products.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            style={{
                                                border: selectedProducts.includes(product.id) ? '2px solid #22c55e' : '1px solid #e5e7eb',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                background: selectedProducts.includes(product.id) ? '#f0fdf4' : '#fff',
                                                position: 'relative',
                                            }}
                                        >
                                            {selectedProducts.includes(product.id) && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#22c55e',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    zIndex: 1,
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{
                                                height: '100px',
                                                background: product.image_path ? `url(/storage/${product.image_path}) center/cover` : '#f3f4f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                {!product.image_path && '📦'}
                                            </div>
                                            <div style={{ padding: '10px' }}>
                                                <div style={{ fontWeight: '500', fontSize: '0.85rem', marginBottom: '4px', lineHeight: '1.3' }}>
                                                    {product.name}
                                                </div>
                                                <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.8rem' }}>
                                                    {formatPrice(product.price)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    🗑️ Hapus
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
                                {saving ? '⏳ Menyimpan...' : '🚀 Publish'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
