import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// User role types
export type UserRole = 'buyer' | 'umkm' | 'courier' | 'affiliator';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_path?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: UserRole;
    wa_number?: string;
    phone?: string;
    wallet_balance: number;
    affiliate_code?: string;
    is_courier_active: boolean;
    current_lat?: number;
    current_lng?: number;
    is_suspended?: boolean;
    created_at: string;
    updated_at: string;
    // Courier rating stats (for courier users)
    courier_average_rating?: number;
    courier_total_ratings?: number;
    [key: string]: unknown;
}

// UMKM Store
export interface UmkmStore {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    description?: string;
    address_pickup: string;
    // Location & Contact
    latitude?: string;
    longitude?: string;
    contact_number?: string;
    banner_path?: string;
    profile_photo_path?: string;
    store_photo_path?: string;
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
    qris_path?: string;
    qris_handle?: string;
    admin_fee?: number;
    is_open_today?: boolean;
    open_time?: string;
    close_time?: string;
    operating_days?: string[];
    is_open?: boolean; // Computed: is currently open based on time
    owner?: User;
    review_stats?: ReviewStats;
    // Star rating stats
    average_rating?: number;
    total_ratings?: number;
    created_at: string;
    updated_at: string;
}

// Product
export type ProductTypeCategory = 'kuliner' | 'kriya' | 'jasa';

export interface ProductMenuCategory {
    id: number;
    umkm_store_id: number;
    name: string;
    sort_order: number;
    products_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    umkm_store_id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    is_physical: boolean;
    category: ProductTypeCategory;
    product_category_id?: number;
    product_category?: ProductMenuCategory;
    image_path?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    store?: UmkmStore;
}

// Order Status
export type OrderStatus =
    | 'pending_payment'
    | 'waiting_verification'
    | 'processing'
    | 'ready_to_ship'
    | 'on_delivery'
    | 'completed'
    | 'cancelled';

export type CourierStatus =
    | 'idle'
    | 'finding_driver'
    | 'driver_assigned'
    | 'pickup_otw'
    | 'delivery_otw'
    | 'delivered'
    | 'not_required';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product?: Product;
}

export interface Order {
    id: number;
    order_number: string;
    buyer_id: number;
    umkm_store_id: number;
    courier_id?: number;
    promo_code_used?: string;
    status: OrderStatus;
    courier_status: CourierStatus;
    total_amount: number;
    courier_fee: number;
    admin_fee?: number;
    store_fee?: number;
    shipping_discount?: number;
    payment_proof_path?: string;
    shipping_address: string;
    shipping_lat?: number;
    shipping_lng?: number;
    is_digital_order?: boolean;
    created_at: string;
    updated_at: string;
    buyer?: User;
    store?: UmkmStore;
    courier?: User;
    items?: OrderItem[];
    review?: StoreReview;
}

// Affiliate Reward
export type AffiliateRewardStatus = 'potential' | 'verified' | 'paid';

export interface AffiliateReward {
    id: number;
    affiliate_id: number;
    order_id: number;
    amount: number;
    status: AffiliateRewardStatus;
    created_at: string;
    updated_at: string;
    affiliator?: User;
    order?: Order;
}

// Store Review
export type ReviewSentiment = 'positive' | 'negative';

export interface StoreReview {
    id: number;
    umkm_store_id: number;
    user_id: number;
    order_id: number;
    sentiment: ReviewSentiment;
    comment?: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface ReviewStats {
    positive_count: number;
    negative_count: number;
}

// Star Rating
export interface Rating {
    id: number;
    order_id: number;
    user_id: number;
    target_type: 'courier' | 'store';
    target_id: number;
    stars: number;
    comment?: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface RatingStats {
    average_rating: number;
    total_ratings: number;
}

