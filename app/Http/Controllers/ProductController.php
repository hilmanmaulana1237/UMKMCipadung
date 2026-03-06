<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
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
            return redirect()->route('umkm.dashboard');
        }

        try {
            $query = $store->products()->with('productCategory')->latest();

            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            if ($request->has('category_id') && $request->category_id !== 'all') {
                if ($request->category_id === 'uncategorized') {
                    $query->whereNull('product_category_id');
                } else {
                    $query->where('product_category_id', $request->category_id);
                }
            }

            $products = $query->paginate(20)->withQueryString();
            $productCategories = $store->productCategories()->withCount('products')->get();
        } catch (\Exception $e) {
            $query = $store->products()->latest();
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            $products = $query->paginate(20)->withQueryString();
            $productCategories = collect();
        }

        return Inertia::render('umkm/products/index', [
            'products' => $products,
            'productCategories' => $productCategories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Show create product form.
     */
    public function create()
    {
        $store = auth()->user()->umkmStore;
        try {
            $productCategories = $store ? $store->productCategories()->get() : collect();
        } catch (\Exception $e) {
            $productCategories = collect();
        }

        return Inertia::render('umkm/products/create', [
            'categories' => $this->getCategories(),
            'productCategories' => $productCategories,
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
            'product_category_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240',
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

        $store = auth()->user()->umkmStore;
        try {
            $productCategories = $store ? $store->productCategories()->get() : collect();
            $product->load('productCategory');
        } catch (\Exception $e) {
            $productCategories = collect();
        }

        return Inertia::render('umkm/products/edit', [
            'product' => $product,
            'categories' => $this->getCategories(),
            'productCategories' => $productCategories,
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
            'product_category_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:10240',
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

        // Check if product has associated orders
        if ($product->orderItems()->exists()) {
            // Soft-delete: deactivate instead of hard delete to preserve transaction history
            $product->is_active = false;
            $product->name = '[Dihapus] ' . $product->name;
            $product->save();

            return redirect()->route('products.index')
                ->with('success', 'Produk dinonaktifkan karena masih terkait dengan transaksi yang ada.');
        }

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
     * Get available store type categories.
     */
    private function getCategories(): array
    {
        return [
            ['id' => 'kuliner', 'name' => 'Kuliner'],
            ['id' => 'kriya', 'name' => 'Kriya'],
            ['id' => 'jasa', 'name' => 'Jasa'],
        ];
    }

    /**
     * Store a new product menu category.
     */
    public function storeCategory(Request $request)
    {
        $store = auth()->user()->umkmStore;
        if (!$store)
            abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $maxOrder = $store->productCategories()->max('sort_order') ?? 0;

        $category = $store->productCategories()->create([
            'name' => $validated['name'],
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Kategori "' . $category->name . '" berhasil ditambahkan!');
    }

    /**
     * Update a product menu category.
     */
    public function updateCategory(Request $request, ProductCategory $category)
    {
        $store = auth()->user()->umkmStore;
        if (!$store || $category->umkm_store_id !== $store->id)
            abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $category->update($validated);

        return back()->with('success', 'Kategori berhasil diperbarui!');
    }

    /**
     * Delete a product menu category. Products in this category become uncategorized.
     */
    public function destroyCategory(ProductCategory $category)
    {
        $store = auth()->user()->umkmStore;
        if (!$store || $category->umkm_store_id !== $store->id)
            abort(403);

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus!');
    }

    /**
     * Reorder product categories.
     */
    public function reorderCategories(Request $request)
    {
        $store = auth()->user()->umkmStore;
        if (!$store)
            abort(403);

        $validated = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:product_categories,id',
        ]);

        foreach ($validated['order'] as $index => $categoryId) {
            ProductCategory::where('id', $categoryId)
                ->where('umkm_store_id', $store->id)
                ->update(['sort_order' => $index]);
        }

        return back()->with('success', 'Urutan kategori berhasil diperbarui!');
    }
}
