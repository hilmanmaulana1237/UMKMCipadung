<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Services\ImageService;

class ProductController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * List products for UMKM owner.
     */
    public function index(Request $request)
    {
        $store = auth()->user()->umkmStore;

        if (!$store) {
            return redirect()->route('umkm.store.setup');
        }

        $query = $store->products()->latest();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(5)
            ->withQueryString();

        return Inertia::render('umkm/products/index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show create product form.
     */
    public function create()
    {
        return Inertia::render('umkm/products/create', [
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Store new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|in:kuliner,kriya,jasa',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240', // Increased max size since we compress
            'is_physical' => 'boolean',
        ]);

        $store = auth()->user()->umkmStore;

        $product = new Product($validated);
        $product->umkm_store_id = $store->id;

        if ($request->hasFile('image')) {
            $product->image_path = $this->imageService->upload(
                $request->file('image'),
                'products'
            );
        }

        $product->save();

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan!');
    }

    /**
     * Show edit product form.
     */
    public function edit(Product $product)
    {
        $this->authorizeProduct($product);

        return Inertia::render('umkm/products/edit', [
            'product' => $product,
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Update product.
     */
    public function update(Request $request, Product $product)
    {
        $this->authorizeProduct($product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|in:kuliner,kriya,jasa',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240', // Increased max size
            'is_active' => 'boolean',
            'is_physical' => 'boolean',
        ]);

        $product->fill($validated);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = $this->imageService->upload(
                $request->file('image'),
                'products'
            );
        }

        $product->save();

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui!');
    }

    /**
     * Delete product.
     */
    public function destroy(Product $product)
    {
        $this->authorizeProduct($product);

        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil dihapus!');
    }

    /**
     * Toggle product active status.
     */
    public function toggleActive(Product $product)
    {
        $this->authorizeProduct($product);

        $product->update(['is_active' => !$product->is_active]);

        return back()->with('success', $product->is_active 
            ? 'Produk diaktifkan.' 
            : 'Produk dinonaktifkan.');
    }

    /**
     * Check if user owns this product.
     */
    private function authorizeProduct(Product $product): void
    {
        $store = auth()->user()->umkmStore;
        
        if (!$store || $product->umkm_store_id !== $store->id) {
            abort(403);
        }
    }

    /**
     * Get available categories.
     */
    private function getCategories(): array
    {
        return [
            ['id' => 'kuliner', 'name' => 'Kuliner'],
            ['id' => 'kriya', 'name' => 'Kriya'],
            ['id' => 'jasa', 'name' => 'Jasa'],
        ];
    }
}
