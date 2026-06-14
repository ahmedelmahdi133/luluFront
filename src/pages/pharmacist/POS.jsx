import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PHARMACY_NAME } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import PaymentModal from '../../components/pos/PaymentModal';
import HoldOrdersModal from '../../components/pos/HoldOrdersModal';
import ThermalReceipt from '../../components/pos/ThermalReceipt';
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaPause, FaList, FaTachometerAlt, FaPrint, FaSignOutAlt, FaClock, FaPills, FaKeyboard } from 'react-icons/fa';

// Load held orders from localStorage
const loadHeldOrders = () => {
    try {
        const saved = localStorage.getItem('pos_held_orders');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

const POS = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const searchInputRef = useRef(null);
    const receiptRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [cart, setCart] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [heldOrders, setHeldOrders] = useState(loadHeldOrders);
    const [showHeld, setShowHeld] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [currentShift, setCurrentShift] = useState(null);
    const [todaySales, setTodaySales] = useState({ totalSales: 0, totalOrders: 0 });

    // Persist held orders
    useEffect(() => {
        localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
    }, [heldOrders]);

    const fetchProducts = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            const res = await api.get(`/products?${params}`);
            setProducts(res.data.data.filter(p => p.stockQuantity > 0));
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    }, [keyword, navigate]);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 250);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    useEffect(() => {
        searchInputRef.current?.focus();
        api.get('/categories').then(r => setCategories(r.data.data)).catch(() => {});
        api.get('/shifts/current').then(r => setCurrentShift(r.data.data)).catch(() => {});
        api.get('/orders/today-sales').then(r => setTodaySales(r.data.data)).catch(() => {});
    }, []);

    const handlePrint = useReactToPrint({ contentRef: receiptRef });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F12') { e.preventDefault(); if (cart.length > 0) setShowPayment(true); }
            if (e.key === 'F5') { e.preventDefault(); holdOrder(); }
            if (e.key === 'F6') { e.preventDefault(); setShowHeld(true); }
            if (e.key === 'Escape') {
                if (showPayment) { setShowPayment(false); return; }
                if (showHeld) { setShowHeld(false); return; }
                setCart([]); setKeyword(''); searchInputRef.current?.focus();
            }
            if (e.key === 'F1') { e.preventDefault(); searchInputRef.current?.focus(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    const getProductId = (p) => p.id || p._id;

    const addToCart = (product) => {
        const pid = getProductId(product);
        const existing = cart.find(item => getProductId(item) === pid);
        if (existing) {
            if (existing.quantity >= product.stockQuantity) {
                toast.error(`Available: ${product.stockQuantity} only`);
                return;
            }
            setCart(cart.map(item => getProductId(item) === pid ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setKeyword('');
        searchInputRef.current?.focus();
    };

    const updateCartItem = (id, qty) => {
        if (qty <= 0) { setCart(cart.filter(i => getProductId(i) !== id)); return; }
        const p = products.find(p => getProductId(p) === id) || cart.find(i => getProductId(i) === id);
        if (p && qty > p.stockQuantity) { toast.error('Quantity not available'); return; }
        setCart(cart.map(i => getProductId(i) === id ? { ...i, quantity: qty } : i));
    };

    const subtotal = cart.reduce((t, i) => t + i.sellingPrice * i.quantity, 0);

    const holdOrder = () => {
        if (cart.length === 0) return;
        setHeldOrders([...heldOrders, {
            items: cart.map(i => ({ ...i })),
            total: subtotal,
            timestamp: Date.now()
        }]);
        setCart([]);
        toast.success('Order held');
        searchInputRef.current?.focus();
    };

    const recallOrder = (index) => {
        if (cart.length > 0) holdOrder();
        setCart(heldOrders[index].items);
        setHeldOrders(heldOrders.filter((_, i) => i !== index));
        setShowHeld(false);
        toast.success('Order recalled');
    };

    const deleteHeld = (index) => {
        setHeldOrders(heldOrders.filter((_, i) => i !== index));
    };

    const handleCheckout = async (paymentData) => {
        try {
            const body = {
                orderType: 'POS',
                paymentMethod: paymentData.paymentMethod,
                paidAmount: paymentData.paidAmount,
                orderItems: cart.map(i => ({ productId: getProductId(i), quantity: i.quantity })),
            };
            if (paymentData.discount) body.discount = paymentData.discount;
            if (paymentData.splitPayment) body.splitPayment = paymentData.splitPayment;

            const res = await api.post('/orders', body);
            setLastOrder(res.data.data);
            setShowPayment(false);
            setCart([]);
            fetchProducts();

            setTodaySales(prev => ({
                totalSales: prev.totalSales + res.data.data.totalAmount,
                totalOrders: prev.totalOrders + 1
            }));

            const change = Math.max(0, (paymentData.paidAmount || 0) - paymentData.finalTotal);
            if (paymentData.paymentMethod === 'pending') {
                toast.success('Invoice saved as pending', { duration: 4000 });
            } else {
                toast.success(`Done — Change: ${change.toFixed(2)} AED`, { duration: 4000 });
            }

            setTimeout(() => {
                if (receiptRef.current) handlePrint();
            }, 300);

            searchInputRef.current?.focus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filteredProducts = activeCategory
        ? products.filter(p => p.categoryId === activeCategory || p.categoryId?.id === activeCategory || p.categoryId?._id === activeCategory)
        : products;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg-body)', fontFamily: 'var(--font-family)' }}>
            <div style={{ display: 'none' }}>
                <ThermalReceipt ref={receiptRef} order={lastOrder} pharmacistName={user?.name} />
            </div>

            {/* ===== Products Area ===== */}
            <div style={{ flex: 7, display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
                {/* Top Bar */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaPills size={16} color="white" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
                            {PHARMACY_NAME}
                        </h2>
                        {currentShift && (
                            <span className="badge badge-success badge-dot" style={{ fontSize: 'var(--font-size-xs)' }}>
                                Shift Open
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="card" style={{ padding: 'var(--space-2) var(--space-4)', textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Today Sales</div>
                            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                                {formatCurrency(todaySales.totalSales || 0)}
                            </div>
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-icon" title="Dashboard" style={{ color: 'var(--color-text-secondary)' }}>
                            <FaTachometerAlt size={16} />
                        </button>
                        <button onClick={handleLogout} className="btn btn-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }} title="Logout">
                            <FaSignOutAlt size={16} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        ref={searchInputRef} type="text"
                        placeholder="Scan barcode or type product name... (F1)"
                        value={keyword} onChange={e => setKeyword(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: 44, fontSize: 'var(--font-size-lg)', padding: '14px 14px 14px 44px' }}
                    />
                </div>

                {/* Category Tabs */}
                {categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setActiveCategory('')}
                            className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-outline'}`}>
                            All
                        </button>
                        {categories.map(c => (
                            <button key={c.id || c._id} onClick={() => setActiveCategory(c.id || c._id)}
                                className={`btn btn-sm ${activeCategory === (c.id || c._id) ? 'btn-primary' : 'btn-outline'}`}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Products Table */}
                <div className="data-table-wrapper" style={{ flex: 1, overflow: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th style={{ width: 120 }}>Barcode</th>
                                <th style={{ width: 80 }}>Price</th>
                                <th style={{ width: 70 }}>Stock</th>
                                <th style={{ width: 60 }}>Add</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-muted)' }}>No products found</td></tr>
                            ) : filteredProducts.map(product => (
                                <tr key={getProductId(product)} onClick={() => addToCart(product)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="cell-bold">{product.name}</div>
                                        {product.scientificName && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 1 }}>{product.scientificName}</div>}
                                    </td>
                                    <td className="cell-mono">{product.barcode}</td>
                                    <td className="cell-success">{product.sellingPrice}</td>
                                    <td>
                                        <span className={`badge ${product.stockQuantity < (product.minStockAlert || 10) ? 'badge-danger' : 'badge-success'}`}>
                                            {product.stockQuantity}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            className="btn btn-primary btn-icon-sm"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="flex gap-4 items-center" style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-bg-muted)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                }}>
                    <FaKeyboard size={12} />
                    <span><kbd style={kbdStyle}>F1</kbd> Search</span>
                    <span><kbd style={kbdStyle}>F5</kbd> Hold</span>
                    <span><kbd style={kbdStyle}>F6</kbd> Held Orders</span>
                    <span><kbd style={kbdStyle}>F12</kbd> Pay</span>
                    <span><kbd style={kbdStyle}>Esc</kbd> Clear</span>
                </div>
            </div>

            {/* ===== Cart Panel ===== */}
            <div style={{
                flex: 3, backgroundColor: 'var(--color-bg-card)', display: 'flex', flexDirection: 'column',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.06)', minWidth: 340,
                borderLeft: '1px solid var(--color-border-light)',
            }}>
                {/* Cart Header */}
                <div style={{
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                    color: 'white',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                        Invoice ({cart.length})
                    </h3>
                    <div className="flex gap-1">
                        <button onClick={holdOrder} title="Hold (F5)" style={cartActionBtnStyle} disabled={cart.length === 0}><FaPause size={13} /></button>
                        <button onClick={() => setShowHeld(true)} title="Held Orders (F6)" style={{ ...cartActionBtnStyle, position: 'relative' }}>
                            <FaList size={13} />
                            {heldOrders.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: -4, right: -4,
                                    backgroundColor: 'var(--color-warning)', color: '#000',
                                    borderRadius: '50%', width: 16, height: 16,
                                    fontSize: 10, display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontWeight: 'var(--font-weight-bold)',
                                }}>{heldOrders.length}</span>
                            )}
                        </button>
                        {lastOrder && (
                            <button onClick={() => handlePrint()} title="Reprint" style={cartActionBtnStyle}><FaPrint size={13} /></button>
                        )}
                        <button onClick={() => { setCart([]); searchInputRef.current?.focus(); }} title="Clear (Esc)" style={cartActionBtnStyle}><FaTrash size={13} /></button>
                    </div>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>
                    {cart.length === 0 ? (
                        <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                            <FaShoppingCart size={48} style={{ opacity: 0.15, marginBottom: 'var(--space-4)' }} />
                            <div className="empty-state-title">Cart is empty</div>
                            <div className="empty-state-desc">Scan a barcode or click a product to add it</div>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={getProductId(item)} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border-light)',
                            }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="truncate" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-md)' }}>{item.name}</div>
                                    <div style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)', marginTop: 2 }}>
                                        {(item.sellingPrice * item.quantity).toFixed(2)} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-muted)' }}>AED</span>
                                    </div>
                                </div>
                                <div className="flex items-center" style={{ background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', padding: 3 }}>
                                    <button onClick={() => updateCartItem(getProductId(item), item.quantity + 1)} style={qtyBtnStyle}><FaPlus size={9} /></button>
                                    <span style={{ margin: '0 10px', fontWeight: 'var(--font-weight-bold)', minWidth: 20, textAlign: 'center', fontSize: 'var(--font-size-md)' }}>{item.quantity}</span>
                                    <button onClick={() => updateCartItem(getProductId(item), item.quantity - 1)}
                                        style={{ ...qtyBtnStyle, color: item.quantity === 1 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                                        {item.quantity === 1 ? <FaTrash size={9} /> : <FaMinus size={9} />}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div style={{
                    padding: 'var(--space-4) var(--space-5)',
                    background: 'var(--color-bg-muted)',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    <div className="flex justify-between" style={{
                        fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-extrabold)',
                        color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)',
                    }}>
                        <span>Total</span>
                        <span>{subtotal.toFixed(2)} <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-normal)' }}>AED</span></span>
                    </div>
                    <button
                        onClick={() => setShowPayment(true)}
                        disabled={cart.length === 0}
                        className={`btn btn-lg w-full ${cart.length === 0 ? '' : 'btn-success'}`}
                        style={{
                            fontSize: 'var(--font-size-xl)',
                            ...(cart.length === 0 && { background: 'var(--color-bg-active)', color: 'var(--color-text-muted)', cursor: 'not-allowed' })
                        }}
                    >
                        {cart.length === 0 ? 'Cart is empty' : 'Pay (F12)'}
                    </button>
                </div>
            </div>

            <PaymentModal
                isOpen={showPayment}
                totalAmount={subtotal}
                subtotal={subtotal}
                onConfirm={handleCheckout}
                onClose={() => setShowPayment(false)}
            />
            <HoldOrdersModal
                isOpen={showHeld}
                heldOrders={heldOrders}
                onRecall={recallOrder}
                onDelete={deleteHeld}
                onClose={() => setShowHeld(false)}
            />
        </div>
    );
};

const kbdStyle = {
    display: 'inline-block',
    padding: '1px 6px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-semibold)',
    boxShadow: '0 1px 0 var(--color-border)',
};

const cartActionBtnStyle = {
    padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
    border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background var(--transition-fast)',
};

const qtyBtnStyle = {
    width: 28, height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center',
    border: 'none', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', boxShadow: 'var(--shadow-xs)', transition: 'all var(--transition-fast)',
};

export default POS;
