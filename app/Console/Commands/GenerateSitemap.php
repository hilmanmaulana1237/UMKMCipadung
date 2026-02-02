<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\UmkmStore;
use App\Models\Product;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml for SEO';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting sitemap generation...');

        $sitemap = Sitemap::create();

        // 1. Static Pages
        $this->info('Adding static pages...');
        $sitemap->add(Url::create('/')->setPriority(1.0)->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        $sitemap->add(Url::create('/marketplace')->setPriority(0.9)->setChangeFrequency(Url::CHANGE_FREQUENCY_HOURLY));
        $sitemap->add(Url::create('/login')->setPriority(0.5));
        $sitemap->add(Url::create('/register')->setPriority(0.5));

        // 2. Dynamic Stores
        $this->info('Adding stores...');
        $stores = UmkmStore::all(); // In real app, maybe filter active only
        foreach ($stores as $store) {
            // Assuming routes are like /marketplace/store/{id} or {slug}
            // Based on checking marketplace/store.tsx logic, check routes file later.
            // For now using /marketplace/store/{id} as placeholder, will refine if needed.
            $sitemap->add(Url::create("/marketplace/store/{$store->id}")
                ->setPriority(0.8)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY));
        }

        // 3. Dynamic Products
        $this->info('Adding products...');
        $products = Product::where('is_active', true)->get();
        foreach ($products as $product) {
             // Assuming routes are like /marketplace/product/{id}
            $sitemap->add(Url::create("/marketplace/product/{$product->id}")
                ->setPriority(0.7)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY));
        }

        $path = public_path('sitemap.xml');
        $sitemap->writeToFile($path);

        $this->info("Sitemap generated successfully at: {$path}");
    }
}
