import { useState, useEffect } from 'react';

interface HistoryItem {
    id: number;
    name: string;
    image?: string;
    price: number;
    store?: string;
    timestamp: number;
}

const STORAGE_KEY = 'mudapreneur_view_history';
const MAX_ITEMS = 10;

export function useLocalStorageHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Error loading history:', e);
        }
    }, []);

    // Save to localStorage whenever history changes
    const saveHistory = (items: HistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            setHistory(items);
        } catch (e) {
            console.error('Error saving history:', e);
        }
    };

    // Add item to history
    const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
        const newItem: HistoryItem = {
            ...item,
            timestamp: Date.now(),
        };

        // Remove duplicate if exists
        const filtered = history.filter((h) => h.id !== item.id);

        // Add new item at the beginning and limit to MAX_ITEMS
        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
        saveHistory(updated);
    };

    // Clear history
    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setHistory([]);
    };

    // Remove single item
    const removeFromHistory = (id: number) => {
        const updated = history.filter((h) => h.id !== id);
        saveHistory(updated);
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
    };
}

// Cart storage hook for checkout
interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    storeId: number;
    storeName: string;
    storeQris?: string;
    storeQrisHandle?: string;
    storeBankName?: string;
    storeBankAccount?: string;
    storeBankHolder?: string;
    stock?: number;
}

const CART_KEY = 'mudapreneur_cart';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(CART_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCart(parsed);
                } else {
                    console.warn('Corrupted cart data found, resetting.');
                    setCart([]);
                }
            }
        } catch (e) {
            console.error('Error loading cart:', e);
        }
    }, []);

    const saveCart = (items: CartItem[]) => {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(items));
            setCart(items);
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    };

    const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
        const existing = cart.find((c) => c.productId === item.productId);

        if (existing) {
            const updated = cart.map((c) =>
                c.productId === item.productId
                    ? { ...c, quantity: c.quantity + quantity }
                    : c
            );
            saveCart(updated);
        } else {
            saveCart([...cart, { ...item, quantity }]);
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const updated = cart.map((c) =>
            c.productId === productId ? { ...c, quantity } : c
        );
        saveCart(updated);
    };

    const removeFromCart = (productId: number) => {
        const updated = cart.filter((c) => c.productId !== productId);
        saveCart(updated);
    };

    const clearCart = () => {
        localStorage.removeItem(CART_KEY);
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getItemCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    // Get cart items grouped by store
    const getByStore = () => {
        const grouped: Record<number, { storeName: string; items: CartItem[] }> = {};
        if (Array.isArray(cart)) {
            cart.forEach((item) => {
                if (!grouped[item.storeId]) {
                    grouped[item.storeId] = { storeName: item.storeName, items: [] };
                }
                grouped[item.storeId].items.push(item);
            });
        }
        return grouped;
    };

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getItemCount,
        getByStore,
    };
}
