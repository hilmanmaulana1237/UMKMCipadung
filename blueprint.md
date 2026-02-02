MASTER PROMPT: MUDAPRENEUR.AI (LARAVEL INERTIA MONOLITH - SUPER APP EDITION)
Plaintext

ACT AS: Lead Principal Software Architect & Senior Full-Stack Engineer.
PROJECT NAME: "MUDAPRENEUR.AI"
TYPE: Progressive Web Application (PWA) / Super App Ecosystem.
TECH STACK: Laravel 11, Inertia.js (React), TypeScript, Tailwind CSS v4, MySQL.
ARCHITECTURE: Modern Monolith (Server-side Routing, Client-side Rendering).
DESIGN PHILOSOPHY: Mobile-First, Native-Like Experience (Gojek-style), Persistent Layouts.

OBJECTIVE:
Build a complete, production-ready ecosystem that connects 4 distinct user roles:
1. BUYER (Public User): Marketplace access, local history caching.
2. UMKM (Seller/Admin): Product management, AI tools, Order Verification.
3. COURIER (Logistics): "Gojek-style" job radar, navigation, and delivery handling.
4. AFFILIATOR (Marketer): Coupon generator, Fixed Commission System (Rp 1.000/trx).

---

### SECTION 1: SYSTEM CONFIGURATION & ENVIRONMENT

#### 1.1. FRAMEWORK SETUP & PACKAGES
- **Laravel 11:** Install via Composer. Use `breeze` with React/TypeScript stack.
- **Inertia.js:** Configure `HandleInertiaRequests` to share global props (Auth User, App Config, Flash Messages).
- **PWA Module:** Install `vite-plugin-pwa`. Configure `manifest.json` for "Add to Home Screen" capability (Standalone mode, Display: standalone, Theme Color: #2563EB).
- **Icons:** Use `lucide-react` for consistent iconography.
- **Maps:** Prepare integration for Google Maps / OpenStreetMap linking (Url Scheme: `geo:lat,lng`).

#### 1.2. TAILWIND CSS DESIGN SYSTEM (ROYAL BLUE THEME)
Define these strictly in `tailwind.config.js`:
- **Colors:**
  - `primary`: `#2563EB` (Royal Blue - Main Action)
  - `secondary`: `#38BDF8` (Sky Blue - Accents)
  - `success`: `#10B981` (Emerald - Money/Profit)
  - `warning`: `#F59E0B` (Amber - Alerts/Pending)
  - `danger`: `#F43F5E` (Rose - Errors/Reject)
  - `surface`: `#FFFFFF` (Card Backgrounds)
  - `background`: `#F1F5F9` (App Background - Slate 100)
- **Typography:** Font Family "Plus Jakarta Sans".
- **Safe Area:** Implement utilities for `pb-safe` and `pt-safe` for notched phones.

#### 1.3. MOBILE CONTAINER LAYOUT STRATEGY (CRITICAL)
Since this is a Web App acting as a Mobile App, structure the layout to prevent desktop stretching.

**File: `resources/js/Layouts/MobileLayout.tsx`**
```tsx
export default function MobileLayout({ children, user }: { children: ReactNode, user: User }) {
  return (
    <div className="bg-gray-200 min-h-screen flex justify-center items-start">
      {/* PHONE SIMULATOR CONTAINER */}
      <main className="w-full max-w-[480px] min-h-screen bg-slate-50 relative shadow-2xl overflow-x-hidden flex flex-col font-sans pb-24">
        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>
        {/* PERSISTENT BOTTOM NAV (Only for logged in users) */}
        {user && <BottomNavigation role={user.role} />}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}
SECTION 2: DATABASE SCHEMA & MIGRATIONS (STRICT SQL)
Create the following tables with specific columns and indexes.

2.1. users Table
id: BigInt, PK.

name: String.

email: String, Unique.

password: String.

role: Enum('buyer', 'umkm', 'courier', 'affiliator').

wa_number: String (Format: 628...).

avatar_path: String, Nullable.

wallet_balance: Decimal(15, 2), Default 0.

affiliate_code: String, Unique, Nullable (For Affiliators).

is_courier_active: Boolean, Default False (Toggle On/Off for Courier).

current_lat: Decimal(10, 8), Nullable.

current_lng: Decimal(11, 8), Nullable.

2.2. umkm_stores Table
id: BigInt, PK.

user_id: FK -> users.id.

name: String.

slug: String, Unique.

description: Text.

address_pickup: Text (Alamat pengambilan barang untuk kurir).

bank_name: String.

bank_account: String.

bank_holder: String.

qris_path: String (Image URL).

2.3. products Table
id: BigInt, PK.

umkm_store_id: FK -> umkm_stores.id.

name: String.

slug: String.

price: Decimal(12, 2).

stock: Integer.

category: Enum('kuliner', 'kriya', 'jasa').

image_path: String.

description: Text.

is_active: Boolean, Default True.

2.4. orders Table
id: BigInt, PK.

order_number: String (INV-X).

buyer_id: FK -> users.id.

umkm_store_id: FK -> umkm_stores.id.

courier_id: FK -> users.id, Nullable.

promo_code_used: String, Nullable.

status: Enum('pending_payment', 'waiting_verification', 'processing', 'ready_to_ship', 'on_delivery', 'completed', 'cancelled').

courier_status: Enum('idle', 'finding_driver', 'driver_assigned', 'pickup_otw', 'delivery_otw', 'delivered').

total_amount: Decimal(15, 2).

courier_fee: Decimal(12, 2).

payment_proof_path: String, Nullable.

shipping_address: Text.

shipping_lat: Decimal, Nullable.

shipping_lng: Decimal, Nullable.

2.5. affiliate_rewards Table
id: BigInt, PK.

affiliate_id: FK -> users.id.

order_id: FK -> orders.id.

amount: Decimal(10, 2), Default 1000.00 (Fixed Rate).

status: Enum('potential', 'verified', 'paid').

potential: Order created using code.

verified: UMKM accepted order (Money Safe).

paid: Money moved to wallet.

SECTION 3: ROLE-SPECIFIC BUSINESS LOGIC & FLOWS
3.1. ROLE: BUYER (The Simple Consumer)
Access: Direct access to Marketplace Index.

Local Storage Logic (Client-Side):

Implement a React Hook useLocalStorageHistory on the Client.

When User visits OrderSuccess page, save the order_id, date, and total to LocalStorage.

On "Profile" page, read this LocalStorage to show "Riwayat Belanja" even if offline/API slow.

Checkout Flow:

Step 1: Cart -> Checkout.

Step 2: Input "Kode Promo" (Optional).

AJAX Check: Is code valid? If yes, show toast: "Hore! Anda berhemat & membantu teman."

Step 3: Payment -> Upload Proof.

Step 4: Redirect to Status Page.

3.2. ROLE: UMKM (The Verifier & Creator)
Dashboard:

"Pesanan Masuk" (Pending Verification).

"Perlu Dikirim" (Processing).

Verification Logic (CRITICAL):

UMKM opens Order Detail -> Views Proof Image.

Clicks [Terima Pesanan].

BACKEND EVENT:

Update Order Status -> processing.

Check promo_code_used. If exists -> Update affiliate_rewards status from potential to verified.

Product Management:

Standard CRUD.

AI Button: "Generate Deskripsi". Calls OpenAI API to create text based on Product Name.

3.3. ROLE: KURIR (The "Gojek" Experience)
Switch: Toggle is_courier_active.

View A: Job Radar (Idle Mode):

Query: Get all orders where status = 'ready_to_ship' AND courier_id IS NULL.

UI: List of Cards showing "Jarak Jemput", "Komisi Ongkir", "Rute (Toko -> Buyer)".

Action: [Ambil Order] -> Calls CourierController@acceptJob.

View B: Active Trip (On Duty Mode):

State 1: "Menuju Toko" -> Show Map Button (Navigate to Store).

Action: [Barang Sudah Diambil] -> Update courier_status = 'delivery_otw'.

State 2: "Mengantar ke Pembeli" -> Show Map Button (Navigate to Buyer).

Action: [Selesaikan Pengiriman] (Swipe Component).

Update Order Status -> completed.

Update courier_status -> delivered.

Trigger: Move Affiliate Reward from verified to paid (Wallet += 1000).

3.4. ROLE: AFFILIATOR (The Marketer)
Coupon Generator:

Simple Form: Input "Desired Code" (e.g. "BERKAHRAMADHAN").

Save to users.affiliate_code.

Dashboard Stats:

"Kode Dipakai": Count of orders with this code.

"Komisi Cair": Sum of rewards with status paid.

"Potensi": Sum of rewards with status potential or verified.

SECTION 4: CONTROLLER LOGIC SPECIFICATIONS (PHP)
4.1. CheckoutController@store
PHP

public function store(Request $request) {
    // 1. Validate & Store Image
    $path = $request->file('proof')->store('proofs', 'public');

    // 2. Create Order
    $order = Order::create([
        'buyer_id' => auth()->id(),
        'status' => 'waiting_verification',
        'payment_proof_path' => $path,
        'promo_code_used' => $request->promo_code, // Save the code used
        // ... other fields
    ]);

    // 3. Register Potential Affiliate Reward
    if ($request->promo_code) {
        $affiliator = User::where('affiliate_code', $request->promo_code)->first();
        if ($affiliator) {
            AffiliateReward::create([
                'affiliate_id' => $affiliator->id,
                'order_id' => $order->id,
                'amount' => 1000, // FIXED RATE RP 1000
                'status' => 'potential' // Not money yet, waiting for UMKM
            ]);
        }
    }
}
4.2. UmkmOrderController@verify
PHP

public function verify(Order $order) {
    $order->update(['status' => 'processing']);

    // Trigger Reward Update
    $reward = AffiliateReward::where('order_id', $order->id)->first();
    if ($reward) {
        $reward->update(['status' => 'verified']); // Now it is confirmed valid
    }

    return back()->with('success', 'Pesanan diterima! Komisi affiliator tercatat.');
}
4.3. CourierController@complete
PHP

public function complete(Order $order) {
    DB::transaction(function() use ($order) {
        // 1. Update Order
        $order->update(['status' => 'completed', 'courier_status' => 'delivered']);

        // 2. Pay Courier (Logic to add wallet balance to courier if needed)

        // 3. Pay Affiliator (Release the 1000 Rupiah)
        $reward = AffiliateReward::where('order_id', $order->id)->where('status', 'verified')->first();
        if ($reward) {
            $reward->update(['status' => 'paid']);
            $reward->affiliator->increment('wallet_balance', 1000);
        }
    });

    return to_route('courier.dashboard')->with('success', 'Pekerjaan Selesai!');
}
SECTION 5: UI COMPONENT SPECIFICATIONS (REACT)
5.1. SwipeButton.tsx (For Courier)
A custom component mimicking "Swipe to Unlock".

Props: onSuccess: () => void, label: string.

UI: A container with a draggable handle.

Logic: Use framer-motion drag="x". If drag > 90% width, trigger onSuccess.

5.2. JobCard.tsx (For Courier Radar)
Visual:

Header: "Jemput: [Nama Toko]" (Bold).

Body: "Antar ke: [Alamat Singkat Buyer]".

Footer: "Jarak: 2.5km" | "Fee: Rp 10.000".

Action: Large Button [AMBIL ORDER].

5.3. BottomNavigation.tsx
Dynamic Items based on Role:

Buyer: Home, Search, History, Profile.

UMKM: Dashboard, Produk, Order(Badge), Profile.

Courier: Radar, Active Trip, Wallet, Profile.

Affiliate: Dashboard, Share Link, Wallet, Profile.

Styling: Fixed bottom, Glassmorphism (backdrop-blur-md), Active state styling (text-blue-600).

SECTION 6: IMPLEMENTATION ROADMAP
Follow this sequence strictly to ensure dependencies are met.

STEP 1: SCAFFOLDING & DATABASE

Install Laravel + Breeze (React).

Create Migrations for all 5 tables (Users, Stores, Products, Orders, Rewards).

Run Migrations.

STEP 2: AUTHENTICATION & ROLES

Modify RegisteredUserController to accept role input during registration.

Create Middleware RoleCheck.

STEP 3: UMKM CORE (The Foundation)

Build Store Setup Page.

Build Product CRUD.

Build Order Verification Page (This is needed before Courier/Affiliate logic can work).

STEP 4: BUYER & CHECKOUT

Build Marketplace Index.

Build Checkout Form with "Promo Code" input.

Build Payment Proof Upload.

STEP 5: AFFILIATE SYSTEM

Build Logic to generate Affiliate Code.

Implement the "Rp 1000" Trigger in UmkmOrderController.

STEP 6: COURIER SYSTEM (The Complex Part)

Build the "Radar" Page (Querying ready orders).

Build the "Active Trip" Page (State management: Pickup -> Delivery).

Implement the SwipeButton and completion logic.

STEP 7: POLISHING

Add "Empty States" (Illustrations when no data).

Ensure "Mobile Container" CSS is applied globally in app.tsx.

Start by generating the Migrations and the User Model adjustments.


***

### **Panduan Menggunakan Prompt Ini:**

1.  **Simpan prompt ini** sebagai referensi utama.
2.  **Berikan kepada AI** (Cursor/ChatGPT) secara utuh.
3.  Biarkan AI mulai bekerja dari **Step 1 (Scaffolding)**.
4.  Jika AI selesai satu tahap, minta lanjut ke tahap berikutnya: *"Lanjutkan ke Step 2"*.

Prompt ini sudah menjamin bahwa **logika Rp 1.000** dan **logika Gojek** tidak akan t