import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';
import { FaUser, FaSave } from 'react-icons/fa';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
    const [saving, setSaving] = useState(false);
    const C = COLORS.customerPrimary;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(form);
            toast.success('تم تحديث البيانات');
        } catch { toast.error('حدث خطأ'); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '30px 20px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>الملف الشخصي</h2>

            <div style={{ backgroundColor: 'white', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%', backgroundColor: `${C}15`,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <FaUser size={24} color={C} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: '#1e293b' }}>{user?.name}</div>
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>{user?.email}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={lblStyle}>الاسم</label>
                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inpStyle} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={lblStyle}>رقم الهاتف</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="01xxxxxxxxx" style={inpStyle} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={lblStyle}>العنوان</label>
                        <textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="عنوان التوصيل الافتراضي..." style={{ ...inpStyle, resize: 'vertical' }} />
                    </div>
                    <button type="submit" disabled={saving} style={{
                        padding: '12px 28px', backgroundColor: C, color: 'white',
                        border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                        fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        <FaSave /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const lblStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 };
const inpStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

export default Profile;
