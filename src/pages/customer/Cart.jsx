import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaPills } from 'react-icons/fa';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const C = COLORS.customerPrimary;

    if (cartItems.length === 0) {
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
                <FaShoppingBag size={60} color="#cbd5e1" />
                <h2 style={{ color: '#64748b', marginTop: 16 }}>السلة فارغة</h2>
                <p style={{ color: '#94a3b8', marginBottom: 24 }}>تصفح المتجر وأضف منتجاتك المفضلة</p>
                <Link to="/store" style={{
                    display: 'inline-block', padding: '12px 28px', backgroundColor: C, color: 'white',
                    borderRadius: 10, textDecoration: 'none', fontWeight: 600
                }}>تصفح المتجر</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>سلة المشتريات ({cartItems.length})</h2>
                <button onClick={clearCart} style={{
                    padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600
                }}>تفريغ السلة</button>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                    {cartItems.map(item => (
                        <div key={item._id} style={{
                            display: 'flex', gap: 16, backgroundColor: 'white', borderRadius: 14,
                            padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 10, backgroundColor: '#f1f5f9',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0
                            }}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: 10 }} />
                                ) : (
                                    <FaPills size={24} color="#cbd5e1" />
                                )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                                <div style={{ color: C, fontWeight: 700, fontSize: 16 }}>{item.sellingPrice} ج.م</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={qtyBtn}>
                                    {item.quantity === 1 ? <FaTrash size={10} color="#dc2626" /> : <FaMinus size={10} />}
                                </button>
                                <span style={{ padding: '6px 14px', fontWeight: 600, fontSize: 14, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={qtyBtn}><FaPlus size={10} /></button>
                            </div>

                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16, minWidth: 80, textAlign: 'left' }}>
                                {(item.sellingPrice * item.quantity).toFixed(2)}
                            </div>

                            <button onClick={() => removeFromCart(item._id)} style={{
                                padding: 8, backgroundColor: '#fee2e2', color: '#dc2626',
                                border: 'none', borderRadius: 6, cursor: 'pointer'
                            }}><FaTrash size={12} /></button>
                        </div>
                    ))}
                </div>

                <div style={{
                    width: 300, backgroundColor: 'white', borderRadius: 14,
                    padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'sticky', top: 84, height: 'fit-content'
                }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>ملخص الطلب</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#64748b' }}>
                        <span>عدد المنتجات</span><span>{cartItems.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 14, color: '#64748b' }}>
                        <span>إجمالي القطع</span><span>{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
                    </div>
                    <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
                        <span>الإجمالي</span><span>{cartTotal.toFixed(2)} ج.م</span>
                    </div>

                    {user ? (
                        <button onClick={() => navigate('/checkout')} style={{
                            width: '100%', padding: 14, backgroundColor: C, color: 'white',
                            border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700
                        }}>إتمام الطلب</button>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>سجل دخولك لإتمام الطلب</p>
                            <Link to="/login" style={{
                                display: 'block', padding: 14, backgroundColor: C, color: 'white',
                                borderRadius: 10, textDecoration: 'none', fontSize: 16, fontWeight: 700, textAlign: 'center'
                            }}>تسجيل الدخول</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const qtyBtn = { padding: '8px 10px', backgroundColor: '#f8fafc', border: 'none', cursor: 'pointer' };

export default Cart;
