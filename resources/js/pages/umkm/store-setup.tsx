import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { UmkmStore } from '@/types';
import { Save, Store, Upload, ArrowLeft, MapPin, Phone, Clock, Image as ImageIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    store: UmkmStore | null;
}

export default function StoreSetup({ store }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: store?.name || '',
        description: store?.description || '',
        address_pickup: store?.address_pickup || '',
        latitude: store?.latitude || '',
        longitude: store?.longitude || '',
        contact_number: store?.contact_number || '',
        bank_name: store?.bank_name || '',
        bank_account: store?.bank_account || '',
        bank_holder: store?.bank_holder || '',
        open_time: store?.open_time ? store.open_time.substring(0, 5) : '',
        close_time: store?.close_time ? store.close_time.substring(0, 5) : '',
        operating_days: store?.operating_days || [] as string[],
        qris: null as File | null,
        qris_handle: store?.qris_handle || '',
        banner: null as File | null,
        store_photo: null as File | null,
        profile_photo: null as File | null,
        admin_fee: store?.admin_fee || '0',
    });

    const [gettingLocation, setGettingLocation] = useState(false);
    const [useAdminFee, setUseAdminFee] = useState(Boolean(store?.admin_fee && Number(store.admin_fee) > 0));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/umkm/store', {
            forceFormData: true,
            onSuccess: () => toast.success('Pengaturan toko berhasil disimpan!'),
            onError: (errors) => {
                // Show specific validation errors
                const errorMessages = Object.values(errors).flat();
                if (errorMessages.length > 0) {
                    toast.error(errorMessages[0] as string);
                } else {
                    toast.error('Gagal menyimpan pengaturan toko');
                }
            },
        });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Browser tidak support geolocation');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                }));
                setGettingLocation(false);
                toast.success('Lokasi berhasil didapatkan!');
            },
            (error) => {
                console.error(error);
                toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
                setGettingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <AppLayout activeTab="dashboard" showBottomNav={false}>
            <Head title="Setup Toko" />

            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-border">
                <Link href="/umkm/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-semibold text-foreground">
                    {store ? 'Edit Toko' : 'Setup Toko'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-6 pb-24">
                {/* Store Identity */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identitas Toko</h2>

                    {/* Banner Upload */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">Banner Toko</span>
                        <div className="relative h-32 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                            {data.banner || store?.banner_path ? (
                                <img
                                    src={data.banner ? URL.createObjectURL(data.banner) : `/storage/${store?.banner_path}`}
                                    className="w-full h-full object-cover"
                                    alt="Banner Preview"
                                />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="w-8 h-8 text-white mb-2" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('banner', e.target.files?.[0] || null)}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            {!data.banner && !store?.banner_path && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground">Upload Banner</span>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Profile Photo Upload */}
                    <div className="flex justify-center -mt-10 relative z-10">
                        <div className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center shadow-lg border-2 border-border overflow-hidden group cursor-pointer relative hover:border-primary transition-colors">
                            {data.profile_photo || store?.profile_photo_path ? (
                                <img
                                    src={data.profile_photo ? URL.createObjectURL(data.profile_photo) : `/storage/${store?.profile_photo_path}`}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            ) : (
                                <Store className="w-10 h-10 text-muted-foreground" />
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white" />
                                <span className="text-[8px] text-white mt-1">Ubah Foto</span>
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('profile_photo', e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Klik untuk mengganti foto profil toko"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Nama Toko *</span>
                            <div className="relative mt-1">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Contoh: Warung Makan Bu Sari"
                                    required
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Deskripsi</span>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Deskripsi singkat tentang toko Anda"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Nomor WhatsApp/HP *</span>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Contoh: 08123456789"
                                    required
                                />
                            </div>
                            {errors.contact_number && <p className="mt-1 text-sm text-destructive">{errors.contact_number}</p>}
                        </label>
                    </div>

                    {/* Store Photo Upload (For Courier) */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                            Foto Toko / Bangunan
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Penting untuk Kurir</span>
                        </span>
                        <div className="relative h-48 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                            {data.store_photo || store?.store_photo_path ? (
                                <img
                                    src={data.store_photo ? URL.createObjectURL(data.store_photo) : `/storage/${store?.store_photo_path}`}
                                    className="w-full h-full object-cover"
                                    alt="Store Photo Preview"
                                />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="w-8 h-8 text-white mb-2" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('store_photo', e.target.files?.[0] || null)}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            {!data.store_photo && !store?.store_photo_path && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <Store className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground">Upload Foto Depan Toko</span>
                                    <span className="text-[10px] text-muted-foreground mt-1 text-center px-4">Bantu kurir menemukan tokomu dengan mudah</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location & Address */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lokasi & Alamat</h2>

                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Alamat Lengkap *</span>
                            <textarea
                                value={data.address_pickup}
                                onChange={(e) => setData('address_pickup', e.target.value)}
                                rows={2}
                                className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Alamat lengkap untuk pickup kurir"
                                required
                            />
                            {errors.address_pickup && <p className="mt-1 text-sm text-destructive">{errors.address_pickup}</p>}
                        </label>

                        <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Koordinat Peta
                                </span>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={gettingLocation}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                                >
                                    {gettingLocation ? 'Mencari...' : '📍 Ambil Lokasi'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-xs text-muted-foreground mb-1 block">Latitude</span>
                                    <input
                                        type="text"
                                        value={data.latitude}
                                        readOnly
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground"
                                        placeholder="-7.xxxxx"
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground mb-1 block">Longitude</span>
                                    <input
                                        type="text"
                                        value={data.longitude}
                                        readOnly
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground"
                                        placeholder="110.xxxxx"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                * Klik "Ambil Lokasi" saat berada di toko untuk akurasi terbaik bagi kurir.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Jam Operasional</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-green-600" />
                                Buka
                            </span>
                            <input
                                type="time"
                                value={data.open_time}
                                onChange={(e) => setData('open_time', e.target.value)}
                                className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-red-500" />
                                Tutup
                            </span>
                            <input
                                type="time"
                                value={data.close_time}
                                onChange={(e) => setData('close_time', e.target.value)}
                                className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </label>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">Jadwal Mingguan</span>
                            <span className="text-xs text-muted-foreground">Toko buka otomatis di hari terpilih</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {[
                                { key: 'monday', label: 'Sen' },
                                { key: 'tuesday', label: 'Sel' },
                                { key: 'wednesday', label: 'Rab' },
                                { key: 'thursday', label: 'Kam' },
                                { key: 'friday', label: 'Jum' },
                                { key: 'saturday', label: 'Sab' },
                                { key: 'sunday', label: 'Min' },
                            ].map((day) => {
                                const isSelected = data.operating_days.includes(day.key);
                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setData('operating_days', data.operating_days.filter(d => d !== day.key));
                                            } else {
                                                setData('operating_days', [...data.operating_days, day.key]);
                                            }
                                        }}
                                        className={`py-2.5 rounded-lg text-xs font-semibold transition-all ${isSelected
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-background border border-border text-muted-foreground hover:border-primary/50'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ⏰ Toko akan tutup otomatis setiap tengah malam dan buka sesuai jadwal yang dipilih.
                        </p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informasi Pembayaran</h2>
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground">Nama Bank</span>
                            <input
                                type="text"
                                value={data.bank_name}
                                onChange={(e) => setData('bank_name', e.target.value)}
                                className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="BCA, BRI, Mandiri, dll"
                            />
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">Nomor Rekening</span>
                                <input
                                    type="text"
                                    value={data.bank_account}
                                    onChange={(e) => setData('bank_account', e.target.value)}
                                    className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="1234567890"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-foreground">A.N. Pemilik</span>
                                <input
                                    type="text"
                                    value={data.bank_holder}
                                    onChange={(e) => setData('bank_holder', e.target.value)}
                                    className="mt-1 w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Sesuai buku tabungan"
                                />
                            </label>

                        </div>



                        <label className="block">
                            <span className="text-sm font-medium text-foreground">QRIS Toko (Opsional)</span>
                            <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('qris', e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                {data.qris || store?.qris_path ? (
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-green-500 mb-2" />
                                        <span className="text-sm font-medium text-green-600">
                                            {data.qris ? data.qris.name : 'QRIS Terupload'}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">Klik untuk ganti</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-foreground mb-1">Upload QRIS</p>
                                        <p className="text-xs text-muted-foreground">Format JPG/PNG</p>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </div>

                {/* Admin Fee Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Biaya Operasional Toko (Rp 500)</h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                {useAdminFee
                                    ? 'Aktif: Biaya Rp 500 akan dibebankan ke setiap pesanan.'
                                    : 'Nonaktif: Tidak ada biaya tambahan untuk pembeli.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const newValue = !useAdminFee;
                                setUseAdminFee(newValue);
                                setData('admin_fee', newValue ? '500' : '0');
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${useAdminFee ? 'bg-primary' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAdminFee ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
                    >
                        <Save className="w-5 h-5" />
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form >
        </AppLayout >
    );
}
