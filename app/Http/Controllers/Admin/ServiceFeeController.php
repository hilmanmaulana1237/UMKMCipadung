<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\UmkmStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceFeeController extends Controller
{
    /**
     * Display service fee monitoring dashboard.
     */
    public function index()
    {
        // Aggregate unbilled orders per Store
        $unbilledFees = Order::query()
            ->select(
                'umkm_store_id',
                DB::raw('SUM(admin_fee) as total_unbilled'),
                DB::raw('COUNT(id) as order_count')
            )
            ->where('status', 'completed') // Only completed orders
            ->where('admin_fee_status', 'pending')
            ->where('admin_fee', '>', 0)
            ->groupBy('umkm_store_id')
            ->with('store:id,name,bank_name,bank_account,bank_holder')
            ->get();

        return Inertia::render('admin/service-fees/index', [
            'fees' => $unbilledFees
        ]);
    }

    /**
     * Mark fees as billed (e.g. after generating an invoice or collecting payment).
     */
    public function markAsBilled(Request $request, UmkmStore $store)
    {
        Order::where('umkm_store_id', $store->id)
            ->where('status', 'completed')
            ->where('admin_fee_status', 'pending')
            ->update([
                'admin_fee_status' => 'billed'
            ]);

        return back()->with('success', 'Tagihan untuk ' . $store->name . ' berhasil dibuat (Status: Billed).');
    }
}
