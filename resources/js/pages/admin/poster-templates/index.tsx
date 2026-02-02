import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import Heading from '@/components/heading';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2
} from 'lucide-react';

interface PosterTemplate {
    id: number;
    name: string;
    type: 'makanan' | 'jasa';
    thumbnail_url: string;
    is_active: boolean;
}

interface Props {
    templates: PosterTemplate[];
}

export default function PosterTemplatesIndex({ templates }: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'makanan' as 'makanan' | 'jasa',
        image_file: null as File | null,
        image_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/poster-templates', {
            onSuccess: () => {
                reset();
                setIsAdding(false);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus template ini?')) {
            router.delete(`/admin/poster-templates/${id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Template Poster" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Heading
                            title="Template Poster AI"
                            description="Kelola template yang tersedia untuk generator poster AI."
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-violet-700 transition-colors"
                    >
                        {isAdding ? 'Batal' : <><Plus className="w-4 h-4" /> Tambah Template</>}
                    </button>
                </div>

                {/* Form Tambah Template */}
                {isAdding && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                        <h3 className="font-bold text-gray-800 mb-4">Tambah Template Baru</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Template</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                                        placeholder="Contoh: Promo Makanan Pedas"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value as 'makanan' | 'jasa')}
                                        className="w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                                    >
                                        <option value="makanan">Makanan/Produk</option>
                                        <option value="jasa">Jasa/Layanan</option>
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sumber Gambar</label>
                                <div className="flex gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => { setUploadMode('file'); clearErrors(); }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <ImageIcon className="w-4 h-4" /> Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setUploadMode('url'); clearErrors(); }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${uploadMode === 'url' ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <LinkIcon className="w-4 h-4" /> URL Eksternal
                                    </button>
                                </div>

                                {uploadMode === 'file' ? (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('image_file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                ) : (
                                    <input
                                        type="url"
                                        value={data.image_url}
                                        onChange={e => setData('image_url', e.target.value)}
                                        placeholder="https://example.com/template.png"
                                        className="w-full rounded-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                                    />
                                )}
                                {errors.image_file && <p className="text-red-500 text-xs mt-1">{errors.image_file}</p>}
                                {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Simpan Template
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Template */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="relative aspect-[3/4] bg-gray-100">
                                <img
                                    src={template.thumbnail_url}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${template.type === 'makanan' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {template.type === 'makanan' ? 'Makanan' : 'Jasa'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="font-semibold text-gray-800 text-sm truncate" title={template.name}>{template.name}</h4>
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Belum ada template poster.</p>
                            <p className="text-sm">Klik "Tambah Template" untuk memulai.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
