import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Order, User } from '@/types';
import { Radar, Power, MapPin, Truck, AlertTriangle, ArrowRight, Loader2, Zap, CheckCircle, Bot, Sparkles, Star, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AvailableJob {
    id: number;
    order_number: string;
    store_name: string;
    store_address: string;
    buyer_address: string;
    courier_fee: number;
    distance: number;
    created_at: string;
}

interface ActiveOrder {
    id: number;
    order_number: string;
    store?: { name: string };
    buyer?: { name: string };
}

interface CourierRating {
    average: number;
    total: number;
}

interface Props {
    availableJobs: AvailableJob[];
    isActive: boolean;
    activeOrder: ActiveOrder | null;
    courierRating?: CourierRating;
    auth: { user: User }; // Get auth user to check suspension
}

export default function CourierRadar({ availableJobs, isActive, activeOrder, courierRating, auth }: Props) {
    const isSuspended = auth.user.is_suspended;
    const [isToggling, setIsToggling] = useState(false);
    const [acceptingJobId, setAcceptingJobId] = useState<number | null>(null);
    const [acceptedJobId, setAcceptedJobId] = useState<number | null>(null);

    // Modal state for accept confirmation
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<AvailableJob | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'obtaining' | 'obtained' | 'failed'>('idle');
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Cipadung center coordinates for distance calculation
    const CIPADUNG_LAT = -6.9237;
    const CIPADUNG_LNG = 107.7042;
    const MAX_RADIUS_KM = 3.0;

    // Haversine formula to calculate distance
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal
    };

    // Check if current location is within Cipadung area
    const isWithinCipadung = currentLocation
        ? calculateDistance(currentLocation.lat, currentLocation.lng, CIPADUNG_LAT, CIPADUNG_LNG) <= MAX_RADIUS_KM
        : false;

    const distanceFromCipadung = currentLocation
        ? calculateDistance(currentLocation.lat, currentLocation.lng, CIPADUNG_LAT, CIPADUNG_LNG)
        : null;

    const toggleActive = () => {
        if (isSuspended) {
            toast.error('Akun ditangguhkan. Hubungi Admin.');
            return;
        }

        setIsToggling(true);

        const doToggle = (lat: number | null, lng: number | null) => {
            router.post('/courier/toggle', { lat, lng }, {
                onSuccess: () => {
                    toast.success(isActive ? 'Mode kurir dinonaktifkan' : 'Mode kurir aktif! 🚀');
                    // Force full page reload to guarantee UI sync
                    setTimeout(() => window.location.reload(), 500);
                },
                onError: (errors) => {
                    console.error('Toggle Error:', errors);
                    toast.error(errors.error || 'Gagal mengubah status. Coba lagi.');
                    setIsToggling(false);
                }
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => doToggle(pos.coords.latitude, pos.coords.longitude),
                (err) => {
                    console.warn('Geo failed:', err.message);
                    toast.warning('Gagal dapat lokasi, lanjut tanpa update posisi.');
                    doToggle(null, null);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            doToggle(null, null);
        }
    };

    const updateLocation = (isAuto = false) => {
        if (!isAuto) setIsRefreshing(true);
        if (!navigator.geolocation) {
            if (!isAuto) toast.error("Browser tidak mendukung lokasi.");
            if (!isAuto) setIsRefreshing(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                router.post('/courier/location', { lat, lng }, {
                    preserveScroll: isAuto, // Maintain scroll for auto-update
                    onSuccess: () => {
                        if (!isAuto) {
                            toast.success(`📍 Lokasi diperbarui! (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
                            // Force full page reload ONLY for manual update to be safe
                            setTimeout(() => window.location.reload(), 500);
                        } else {
                            console.log('Auto location update success');
                            // Inertia automatically updates props (availableJobs distances)
                        }
                    },
                    onError: () => {
                        if (!isAuto) toast.error("Gagal update lokasi ke server.");
                        if (!isAuto) setIsRefreshing(false);
                    },
                    onFinish: () => {
                        if (!isAuto) setIsRefreshing(false);
                    }
                });
            },
            (error) => {
                if (!isAuto) setIsRefreshing(false);
                if (!isAuto) toast.error(`Gagal deteksi lokasi: ${error.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Auto update location on mount if active
    useEffect(() => {
        if (isActive && !isSuspended) {
            updateLocation(true);
        }
    }, [isActive, isSuspended]);

    // Open modal and request location
    const handleAcceptClick = (job: AvailableJob) => {
        if (activeOrder || acceptingJobId) return;
        if (isSuspended) {
            toast.error('Akun ditangguhkan. Hubungi Admin.');
            return;
        }

        setSelectedJob(job);
        setShowAcceptModal(true);
        setLocationStatus('obtaining');
        setLocationError(null);
        setCurrentLocation(null);
        setLocationAccuracy(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationAccuracy(Math.round(position.coords.accuracy));
                setLocationStatus('obtained');

                // Warn if accuracy is poor (>500m indicates stale/cached data)
                if (position.coords.accuracy > 500) {
                    setLocationError('⚠️ Akurasi GPS rendah (kemungkinan data cache). Coba refresh atau buka di HP.');
                }
            },
            (error) => {
                setLocationStatus('failed');
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError('Akses lokasi ditolak. Izinkan akses lokasi di browser Anda.');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setLocationError('Lokasi tidak tersedia. Pastikan GPS aktif.');
                } else {
                    setLocationError('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan izinkan akses.');
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // Submit accept job with location
    const confirmAcceptJob = () => {
        if (!selectedJob || !currentLocation) return;

        if (isSuspended) {
            toast.error('Akun ditangguhkan.');
            return;
        }

        // Frontend validation - block if outside Cipadung
        if (!isWithinCipadung) {
            toast.error(`🚫 Anda di luar area Cipadung! Jarak: ${distanceFromCipadung} km (maksimal 3 km)`);
            return;
        }

        setAcceptingJobId(selectedJob.id);
        setShowAcceptModal(false);

        router.post(`/courier/jobs/${selectedJob.id}/accept`, {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
        }, {
            preserveScroll: false,
            onSuccess: () => {
                setAcceptedJobId(selectedJob.id);
                toast.success(`✅ Order ${selectedJob.order_number} berhasil diambil!`);
                setTimeout(() => {
                    router.visit('/courier/active');
                }, 800);
            },
            onError: (errors: any) => {
                // Tampilkan koordinat untuk debugging
                const coordInfo = `(Lokasi Anda: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`;
                const errorMsg = errors.error || errors.lat || 'Gagal mengambil order.';
                toast.error(`${errorMsg} ${coordInfo}`);
                setAcceptingJobId(null);
            },
            onFinish: () => {
                setSelectedJob(null);
                setCurrentLocation(null);
                setLocationStatus('idle');
            }
        });
    };

    const closeModal = () => {
        setShowAcceptModal(false);
        setSelectedJob(null);
        setCurrentLocation(null);
        setLocationStatus('idle');
        setLocationError(null);
    };

    return (
        <AppLayout activeTab="radar">
            <Head title="Radar Kurir" />

            {/* Suspended Alert */}
            {isSuspended && (
                <div className="px-4 pt-4">
                    <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
                        <div className="bg-red-500 rounded-full p-2 flex-shrink-0 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 text-lg">AKUN DITANGGUHKAN</h3>
                            <p className="text-red-800 text-sm mt-1 leading-snug">
                                Anda sedang di-banned sementara. Anda tidak bisa mengambil pesanan baru.
                            </p>
                            <div className="mt-3">
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Admin,%20kenapa%20akun%20saya%20di-suspend?"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                                >
                                    Hubungi Admin
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Toggle */}
            <div className={`px-4 pt-6 pb-6 transition-all duration-500 ${isSuspended ? 'bg-muted opacity-50 pointer-events-none grayscale' : isActive ? 'bg-gradient-to-br from-success to-emerald-600' : 'bg-muted'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-foreground'}`}>
                            Radar Kurir
                        </h1>
                        {/* Courier Rating Display */}
                        {courierRating && courierRating.total > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-3 h-3 ${s <= Math.round(courierRating.average) ? 'text-amber-400 fill-amber-400' : isActive ? 'text-white/30' : 'text-muted-foreground/30'}`}
                                        />
                                    ))}
                                </div>
                                <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-foreground'}`}>{courierRating.average.toFixed(1)}</span>
                                <span className={`text-xs ${isActive ? 'text-white/60' : 'text-muted-foreground'}`}>({courierRating.total} rating)</span>
                            </div>
                        )}
                        <p className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {isActive ? 'Anda sedang aktif mencari order' : 'Aktifkan untuk menerima order'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Refresh Location Button */}
                        <button
                            onClick={() => updateLocation(false)}
                            disabled={isRefreshing || !isActive}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                ? 'bg-white/20 text-white hover:bg-white/30'
                                : 'bg-muted/10 text-muted-foreground opacity-50 cursor-not-allowed'
                                } ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Update Lokasi Saya"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={toggleActive}
                            disabled={isToggling}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 ${isActive
                                ? 'bg-white text-success shadow-xl shadow-success/30'
                                : 'bg-primary text-white shadow-lg shadow-primary/30'
                                } ${isToggling ? 'animate-pulse' : ''}`}
                        >
                            {isToggling ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                                <Power className={`w-7 h-7 transition-transform ${isActive ? '' : ''}`} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Status indicator */}
                {isActive && (
                    <div className="mt-4 flex flex-col gap-1 animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span className="text-white/90 text-sm font-medium">Live mencari pesanan...</span>
                        </div>
                        {currentLocation && (
                            <p className="text-[10px] text-white/50 font-mono ml-4">
                                GPS: {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                            </p>
                        )}
                    </div>
                )}
            </div>



            {/* Active Order Banner */}
            {activeOrder && (
                <div className="mx-4 -mt-3 mb-4 animate-in slide-in-from-top-2">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 shadow-lg shadow-amber-100">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-amber-800 text-lg">Pesanan Aktif!</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    Selesaikan <span className="font-bold">{activeOrder.order_number}</span>
                                </p>
                                <Link
                                    href="/courier/active"
                                    className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-200 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                                >
                                    <Zap className="w-4 h-4" />
                                    Lihat Pesanan
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Jobs List */}
            <div className="px-4 py-4">
                {!isActive ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Radar className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                            Aktifkan mode kurir untuk melihat pesanan
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Tekan tombol power di atas untuk mulai
                        </p>
                    </div>
                ) : availableJobs.length === 0 ? (
                    <div className="bg-card rounded-2xl p-8 border border-border text-center">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                            <Radar className="w-20 h-20 text-primary/30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                            </div>
                        </div>
                        <p className="text-foreground font-medium">
                            Mencari pesanan...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Pesanan baru akan muncul di sini
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                            <h2 className="font-bold text-foreground">
                                {availableJobs.length} Pesanan Tersedia
                            </h2>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                                <MapPin className="w-3 h-3 inline mr-0.5" />
                                Terdekat
                            </span>
                        </div>

                        {availableJobs.map((job, index) => (
                            <div
                                key={job.id}
                                className={`bg-card rounded-2xl p-4 border-2 transition-all duration-300 ${acceptedJobId === job.id
                                    ? 'border-success bg-success/5 scale-[0.98]'
                                    : acceptingJobId === job.id
                                        ? 'border-primary bg-primary/5'
                                        : activeOrder
                                            ? 'opacity-50 border-border'
                                            : 'border-border hover:border-primary/50 hover:shadow-lg'
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-bold text-foreground text-lg">{job.store_name}</p>
                                        <p className="text-xs text-muted-foreground">{job.order_number}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-gradient-to-r from-success to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg shadow-success/20">
                                        +Rp {job.courier_fee.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3 p-2 bg-primary/5 rounded-xl">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-primary font-medium">JEMPUT</p>
                                            <p className="text-foreground font-medium">{job.store_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-2 bg-success/5 rounded-xl">
                                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Truck className="w-4 h-4 text-success" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-success font-medium">ANTAR</p>
                                            <p className="text-foreground font-medium">{job.buyer_address}</p>
                                        </div>
                                    </div>
                                </div>

                                {job.distance > 0 && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                        <span>Jarak: ~{job.distance} km</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleAcceptClick(job)}
                                    disabled={!!activeOrder || !!acceptingJobId}
                                    className={`w-full mt-4 py-4 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${acceptedJobId === job.id
                                        ? 'bg-success text-white'
                                        : acceptingJobId === job.id
                                            ? 'bg-primary/80 text-white'
                                            : activeOrder
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                                        }`}
                                >
                                    {acceptedJobId === job.id ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            ORDER DIAMBIL!
                                        </>
                                    ) : acceptingJobId === job.id ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            MENGAMBIL ORDER...
                                        </>
                                    ) : activeOrder ? (
                                        'SELESAIKAN PESANAN AKTIF'
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            AMBIL ORDER
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Debug Info Footer - Moved to bottom */}
            <div className="px-4 text-[10px] text-muted-foreground/50 text-center pb-6">
                v1.2 | GPS Accuracy: High | Timeout: 10s
            </div>

            {/* Accept Order Modal */}
            {showAcceptModal && selectedJob && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-card rounded-3xl p-6 w-full max-w-sm border border-border shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            Konfirmasi Ambil Pesanan
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Order: <span className="font-bold text-foreground">{selectedJob.order_number}</span>
                        </p>

                        {/* Location Status */}
                        <div className="bg-muted rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                {locationStatus === 'obtaining' && (
                                    <>
                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Mengambil Lokasi...</p>
                                            <p className="text-xs text-muted-foreground">Mohon tunggu</p>
                                        </div>
                                    </>
                                )}
                                {locationStatus === 'obtained' && currentLocation && (
                                    <>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${locationAccuracy && locationAccuracy > 500 ? 'bg-amber-500/20' : 'bg-success/20'}`}>
                                            <MapPin className={`w-5 h-5 ${locationAccuracy && locationAccuracy > 500 ? 'text-amber-500' : 'text-success'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${locationAccuracy && locationAccuracy > 500 ? 'text-amber-500' : 'text-success'}`}>
                                                {locationAccuracy && locationAccuracy > 500 ? '⚠️ Lokasi Terdeteksi (Akurasi Rendah)' : 'Lokasi Ditemukan'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                                            </p>
                                            <p className={`text-xs ${locationAccuracy && locationAccuracy > 500 ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                                                Akurasi: {locationAccuracy}m {locationAccuracy && locationAccuracy > 500 ? '(kemungkinan data cache!)' : ''}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {locationStatus === 'failed' && (
                                    <>
                                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-red-500">Gagal Mendapatkan Lokasi</p>
                                            <p className="text-xs text-muted-foreground">{locationError}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Info - Dynamic based on distance */}
                        {locationStatus === 'obtained' && distanceFromCipadung !== null && (
                            <div className={`rounded-xl p-3 mb-4 ${isWithinCipadung ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-300'}`}>
                                <p className={`text-xs ${isWithinCipadung ? 'text-green-800' : 'text-red-800'}`}>
                                    {isWithinCipadung ? (
                                        <>✅ <strong>OK!</strong> Anda dalam area Cipadung ({distanceFromCipadung} km dari pusat)</>
                                    ) : (
                                        <>🚫 <strong>DI LUAR AREA!</strong> Jarak Anda: {distanceFromCipadung} km (maksimal 3 km)</>
                                    )}
                                </p>
                            </div>
                        )}

                        {locationStatus !== 'obtained' && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-amber-800">
                                    <strong>⚠️ Penting:</strong> Anda harus berada di area Cipadung (radius 3km) untuk mengambil pesanan ini.
                                </p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmAcceptJob}
                                disabled={locationStatus !== 'obtained' || !isWithinCipadung}
                                className={`flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isWithinCipadung
                                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Zap className="w-4 h-4" />
                                {isWithinCipadung ? 'Ambil' : 'Di Luar Area'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating AI Insights Button */}
            <Link
                href="/courier/ai-insights"
                className="fixed bottom-32 z-[100] group"
                style={{ right: 'max(1rem, calc((100vw - 480px) / 2 + 1rem))' }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-25" />
                    <div className="relative w-14 h-14 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40 transition-all active:scale-95">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            AI Insights
                        </p>
                        <p className="text-xs text-muted-foreground">Prediksi & Tips</p>
                    </div>
                </div>
            </Link>

            {/* Bottom padding */}
            <div className="h-20" />
        </AppLayout>
    );
}
