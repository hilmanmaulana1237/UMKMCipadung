<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\DatabaseBackup;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BackupController extends Controller
{
    /**
     * Display a listing of backups.
     */
    public function index()
    {
        $backups = DatabaseBackup::latest()->get();
        
        return Inertia::render('admin/database/index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Create a new backup.
     */
    public function store()
    {
        try {
            $exitCode = Artisan::call('app:backup-database');
            
            if ($exitCode === 0) {
                return back()->with('success', 'Backup berhasil dibuat!');
            } else {
                return back()->with('error', 'Gagal membuat backup. Cek log untuk detail.');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Download a backup file.
     */
    public function download(DatabaseBackup $backup)
    {
        if (!Storage::exists($backup->path)) {
            return back()->with('error', 'File backup tidak ditemukan.');
        }

        return Storage::download($backup->path, $backup->filename);
    }

    /**
     * Delete a backup.
     */
    public function destroy(DatabaseBackup $backup)
    {
        if (Storage::exists($backup->path)) {
            Storage::delete($backup->path);
        }

        $backup->delete();

        return back()->with('success', 'Backup berhasil dihapus.');
    }

    /**
     * Restore database from backup file.
     */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file',
        ]);

        $file = $request->file('backup_file');
        $connection = config('database.default');

        try {
            if ($connection === 'sqlite') {
                if ($file->getClientOriginalExtension() !== 'sqlite') {
                    return back()->with('error', 'Format file harus .sqlite untuk database SQLite.');
                }

                $source = $file->getRealPath();
                $destination = config('database.connections.sqlite.database');
                
                // Handle relative path config
                if (!file_exists($destination)) {
                    $destination = database_path($destination);
                }

                // Force copy (overwrite)
                if (!copy($source, $destination)) {
                    throw new \Exception("Gagal menyalin file database.");
                }

                return back()->with('success', 'Database berhasil dipulihkan! Silakan refresh halaman.');

            } elseif ($connection === 'mysql') {
                if ($file->getClientOriginalExtension() !== 'sql') {
                    return back()->with('error', 'Format file harus .sql untuk database MySQL.');
                }

                $path = $file->storeAs('temp', 'restore.sql');
                $fullPath = storage_path('app/' . $path);

                // Try system restore command first
                try {
                    $username = config('database.connections.mysql.username');
                    $password = config('database.connections.mysql.password');
                    $database = config('database.connections.mysql.database');
                    $host = config('database.connections.mysql.host');
                    $port = config('database.connections.mysql.port');

                    if ($host === 'localhost') $host = '127.0.0.1';

                    $command = sprintf(
                        'mysql --user=%s --password=%s --host=%s --port=%s --protocol=tcp %s < "%s"',
                        escapeshellarg($username),
                        escapeshellarg($password),
                        escapeshellarg($host),
                        escapeshellarg($port),
                        escapeshellarg($database),
                        $fullPath
                    );

                    $returnVar = null;
                    $output = [];
                    exec($command, $output, $returnVar);

                    if ($returnVar !== 0) {
                        throw new \Exception("Command line restore failed.");
                    }
                } catch (\Exception $e) {
                    // Fallback to PHP-based restore (DB::unprepared)
                    \Illuminate\Support\Facades\DB::unprepared(file_get_contents($fullPath));
                }
                
                // Cleanup temp file
                Storage::delete($path);

                return back()->with('success', 'Database berhasil dipulihkan!');
            } else {
                return back()->with('error', 'Driver database tidak didukung untuk restore otomatis.');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memulihkan database: ' . $e->getMessage());
        }
    }
}
