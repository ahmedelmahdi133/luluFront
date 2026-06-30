import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PHARMACY_NAME } from '../../utils/constants';
import { sanitizeInput, validateEmail, validatePhone, validateName, validatePassword } from '../../utils/security';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const safeName = sanitizeInput(form.name);
        const safeEmail = sanitizeInput(form.email);
        const safePhone = sanitizeInput(form.phone);
        const safeAddress = sanitizeInput(form.address);

        if (!validateName(safeName)) { toast.error('الاسم يجب أن يحتوي على أحرف فقط'); return; }
        if (!validateEmail(safeEmail)) { toast.error('البريد الإلكتروني غير صالح'); return; }
        if (form.phone && !validatePhone(safePhone)) { toast.error('رقم الهاتف غير صالح'); return; }
        if (!validatePassword(form.password)) { toast.error('كلمة المرور يجب أن لا تقل عن 8 أحرف'); return; }
        if (form.password !== form.confirmPassword) { toast.error('كلمة المرور غير متطابقة'); return; }

        setLoading(true);
        try {
            await register({ name: safeName, email: safeEmail, password: form.password, phone: safePhone, address: safeAddress });
            toast.success('تم إنشاء حسابك بنجاح!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-[calc(100vh-124px)] flex justify-center items-center py-8 px-5 bg-slate-50" dir="rtl">
            <div className="w-full max-w-[480px] bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 inline-flex justify-center items-center text-white font-black text-xl mb-3 shadow-sm">ج</div>
                    <h2 className="m-0 mb-1 text-2xl font-bold text-slate-800">إنشاء حساب جديد</h2>
                    <p className="text-[13px] font-semibold text-slate-400 m-0">{PHARMACY_NAME}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-1.5">الاسم الكامل</label>
                        <input 
                            required value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border" 
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-1.5">البريد الإلكتروني</label>
                        <input 
                            type="email" required value={form.email} 
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border text-left" dir="ltr" 
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[13px] font-bold text-slate-600 mb-1.5">كلمة المرور</label>
                            <input 
                                type="password" required minLength={8} value={form.password} 
                                onChange={e => setForm({ ...form, password: e.target.value })} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border text-left" dir="ltr" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[13px] font-bold text-slate-600 mb-1.5">تأكيد كلمة المرور</label>
                            <input 
                                type="password" required value={form.confirmPassword} 
                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border text-left" dir="ltr" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-1.5">رقم الهاتف</label>
                        <input 
                            value={form.phone} 
                            onChange={e => setForm({ ...form, phone: e.target.value })} 
                            placeholder="01xxxxxxxxx" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border text-left" dir="ltr" 
                        />
                    </div>
                    <div className="pb-2">
                        <label className="block text-[13px] font-bold text-slate-600 mb-1.5">العنوان</label>
                        <input 
                            value={form.address} 
                            onChange={e => setForm({ ...form, address: e.target.value })} 
                            placeholder="عنوان التوصيل" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border" 
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading} 
                        className={`w-full py-3.5 text-white border-none rounded-xl cursor-pointer text-base font-bold transition-all shadow-md ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-lg'}`}
                    >
                        {loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}
                    </button>
                </form>

                <p className="text-center mt-6 text-[13px] font-semibold text-slate-500">
                    لديك حساب بالفعل؟ <Link to="/login" className="text-teal-600 font-bold no-underline hover:underline">تسجيل الدخول</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
