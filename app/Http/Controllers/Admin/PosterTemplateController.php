<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PosterTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PosterTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = PosterTemplate::latest()->get();
        return Inertia::render('admin/poster-templates/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Convert empty url to null to avoid validation issues
        if ($request->has('image_url') && empty($request->image_url)) {
            $request->merge(['image_url' => null]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:makanan,jasa',
            'image_file' => ['nullable', 'image', 'max:5120'], // Max 5MB
            'image_url' => ['nullable', 'url'],
        ]);

        // Custom validation: One of them must be present
        if (!$request->hasFile('image_file') && empty($request->image_url)) {
            return back()->withErrors(['image_file' => 'Harap upload gambar atau masukkan URL.']);
        }

        try {
            $data = [
                'name' => $request->name,
                'type' => $request->type,
                'is_active' => true,
            ];

            // Handle file upload
            if ($request->hasFile('image_file')) {
                $path = $request->file('image_file')->store('poster-templates', 'public');
                $data['image_path'] = $path;
            } 
            // Handle URL
            elseif ($request->image_url) {
                $data['image_url'] = $request->image_url;
            }

            PosterTemplate::create($data);

            return back()->with('success', 'Template poster berhasil ditambahkan.');
        } catch (\Exception $e) {
            \Log::error('Error saving poster template: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menyimpan template. ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PosterTemplate $posterTemplate)
    {
        // Delete image file if exists
        if ($posterTemplate->image_path) {
            Storage::disk('public')->delete($posterTemplate->image_path);
        }

        $posterTemplate->delete();

        return back()->with('success', 'Template poster berhasil dihapus.');
    }
}
