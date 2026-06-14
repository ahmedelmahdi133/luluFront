import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'lulu_cart';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) return prev;
                return prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                _id: product._id,
                name: product.name,
                sellingPrice: product.sellingPrice,
                image: product.image,
                stockQuantity: product.stockQuantity,
                quantity: 1
            }];
        });
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item._id === id ? { ...item, quantity } : item
            )
        );
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item._id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
