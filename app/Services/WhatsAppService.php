<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?string $apiToken;
    protected bool $enabled;

    public function __construct()
    {
        $this->apiToken = Setting::get('fonnte_api_token');
        // Settings are stored as string 'true'/'false', convert properly
        $enabledValue = Setting::get('whatsapp_notifications_enabled', 'false');
        $this->enabled = $enabledValue === 'true' || $enabledValue === true;
        
        Log::debug('WhatsAppService initialized', [
            'has_token' => !empty($this->apiToken),
            'enabled' => $this->enabled,
        ]);
    }

    /**
     * Send WhatsApp message via Fonnte API
     */
    public function sendMessage(string $phone, string $message, int $delay = 0): array
    {
        if (!$this->enabled || !$this->apiToken) {
            Log::info('WhatsApp notification skipped', [
                'enabled' => $this->enabled,
                'has_token' => !empty($this->apiToken),
            ]);
            return ['success' => false, 'reason' => 'disabled'];
        }

        // Normalize phone number (remove leading 0, add 62)
        $phone = $this->normalizePhone($phone);

        if (!$phone) {
            Log::warning('WhatsApp: Invalid phone number');
            return ['success' => false, 'reason' => 'invalid_phone'];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->apiToken,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $message,
                'delay' => $delay,
                'countryCode' => '62',
            ]);

            $result = $response->json();
            
            Log::info('WhatsApp sent', [
                'phone' => $phone,
                'status' => $result['status'] ?? 'unknown',
            ]);

            return [
                'success' => ($result['status'] ?? false) === true,
                'response' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp send error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Notify seller when new order arrives
     */
    public function notifySellerNewOrder(Order $order): array
    {
        $order->load(['store', 'buyer', 'items.product']);
        
        $store = $order->store;
        if (!$store || !$store->contact_number) {
            Log::info('WhatsApp: Seller has no contact number', ['store_id' => $store?->id]);
            return ['success' => false, 'reason' => 'no_seller_phone'];
        }

        // Build personalized message with order details (NO EMOJI - causes Fonnte API issues)
        $itemsList = '';
        foreach ($order->items as $item) {
            $itemsList .= "- {$item->product->name} x{$item->quantity} - Rp " . number_format($item->price * $item->quantity, 0, ',', '.') . "\n";
        }

        $message = "*PESANAN BARU!*\n\n";
        $message .= "Halo kak {$store->name}, ada pesanan masuk!\n\n";
        $message .= "*Order:* #{$order->order_number}\n";
        $message .= "*Pembeli:* {$order->buyer->name}\n";
        $message .= "*Alamat:* {$order->shipping_address}\n";
        $message .= "*Total:* Rp " . number_format($order->total_amount, 0, ',', '.') . "\n\n";
        $message .= "*Detail Pesanan:*\n{$itemsList}\n";
        $message .= "Segera cek aplikasi untuk verifikasi!\n\n";
        $message .= "---\n_Pesan otomatis dari CipadungMart_";

        return $this->sendMessage($store->contact_number, $message);
    }

    /**
     * Normalize Indonesian phone number
     * - Remove leading 0, replace with 62
     * - Handle +62 prefix
     */
    private function normalizePhone(string $phone): ?string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (empty($phone)) {
            return null;
        }

        // If starts with 0, replace with 62
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        // If doesn't start with 62, add it
        if (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }

        // Basic validation: Indonesian numbers should be 10-15 digits
        if (strlen($phone) < 10 || strlen($phone) > 15) {
            return null;
        }

        return $phone;
    }
}
