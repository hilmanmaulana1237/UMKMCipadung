import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import {
    Settings, Key, Zap, Video, CheckCircle, XCircle,
    Loader2, Eye, EyeOff, ArrowLeft, Shield, Cpu,
    Server, Globe, TestTube, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';

interface ApiConfig {
    key: string;
    model: string;
    provider: string;
    base_url: string;
    description: string;
    is_active: boolean;
    is_configured: boolean;
    masked_key: string | null;
}

interface Props {
    settings: {
        primary: ApiConfig;
        secondary: ApiConfig;
        video: ApiConfig;
    };
}

const providerModels: Record<string, string[]> = {
    openrouter: [
        'openai/gpt-oss-120b', // Smart (Mentor)
        'meta-llama/llama-3.1-8b-instruct', // Fast (Shopping/Tools)
        'deepseek/deepseek-r1:free',
        'google/gemini-2.0-flash-exp:free',
    ],
    'kie-ai': ['sora-2-image-to-video'], // Video Provider
};

const providerUrls: Record<string, string> = {
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    'kie-ai': 'https://api.kie.ai/api/v1/jobs',
};

export default function ApiSettings({ settings }: Props) {
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [testing, setTesting] = useState<Record<string, boolean>>({});
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    const tiers = [
        {
            id: 'primary',
            label: 'API Utama',
            icon: Zap,
            color: 'blue',
            description: 'Untuk UMKM Mentor dan Admin AI Chatbot. Gunakan model yang pintar.',
            config: settings.primary
        },
        {
            id: 'secondary',
            label: 'API Sekunder',
            icon: Cpu,
            color: 'emerald',
            description: 'Untuk tugas ringan: generate deskripsi produk, Shopping AI, smart replies.',
            config: settings.secondary
        },
        {
            id: 'video',
            label: 'API Video',
            icon: Video,
            color: 'purple',
            description: 'Untuk Video Generation (masa depan).',
            config: settings.video
        },
    ];

    const handleSave = async (tier: string, formData: FormData) => {
        setSaving({ ...saving, [tier]: true });

        router.post('/admin/settings/api', {
            tier,
            api_key: formData.get('api_key') as string,
            model: formData.get('model') as string,
            provider: formData.get('provider') as string,
            base_url: formData.get('base_url') as string,
            is_active: formData.get('is_active') === 'on',
        }, {
            preserveScroll: true,
            onFinish: () => setSaving({ ...saving, [tier]: false }),
        });
    };

    const handleTest = async (tier: string) => {
        setTesting({ ...testing, [tier]: true });
        setTestResults({ ...testResults, [tier]: null });

        try {
            const response = await axios.post('/admin/settings/api/test', { tier });
            setTestResults({ ...testResults, [tier]: response.data });
        } catch {
            setTestResults({ ...testResults, [tier]: { success: false, message: 'Network error' } });
        } finally {
            setTesting({ ...testing, [tier]: false });
        }
    };

    return (
        <>
            <Head title="Pengaturan API - Admin" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/admin/dashboard"
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-blue-600" />
                                        Pengaturan API AI
                                    </h1>
                                    <p className="text-sm text-slate-500">Kelola API key untuk fitur AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* Security Notice */}
                    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900">Keamanan API Key</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                API key disimpan terenkripsi di database. Setelah disimpan, key hanya ditampilkan sebagai ••••.
                                Rekomendasi: Gunakan <a href="https://openrouter.ai" target="_blank" className="underline font-medium">OpenRouter.ai</a> (gratis dengan rate limit).
                            </p>
                        </div>
                    </div>

                    {/* API Tiers */}
                    <div className="grid gap-6">
                        {tiers.map((tier) => (
                            <div
                                key={tier.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden"
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSave(tier.id, new FormData(e.currentTarget));
                                }}>
                                    {/* Tier Header */}
                                    <div className={`px-6 py-4 bg-gradient-to-r ${tier.color === 'blue' ? 'from-blue-500 to-indigo-600' :
                                        tier.color === 'emerald' ? 'from-emerald-500 to-teal-600' :
                                            'from-purple-500 to-pink-600'
                                        } text-white`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <tier.icon className="w-6 h-6" />
                                                <div>
                                                    <h2 className="text-lg font-bold">{tier.label}</h2>
                                                    <p className="text-sm opacity-90">{tier.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {tier.config.is_configured ? (
                                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Terkonfigurasi
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        Belum Dikonfigurasi
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <div className="p-6 space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Provider */}
                                            <div className="space-y-2">
                                                <Label className="text-slate-700 font-medium flex items-center gap-2">
                                                    <Globe className="w-4 h-4" />
                                                    Provider
                                                </Label>
                                                {tier.id === 'video' ? (
                                                    <div className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-100 flex items-center text-slate-500">
                                                        Kie AI (Video Only)
                                                        <input type="hidden" name="provider" value="kie-ai" />
                                                    </div>
                                                ) : (
                                                    <select
                                                        name="provider"
                                                        defaultValue={tier.config.provider}
                                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    >
                                                        <option value="openrouter">OpenRouter (Chat/Text)</option>
                                                    </select>
                                                )}
                                            </div>

                                            {/* Model - Hide for Video but send value */}
                                            {tier.id === 'video' ? (
                                                <input type="hidden" name="model" value="sora-2-image-to-video" />
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                                                        <Cpu className="w-4 h-4" />
                                                        Model
                                                    </Label>
                                                    <select
                                                        name="model"
                                                        defaultValue={tier.config.model}
                                                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    >
                                                        {providerModels[tier.config.provider]?.map((model) => (
                                                            <option key={model} value={model}>{model}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        {/* API Key */}
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium flex items-center gap-2">
                                                <Key className="w-4 h-4" />
                                                API Key
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type={showKeys[tier.id] ? 'text' : 'password'}
                                                    name="api_key"
                                                    placeholder={tier.config.is_configured
                                                        ? `Tersimpan: ${tier.config.masked_key || '••••••••'}`
                                                        : 'Masukkan API key baru...'}
                                                    className="h-11 rounded-xl pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowKeys({ ...showKeys, [tier.id]: !showKeys[tier.id] })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showKeys[tier.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Kosongkan jika tidak ingin mengubah key yang sudah tersimpan
                                            </p>
                                        </div>

                                        {/* Base URL */}
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 font-medium flex items-center gap-2">
                                                <Server className="w-4 h-4" />
                                                Base URL (Opsional)
                                            </Label>
                                            <Input
                                                type="url"
                                                name="base_url"
                                                defaultValue={tier.config.base_url}
                                                placeholder={tier.id === 'video' ? providerUrls['kie-ai'] : providerUrls[tier.config.provider]}
                                                className="h-11 rounded-xl"
                                            />
                                        </div>

                                        {/* Active Toggle */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                id={`active-${tier.id}`}
                                                defaultChecked={tier.config.is_active}
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor={`active-${tier.id}`} className="text-slate-700 cursor-pointer">
                                                Aktifkan API ini
                                            </Label>
                                        </div>

                                        {/* Test Result */}
                                        {testResults[tier.id] && (
                                            <div className={`p-3 rounded-xl ${testResults[tier.id]?.success
                                                ? 'bg-green-50 border border-green-200 text-green-700'
                                                : 'bg-red-50 border border-red-200 text-red-700'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    {testResults[tier.id]?.success
                                                        ? <CheckCircle className="w-4 h-4" />
                                                        : <XCircle className="w-4 h-4" />
                                                    }
                                                    <span className="text-sm">{testResults[tier.id]?.message}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTest(tier.id)}
                                                disabled={testing[tier.id] || !tier.config.is_configured}
                                                className="rounded-xl"
                                            >
                                                {testing[tier.id] ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <TestTube className="w-4 h-4 mr-2" />
                                                )}
                                                Test Koneksi
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={saving[tier.id]}
                                                className={`rounded-xl ${tier.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    tier.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                                        'bg-purple-600 hover:bg-purple-700'
                                                    }`}
                                            >
                                                {saving[tier.id] ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4 mr-2" />
                                                )}
                                                Simpan
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Panduan Penggunaan API</h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <h4 className="font-semibold text-blue-900 mb-2">API Utama (OpenRouter)</h4>
                                <p className="text-blue-700">
                                    Digunakan untuk fitur yang membutuhkan AI pintar: UMKM Mentor, Admin Chatbot.
                                    Rekomendasi: <strong>openai/gpt-oss-120b</strong>
                                </p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl">
                                <h4 className="font-semibold text-emerald-900 mb-2">API Sekunder (OpenRouter)</h4>
                                <p className="text-emerald-700">
                                    Untuk tugas ringan: deskripsi produk, Shopping AI.
                                    Rekomendasi: <strong>meta-llama/llama-3.1-8b-instruct</strong>
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                                <h4 className="font-semibold text-purple-900 mb-2">API Video (Kie AI)</h4>
                                <p className="text-purple-700">
                                    Wajib menggunakan Kie AI untuk fitur generate video promosi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
