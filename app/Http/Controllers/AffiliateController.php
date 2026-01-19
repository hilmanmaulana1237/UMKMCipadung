<?php

namespace App\Http\Controllers;

use App\Models\AffiliateReward;
use App\Models\Promo;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AffiliateController extends Controller
{
    /**
     * Show affiliate dashboard with stats.
     */
    public function dashboard()
    {
        $user = auth()->user();

        $stats = [
            'codeUsed' => AffiliateReward::where('affiliate_id', $user->id)->count(),
            'potentialEarnings' => AffiliateReward::where('affiliate_id', $user->id)
                ->whereIn('status', ['potential', 'verified'])
                ->sum('amount'),
            'paidEarnings' => AffiliateReward::where('affiliate_id', $user->id)
                ->where('status', 'paid')
                ->sum('amount'),
            'walletBalance' => $user->wallet_balance,
        ];

        $recentRewards = AffiliateReward::where('affiliate_id', $user->id)
            ->with('order')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('affiliate/dashboard', [
            'affiliateCode' => $user->affiliate_code,
            'stats' => $stats,
            'recentRewards' => $recentRewards,
        ]);
    }

    /**
     * Show coupon generator page.
     */
    public function share()
    {
        $user = auth()->user();

        return Inertia::render('affiliate/share', [
            'affiliateCode' => $user->affiliate_code,
        ]);
    }

    /**
     * Generate or update affiliate code.
     */
    public function generateCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|min:4|max:20|alpha_num|unique:users,affiliate_code,' . auth()->id(),
        ]);

        $user = auth()->user();
        $user->update([
            'affiliate_code' => strtoupper($validated['code']),
        ]);

        return back()->with('success', 'Kode promo berhasil dibuat: ' . strtoupper($validated['code']));
    }

    /**
     * Validate a promo code (AJAX endpoint for checkout).
     */
    public function validateCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $affiliator = \App\Models\User::where('affiliate_code', strtoupper($validated['code']))->first();

        if (!$affiliator) {
            // Check if it is a generic Promo Code
            $promo = Promo::where('code', strtoupper($validated['code']))
                ->where('is_active', true)
                ->first();

            if ($promo) {
                if ($promo->used_count >= $promo->quota) {
                    return response()->json([
                        'valid' => false,
                        'message' => 'Kuota promo habis.',
                    ]); 
                }
                
                $message = $promo->type === 'free_shipping' 
                    ? 'Promo Gratis Ongkir diterapkan!' 
                    : 'Diskon Rp ' . number_format($promo->value, 0, ',', '.') . ' diterapkan!';

                return response()->json([
                    'valid' => true,
                    'message' => $message,
                    'promo_type' => $promo->type,
                    'promo_value' => $promo->value,
                ]);
            }

            return response()->json([
                'valid' => false,
                'message' => 'Kode promo tidak ditemukan.',
            ]);
        }

        if ($affiliator->id === auth()->id()) {
            return response()->json([
                'valid' => false,
                'message' => 'Tidak dapat menggunakan kode promo sendiri.',
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Hore! Anda berhemat & membantu teman.',
            'affiliator_name' => $affiliator->name,
        ]);
    }
}
