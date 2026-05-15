import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// User role - only UMKM/seller
export type UserRole = 'umkm' | 'admin';

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
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// UMKM Store (simplified)
export interface UmkmStore {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    description?: string;
    address_pickup?: string;
    profile_photo_path?: string;
    owner?: User;
    created_at: string;
    updated_at: string;
}

// AI Content types
export interface AIContentStat {
    totalVideos: number;
    totalPosters: number;
    totalChats: number;
}
