import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';
import { FaCheckCircle, FaMapMarkerAlt, FaPhone, FaStickyNote } from 'react-icons/fa';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ deliveryAddress: user?.address || '', customerPhone: user?.phone || '', notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const C = COLORS.customerPrimary;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) { toast.error('السلة فارغة'); return; }
        setSubmitting(true);
        try {
            await api.post('/store/orders', {
                orderItems: cartItems.map(i => ({ productId: i._id, quantity: i.quantity })),
                deliveryAddress: form.deliveryAddress,
                customerPhone: form.customerPhone,
                notes: form.notes
            });
            clearCart();
            toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً');
            navigate('/my-orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
        } finally { setSubmitting(false); }
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '30px 20px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>إتمام الطلب</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>بيانات التوصيل</h3>
                    <div style={{ marginBottom: 16 }}>
                        <label style={lblStyle}><FaMapMarkerAlt style={{ marginLeft: 4 }} /> عنوان التوصيل</label>
                        <textarea required rows={3} value={form.deliveryAddress}
                            onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                            placeholder="العنوان التفصيلي للتوصيل..."
                            style={{ ...inpStyle, resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={lblStyle}><FaPhone style={{ marginLeft: 4 }} /> رقم الهاتف</label>
                        <input required type="tel" value={form.customerPhone}
                            onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                            placeholder="01xxxxxxxxx"
                            style={inpStyle} />
                    </div>
                    <div>
                        <label style={lblStyle}><FaStickyNote style={{ marginLeft: 4 }} /> ملاحظات (اختياري)</label>
                        <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="أي ملاحظات على الطلب..." style={inpStyle} />
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#1e293b' }}>ملخص الطلب</h3>
                    {cartItems.map(item => (
                        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                            <span style={{ color: '#475569' }}>{item.name} x{item.quantity}</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{(item.sellingPrice * item.quantity).toFixed(2)} ج.م</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 8, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                        <span>الإجمالي</span><span>{cartTotal.toFixed(2)} ج.م</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>الدفع عند الاستلام (كاش)</p>
                </div>

                <button type="submit" disabled={submitting} style={{
                    width: '100%', padding: 16, backgroundColor: submitting ? '#94a3b8' : C,
                    color: 'white', border: 'none', borderRadius: 12, cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: 18, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                }}>
                    <FaCheckCircle /> {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
            </form>
        </div>
    );
};

const lblStyle = { display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 };
const inpStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export default Checkout;
