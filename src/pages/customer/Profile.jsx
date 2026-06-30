import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSave } from 'react-icons/fa';
import { sanitizeInput, validateName, validatePhone } from '../../utils/security';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const safeName = sanitizeInput(form.name);
        const safePhone = sanitizeInput(form.phone);
        const safeAddress = sanitizeInput(form.address);

        if (!validateName(safeName)) { toast.error('الاسم يجب أن يحتوي على أحرف فقط'); return; }
        if (form.phone && !validatePhone(safePhone)) { toast.error('رقم الهاتف غير صالح'); return; }

        setSaving(true);
        try {
            await updateProfile({ name: safeName, phone: safePhone, address: safeAddress });
            toast.success('تم تحديث البيانات');
        } catch { toast.error('حدث خطأ'); }
        finally { setSaving(false); }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-5" dir="rtl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">الملف الشخصي</h2>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-full bg-teal-50 flex justify-center items-center shrink-0">
                        <FaUser size={26} className="text-teal-600" />
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-800 mb-1">{user?.name}</div>
                        <div className="text-sm font-semibold text-slate-400">{user?.email}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">الاسم</label>
                        <input 
                            required value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">رقم الهاتف</label>
                        <input 
                            value={form.phone} 
                            onChange={e => setForm({ ...form, phone: e.target.value })} 
                            placeholder="01xxxxxxxxx" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border text-left" dir="ltr"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">العنوان</label>
                        <textarea 
                            rows={3} value={form.address} 
                            onChange={e => setForm({ ...form, address: e.target.value })} 
                            placeholder="عنوان التوصيل الافتراضي..." 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all box-border resize-y" 
                        />
                    </div>
                    
                    <button 
                        type="submit" disabled={saving} 
                        className={`mt-4 px-6 py-3.5 text-white border-none rounded-xl cursor-pointer text-[15px] font-bold flex items-center justify-center gap-2 transition-all shadow-md ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-lg'}`}
                    >
                        <FaSave size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
