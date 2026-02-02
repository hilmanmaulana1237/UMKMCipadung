<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplaintController extends Controller
{
    /**
     * Show the complaint form for an order.
     */
    public function create(Order $order)
    {
        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        $order->load(['store', 'courier', 'items.product']);

        return Inertia::render('complaints/create', [
            'order' => $order,
        ]);
    }

    /**
     * Store a new complaint.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'type' => 'required|in:product_quality,delivery,seller,courier,other',
            'description' => 'required|string|min:10|max:1000',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        // Check if complaint already exists for this order
        $existingComplaint = Complaint::where('user_id', auth()->id())
            ->where('order_id', $order->id)
            ->first();

        if ($existingComplaint) {
            return back()->withErrors(['order_id' => 'Anda sudah pernah mengajukan keluhan untuk pesanan ini.']);
        }

        Complaint::create([
            'user_id' => auth()->id(),
            'order_id' => $order->id,
            'type' => $validated['type'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        return redirect()->route('complaints.index')
            ->with('success', 'Keluhan Anda telah dikirim. Tim kami akan meninjau dalam 1-3 hari kerja.');
    }

    /**
     * Show list of user's complaints.
     */
    public function index()
    {
        $complaints = Complaint::with(['order.store'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('complaints/index', [
            'complaints' => $complaints,
        ]);
    }

    /**
     * Show a specific complaint.
     */
    public function show(Complaint $complaint)
    {
        if ($complaint->user_id !== auth()->id()) {
            abort(403);
        }

        $complaint->load(['order.store', 'order.courier', 'order.items.product']);

        return Inertia::render('complaints/show', [
            'complaint' => $complaint,
        ]);
    }
}
