<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AIController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Generate product description using AI.
     * POST /api/ai/generate-description
     */
    public function generateDescription(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:kuliner,kriya,jasa',
            'price' => 'nullable|numeric|min:0',
        ]);

        $description = $this->aiService->generateProductDescription(
            $request->name,
            $request->category,
            $request->price
        );

        return response()->json([
            'success' => true,
            'description' => $description,
        ]);
    }

    /**
     * Get price suggestion for a product category.
     * POST /api/ai/suggest-price
     */
    public function suggestPrice(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:kuliner,kriya,jasa',
        ]);

        $suggestion = $this->aiService->suggestPrice(
            $request->name,
            $request->category
        );

        return response()->json([
            'success' => true,
            ...$suggestion,
        ]);
    }

    /**
     * Get AI-powered business insights for UMKM dashboard.
     * GET /api/ai/insights
     */
    public function getInsights(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'umkm') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $store = $user->store;
        
        // Gather store data for insights
        $storeData = [
            'low_stock_products' => [],
            'pending_orders' => 0,
            'weekly_sales' => 0,
            'last_week_sales' => 0,
            'top_product' => null,
        ];

        if ($store) {
            // Get low stock products
            $lowStockProducts = $store->products()
                ->where('stock', '<', 10)
                ->where('is_active', true)
                ->take(3)
                ->get(['id', 'name', 'stock']);
            
            $storeData['low_stock_products'] = $lowStockProducts->toArray();

            // Get pending orders count
            $storeData['pending_orders'] = $store->orders()
                ->where('status', 'waiting_verification')
                ->count();

            // Get weekly sales (simplified - just count orders)
            $storeData['weekly_sales'] = $store->orders()
                ->where('created_at', '>=', now()->subDays(7))
                ->where('status', 'completed')
                ->count();

            // Get top selling product (simplified)
            $topProduct = $store->products()
                ->where('is_active', true)
                ->orderBy('stock', 'asc') // Lower stock = more sold (simplified logic)
                ->first(['id', 'name']);
            
            if ($topProduct) {
                $storeData['top_product'] = $topProduct->toArray();
            }
        }

        $insights = $this->aiService->generateInsights($storeData);

        return response()->json([
            'success' => true,
            'insights' => $insights,
        ]);
    }

    /**
     * Get smart reply suggestions for customer messages.
     * POST /ai/smart-replies
     */
    public function getSmartReplies(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $replies = $this->aiService->getSmartReplies($request->message);

        return response()->json([
            'success' => true,
            'replies' => $replies,
        ]);
    }

    /**
     * Get bundle/upselling suggestions for products.
     * GET /ai/bundle-suggestions
     */
    public function getBundleSuggestions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'umkm') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $store = $user->store;
        $products = [];

        if ($store) {
            $products = $store->products()
                ->where('is_active', true)
                ->take(10)
                ->get(['id', 'name', 'price', 'category'])
                ->toArray();
        }

        $suggestions = $this->aiService->getBundleSuggestions($products);

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Get sentiment analysis summary for store reviews.
     * GET /ai/sentiment
     */
    public function getSentiment(Request $request): JsonResponse
    {
        // Simulated reviews for demo (in production, fetch from database)
        $reviews = [
            ['rating' => 5, 'text' => 'Enak banget, rasanya mantap!'],
            ['rating' => 4, 'text' => 'Bagus, cepat sampainya'],
            ['rating' => 3, 'text' => 'Biasa aja sih'],
            ['rating' => 5, 'text' => 'Recommended! Puas banget'],
            ['rating' => 2, 'text' => 'Agak lama pengirimannya'],
        ];

        $sentiment = $this->aiService->getSentimentSummary($reviews);

        return response()->json([
            'success' => true,
            ...$sentiment,
        ]);
    }

    /**
     * Get trending items in the area.
     * GET /ai/trending
     */
    public function getTrending(Request $request): JsonResponse
    {
        $category = $request->query('category', 'all');
        
        $trends = $this->aiService->getTrendingItems($category);

        return response()->json([
            'success' => true,
            'trends' => $trends,
        ]);
    }
}
