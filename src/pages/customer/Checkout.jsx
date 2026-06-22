import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FaCheckCircle, FaMapMarkerAlt, FaPhone, FaStickyNote } from 'react-icons/fa';
import { sanitizeInput, validatePhone } from '../../utils/security';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ deliveryAddress: user?.address || '', customerPhone: user?.phone || '', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) { toast.error('السلة فارغة'); return; }

        const safeAddress = sanitizeInput(form.deliveryAddress);
        const safePhone = sanitizeInput(form.customerPhone);
        const safeNotes = sanitizeInput(form.notes);

        if (!safeAddress) { toast.error('يرجى إدخال عنوان التوصيل'); return; }
        if (!validatePhone(safePhone)) { toast.error('رقم الهاتف غير صالح'); return; }

        setSubmitting(true);
        try {
            await api.post('/store/orders', {
                orderItems: cartItems.map(i => ({ productId: i.id, quantity: i.quantity })),
                deliveryAddress: safeAddress,
                customerPhone: safePhone,
                notes: safeNotes
            });
            clearCart();
            toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً');
            navigate('/my-orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-5" dir="rtl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">إتمام الطلب</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="m-0 mb-5 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">بيانات التوصيل</h3>
                    
                    <div className="mb-4">
                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 mb-2">
                            <FaMapMarkerAlt className="text-slate-400" /> عنوان التوصيل
                        </label>
                        <textarea 
                            required rows={3} value={form.deliveryAddress}
                            onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                            placeholder="العنوان التفصيلي للتوصيل..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-y" 
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 mb-2">
                            <FaPhone className="text-slate-400" /> رقم الهاتف
                        </label>
                        <input 
                            required type="tel" value={form.customerPhone}
                            onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-left" dir="ltr" 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-600 mb-2">
                            <FaStickyNote className="text-slate-400" /> ملاحظات (اختياري)
                        </label>
                        <input 
                            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="أي ملاحظات على الطلب..." 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all" 
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="m-0 mb-4 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">ملخص الطلب</h3>
                    <div className="space-y-3 mb-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between pb-2 border-b border-slate-50 last:border-0 text-sm">
                                <span className="text-slate-600 font-medium">{item.name} <span className="text-slate-400 text-xs mx-1">x</span>{item.quantity}</span>
                                <span className="font-bold text-slate-800">{(item.sellingPrice * item.quantity).toFixed(2)} <span className="text-xs font-semibold">ج.م</span></span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-4 border-t-2 border-slate-100 text-xl font-black text-slate-800">
                        <span>الإجمالي</span>
                        <span className="text-teal-600">{cartTotal.toFixed(2)} <span className="text-sm font-bold text-teal-600/70">ج.م</span></span>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-2 mb-0">الدفع عند الاستلام (كاش)</p>
                </div>

                <button 
                    type="submit" disabled={submitting} 
                    className={`w-full py-4 rounded-xl text-lg font-bold flex justify-center items-center gap-2 border-none transition-all shadow-md ${submitting ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'}`}
                >
                    <FaCheckCircle /> {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;
