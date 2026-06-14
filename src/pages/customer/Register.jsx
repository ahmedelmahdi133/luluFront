import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { COLORS, PHARMACY_NAME } from '../../utils/constants';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const C = COLORS.customerPrimary;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) { toast.error('كلمة المرور غير متطابقة'); return; }
        if (form.password.length < 8) { toast.error('كلمة المرور يجب أن لا تقل عن 8 أحرف'); return; }
        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address });
            toast.success('تم إنشاء حسابك بنجاح!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 124px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 20px', backgroundColor: '#f8fafc' }}>
            <div style={{ width: '100%', maxWidth: 480, backgroundColor: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>ج</div>
                    <h2 style={{ margin: '0 0 4px', fontSize: 22, color: '#1e293b' }}>إنشاء حساب جديد</h2>
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{PHARMACY_NAME}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={lblStyle}>الاسم الكامل</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inpStyle} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={lblStyle}>البريد الإلكتروني</label>
                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inpStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                        <div style={{ flex: 1 }}>
                            <label style={lblStyle}>كلمة المرور</label>
                            <input type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inpStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={lblStyle}>تأكيد كلمة المرور</label>
                            <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={inpStyle} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={lblStyle}>رقم الهاتف</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" style={inpStyle} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={lblStyle}>العنوان</label>
                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="عنوان التوصيل" style={inpStyle} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: 14, backgroundColor: loading ? '#94a3b8' : C, color: 'white',
                        border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: 16, fontWeight: 700
                    }}>{loading ? 'جاري التسجيل...' : 'إنشاء الحساب'}</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
                    لديك حساب بالفعل؟ <Link to="/login" style={{ color: C, fontWeight: 600, textDecoration: 'none' }}>تسجيل الدخول</Link>
                </p>
            </div>
        </div>
    );
};

const lblStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 };
const inpStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export default Register;
