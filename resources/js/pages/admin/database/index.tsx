import React from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Database, Download, Trash2, HardDrive, Clock, FileText, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
    id: number;
    filename: string;
    size: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

interface Props {
    backups: Backup[];
}

export default function DatabaseIndex({ backups }: Props) {
    const handleBackup = () => {
        router.post('/admin/database', {}, {
            onStart: () => toast.loading('Sedang membuat backup...'),
            onSuccess: () => toast.dismiss(),
            onError: () => toast.error('Gagal membuat backup'),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus backup ini?')) {
            router.delete(`/admin/database/${id}`, {
                onSuccess: () => toast.success('Backup berhasil dihapus'),
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AdminLayout title="Database Backup">
            <Head title="Database Backup" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Database className="w-6 h-6 text-primary" />
                            Database Backup
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola backup database harian sistem.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            id="restore-file"
                            className="hidden"
                            accept=".sql,.sqlite"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (confirm('PERINGATAN: Restore database akan menimpa data saat ini. Anda yakin?')) {
                                        const formData = new FormData();
                                        formData.append('backup_file', file);

                                        router.post('/admin/database/restore', formData as any, {
                                            forceFormData: true,
                                            onStart: () => toast.loading('Sedang memulihkan database...'),
                                            onSuccess: () => {
                                                toast.dismiss();
                                                toast.success('Database berhasil dipulihkan!');
                                            },
                                            onError: (err) => {
                                                toast.dismiss();
                                                toast.error('Gagal restore: ' + (err?.message || 'Terjadi kesalahan'));
                                            },
                                        });
                                    }
                                    e.target.value = ''; // Reset input
                                }
                            }}
                        />
                        <button
                            onClick={() => document.getElementById('restore-file')?.click()}
                            className="bg-orange-500 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            Restore Database
                        </button>
                        <button
                            onClick={handleBackup}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Backup Sekarang
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <HardDrive className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Backup</p>
                                <p className="text-lg font-bold">{backups.length} File</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Terakhir Backup</p>
                                <p className="text-lg font-bold">
                                    {backups.length > 0
                                        ? formatDate(backups[0].created_at)
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Ukuran</p>
                                <p className="text-lg font-bold">
                                    {backups.length > 0 ? backups[0].size : '0 MB'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3">Size</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {backups.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Database className="w-8 h-8 opacity-20" />
                                                <p>Belum ada backup tersedia.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    backups.map((backup) => (
                                        <tr key={backup.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {backup.filename}
                                            </td>
                                            <td className="px-6 py-4">{backup.size}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {formatDate(backup.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${backup.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : backup.status === 'failed'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {backup.status === 'completed' ? 'Sukses' : backup.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/admin/database/${backup.id}/download`}
                                                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(backup.id)}
                                                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
